import React from "react";

interface PageProps {
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ children }: PageProps) => {
  return <div className="page flex flex-col gap-5">{children}</div>;
};

export default Page;
