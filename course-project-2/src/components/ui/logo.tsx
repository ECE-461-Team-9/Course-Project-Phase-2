import React from "react";
import { Link } from "react-router-dom";
import { Package2 } from "lucide-react";

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold secondary-bg p-2 rounded">
      <Package2 className="h-6 w-6 tertiary" />
      <span className="tertiary">Acme Inc</span>
    </Link>
  );
};

export default Logo;
