import React from "react";
import { AWSBudgetOverview } from "../components/PECustomCharts";
import { budgetData } from "../data/testPeData";

const Dashboard3 = () => {
  return (
    <div >
      <AWSBudgetOverview data={budgetData} />
    </div>
  );
};

export default Dashboard3;