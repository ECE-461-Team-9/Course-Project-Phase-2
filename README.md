# Project README

## Overview
This project implements a RESTful API adhering to the OpenAPI Specification. It provides endpoints for managing, rating, uploading, downloading, and searching for packages. Designed for extensibility and security, the API includes:

- Package ingestion from npm.
- Features like version pinning and package rating.
- ADA-compliant web interface.
- Deployment and CI/CD integrations with AWS and GitHub Actions.
- Security case analysis using ThreatModeler.

## Features

- **Upload & Update Packages:** Allows users to add new packages or update existing ones.
- **Search & Directory:** Provides search capabilities and a package directory.
- **Rate & Download:** Enables rating and downloading packages.
- **Version Pinning:** Ensures version compatibility and stability.

## Requirements

- TypeScript
- AWS SDK
- GitHub Actions for CI/CD
- npm (for package ingestion)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/yourrepository.git
   ```

2. Navigate to the project directory:
   ```bash
   cd yourrepository
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   export GITHUB_TOKEN="insert here"
   export LOG_FILE="/tmp/checker.log"
   export LOG_LEVEL=2
   ```

## Usage

1. Deploy the application via GitHub Actions.
2. Access the API at:
   ```
   https://med4k766h1.execute-api.us-east-1.amazonaws.com/prod
   ```
3. Access the Web UI at:
   ```
   https://ece-461-team-9.github.io
   ```

## Deployment

1. Ensure GitHub Actions is configured for deployment.
2. Push changes to the `main` branch to trigger a deployment pipeline.
3. Monitor the deployment via AWS Management Console.

## Development

- **Run Tests:**
  ```bash
  npm test
  ```

- **Start Local Development:**
  ```bash
  npm run dev
  ```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For additional details, consult the OpenAPI specification file (`spec.yaml`).

