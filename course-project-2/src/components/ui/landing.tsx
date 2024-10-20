import { Package2 } from "lucide-react";
import React from "react";
import { Button } from "./button";

const Landing: React.FC = () => {
  return (
    <div className="inline-flex flex-col primary-bg gap-20 max-h-200 p-4 text-2xl font-extrabold rounded">
      <h1><span className="inline-flex w-full">A better package registry for Acme. <Package2 className="h-20 w-20 black"/></span></h1>
      <p>
        With each package vetted for Acme Inc. projects, you'll never have to
        worry about a package working with your codebase again.
      </p>
      <Button variant="link" className="bg-transparent focus:outline-none hover:outline-none">Sign in with company credentials today.</Button>
    </div>
  );
};

export default Landing;
