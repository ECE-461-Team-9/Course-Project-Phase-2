import React from 'react';

interface Package {
    id: number;
    name: string;
    description: string;
}

interface TopPackagesProps {
    packages?: Package[];
}

const TopPackages: React.FC<TopPackagesProps> = ({ packages }) => {
    if (!packages) {
        return (
            <div className="flex flex-col gap-5 flex-1 bg-gray-100 p-10 rounded">
                <h2 className="font-extrabold text-2xl">Top Packages</h2>
                <p>Not packages available.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Top Packages</h2>
            <ul>
                {packages.map(pkg => (
                    <li key={pkg.id}>
                        <h3>{pkg.name}</h3>
                        <p>{pkg.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopPackages;