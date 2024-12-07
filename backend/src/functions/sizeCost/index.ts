import * as tar from "tar-stream";
import * as zlib from "zlib";
import { S3Client, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as unzipper from "unzipper";
import axios from "axios";

const s3Client = new S3Client({});
const dynamoDb = new DynamoDBClient({});
const TABLE_NAME = "PackageRegistry";
const BUCKET_NAME = "storage-phase-2";

interface PackageItem {
  ID: string;
  Name: string;
  Version: string;
  s3Key: string;
}

interface PackageJson {
  dependencies?: Record<string, string>;
}

// Utility to ensure consistent rounding
const roundToPrecision = (value: number, precision: number = 3): number =>
  Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

const calculateTarballSize = async (tarballUrl: string): Promise<number> => {
  const response = await axios.get(tarballUrl, { responseType: "stream" });

  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    const gunzip = zlib.createGunzip();
    let totalSize = 0;

    extract.on("entry", (header, stream, next) => {
      let fileSize = 0;
      stream.on("data", (chunk) => (fileSize += chunk.length));
      stream.on("end", () => {
        totalSize += fileSize;
        next(); // Continue to the next file
      });
      stream.resume(); // Drain the stream
    });

    extract.on("finish", () => {
      const sizeInMB = totalSize / (1024 * 1024);
      resolve(sizeInMB);
    });

    extract.on("error", (err) => reject(err));
    response.data.pipe(gunzip).pipe(extract);
  });
};

async function getNpmPackageSize(name: string, version: string): Promise<number> {
  try {
    const npmApiUrl = `https://registry.npmjs.org/${name}`;
    const response = await axios.get(npmApiUrl);

    const versionData = response.data.versions[version] ||
      response.data.versions[response.data["dist-tags"].latest];

    if (!versionData?.dist?.tarball) return 0;

    const tarballUrl = versionData.dist.tarball;
    const tarballSize = await calculateTarballSize(tarballUrl);
    return roundToPrecision(Math.max(tarballSize, 0.001));
  } catch (error) {
    return 0;
  }
}

const getPackageById = async (id: string): Promise<PackageItem | null> => {
  try {
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "ID = :id",
      ExpressionAttributeValues: marshall({
        ":id": id,
      }),
    });

    const result = await dynamoDb.send(scanCommand);
    if (!result.Items || result.Items.length === 0) return null;

    return unmarshall(result.Items[0]) as PackageItem;
  } catch (error) {
    return null;
  }
};

const getPackageSize = async (s3Key: string): Promise<number> => {
  try {
    const key = s3Key.endsWith(".zip") ? s3Key : `${s3Key}.zip`;
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.ContentLength) return 0;

    return roundToPrecision(response.ContentLength / (1024 * 1024));
  } catch (error) {
    return 0;
  }
};

const extractPackageJson = async (s3Key: string): Promise<PackageJson | null> => {
  try {
    const key = s3Key.endsWith(".zip") ? s3Key : `${s3Key}.zip`;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) return null;

    const streamToBuffer = async (stream: any): Promise<Buffer> => {
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    };

    const buffer = await streamToBuffer(response.Body);
    const directory = await unzipper.Open.buffer(buffer);
    const packageJsonFile = directory.files.find(
      (f) => f.path.includes("package.json") && !f.path.includes("node_modules")
    );

    if (!packageJsonFile) return null;

    const content = await packageJsonFile.buffer();
    return JSON.parse(content.toString());
  } catch (error) {
    return null;
  }
};

const calculateDependenciesSize = async (packageItem: PackageItem): Promise<number> => {
  const visitedPackages = new Set<string>();
  const recursiveCalculateSize = async (name: string, version: string): Promise<number> => {
    const packageKey = `${name}@${version}`;
    if (visitedPackages.has(packageKey)) return 0;

    visitedPackages.add(packageKey);
    const npmSize = await getNpmPackageSize(name, version.replace(/[\^~]/, ""));
    let totalSize = npmSize;

    const packageJson = await extractPackageJson(`${name}-${version}.zip`);
    if (packageJson?.dependencies) {
      for (const [depName, depVersion] of Object.entries(packageJson.dependencies)) {
        totalSize += await recursiveCalculateSize(depName, depVersion);
      }
    }

    return totalSize;
  };

  const standaloneSize = await getPackageSize(packageItem.s3Key);
  const packageJson = await extractPackageJson(packageItem.s3Key);

  let totalSize = standaloneSize;
  if (packageJson?.dependencies) {
    for (const [name, version] of Object.entries(packageJson.dependencies)) {
      totalSize += await recursiveCalculateSize(name, version);
    }
  }

  return roundToPrecision(totalSize);
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const packageId = event.pathParameters?.id;
    const includeDependencies = event.queryStringParameters?.dependency === "true";

    if (!packageId || !/^[a-zA-Z0-9\-]+$/.test(packageId)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing or invalid PackageID" }),
      };
    }

    const packageItem = await getPackageById(packageId);
    if (!packageItem) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Package does not exist." }),
      };
    }

    const standaloneSize = await getPackageSize(packageItem.s3Key);

    if (includeDependencies) {
      const totalSize = await calculateDependenciesSize(packageItem);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [packageId]: {
            standaloneCost: roundToPrecision(standaloneSize),
            totalCost: roundToPrecision(totalSize),
          },
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [packageId]: {
          totalCost: roundToPrecision(standaloneSize),
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Unexpected error occurred." }),
    };
  }
};
