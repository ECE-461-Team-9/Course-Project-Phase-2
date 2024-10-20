import React from "react";
// import { Shell } from '@/components/ui/shell';
import Landing from "@/components/ui/landing";
import TopPackages from "@/components/ui/top-packages";
import Page from "@/components/ui/page";

const Home: React.FC = () => {
  return (
    <Page>
      <Landing />
      <TopPackages />
    </Page>
  );
};

export default Home;
