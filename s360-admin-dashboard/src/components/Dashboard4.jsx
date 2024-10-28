import React from "react";
import { AWSBudgetOverview } from "../components/PECustomCharts";
import { budgetData } from "../data/testPeData";
// import { PowerBIEmbed } from 'powerbi-client-react';
// import { models } from 'powerbi-client';

const Dashboard4 = () => {
  return (
    <div >
       {/* <PowerBIEmbed
        embedConfig={{
          type: 'report', // Use 'dashboard' for a dashboard
          id: datasetId,  // Report or dashboard ID
          embedUrl: embedUrl,  // Embed URL for the report
          accessToken: accessToken,  // Access token for authentication
          tokenType: models.TokenType.Embed,
          settings: {
            filterPaneEnabled: false,  // Disable filter pane if needed
            navContentPaneEnabled: false, // Disable navigation pane
          },
        }}
        cssClassName="embed-container"
        getEmbeddedComponent={(embeddedReport) => {
          console.log('Embedded PowerBI report:', embeddedReport);
        }}
      /> */}
    </div>
  );
};

export default Dashboard4;