import React, { useState, useEffect } from "react";
import { Grid, Typography, useTheme } from "@mui/material";
import { savings , potentialSavings as pot_savings, WoWTopAccounts as topAccounts, WoWAccountsIdleResources as initialIdleResources } from "../data/testPeData";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { tokens } from "../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PotentialSavingsTable,  CustomizedChartWoWSavings , CustomizedChartWoWTopAccounts, IdleResourcesTable } from "../components/PECustomCharts";

const Dashboard1 = ({ filter1, filter2, filter3 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [idleResources, setIdleResources] = useState(initialIdleResources);
  const [topAccs, setTopAccounts] = useState(topAccounts);
  const [potential_sav, setPotSavings] = useState(pot_savings);

  console.log(idleResources)

  const [selectedDashboard, setSelectedDashboard] = useState("Dashboard1");

  useEffect(() => {
    // Apply filters to the data
    const filteredIdleRes = idleResources.filter(item => 
      item.account_name === filter1 || item.region === filter2 || item.resource_type === filter3
    );
    setIdleResources(filteredIdleRes);

    const filteredTopAccounts = Object.keys(topAccs).reduce((acc, key) => {
      if (key === filter1) {
        acc[key] = topAccs[key];
      }
      return acc;
    }, {});
    setTopAccounts(filteredTopAccounts);

    const filteredPotSavings = Object.keys(potential_sav).reduce((acc, key) => {
      if (key === filter1) {
        acc[key] = potential_sav[key];
      }
      return acc;
    }, {});
    setPotSavings(filteredPotSavings);

  }, [filter1, filter2, filter3]);



  // Handle dropdown change
  const handleDashboardChange = (event) => {
    setSelectedDashboard(event.target.value);
  };


  return (
    <>

              <div style={{backgroundColor: "#1B1D2A"}}>
                <Grid
                  container
                  align="center"
                  spacing={2}
                  justifyContent="space-around"
                  alignItems="center"
                  padding="40px 40px 0px 0px"
                    sx={{
                        borderRadius: 2,
                        margin: 2,
                        width: "100%",
                    }}
                >
                    <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5,
                      height: '400px', // Fixed height
                      overflowY: 'scroll',
                      width: '48%', // Fixed height
                      overflowX: 'auto',
                      position: 'relative'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" alignItems="center"   sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: colors.primary[400],
                        padding: '10px 0'
                        }}
                    >
                    WoW Comparison of Potential Savings of Top 5 Accounts
                    </Typography>
                    { console.log(potential_sav, potential_sav.length) }
                    {potential_sav  ?  (
                        <PotentialSavingsTable data={potential_sav} />
                        ) : (
                        <p>No data available</p>
                        )}
                  </Grid>
                  <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5,
                      height: '400px', // Fixed height
                      width: '48%', // Fixed height
                      position: 'relative'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" alignItems="center"   sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: colors.primary[400],
                        padding: '10px 0'
                        }}
                    >
                    WoW Comparison of Potential Savings of Top 5 Accounts
                    </Typography>
                    { console.log(topAccs, topAccs.length) }
                    {topAccs ?  (
                        <CustomizedChartWoWTopAccounts data={topAccs} />
                        ) : (
                        <p>No data available</p>
                        )}
                  </Grid>

                  
                </Grid>
                <Grid
                  container
                  align="center"
                  spacing={2}
                  justifyContent="space-around"
                  alignItems="center"
                  padding="40px 40px 40px 0px"
                    sx={{
                        borderRadius: 2,
                        margin: 2,
                        width: "100%",
                    }}
                >
                    <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5,
                      height: '400px', // Fixed height
                      overflowY: 'scroll',
                      width: '48%', // Fixed height
                      overflowX: 'auto',
                      position: 'relative'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" alignItems="center"   sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: colors.primary[400],
                        padding: '10px 0'
                        }}
                    >
                      Potential Savings of Resources currently Idle
                    </Typography>
                    {idleResources ?  (
                        <IdleResourcesTable data={idleResources} />
                        ) : (
                        <p>No data available</p>
                        )}
                  </Grid>
                   
                  <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5,
                      height: '400px', // Fixed height
                      width: '48%', // Fixed height
                      position: 'relative'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" alignItems="center"   sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        backgroundColor: colors.primary[400],
                        padding: '10px 0'
                        }}
                    >
                      WoW Comparison of Potential Savings/Idle Resources
                    </Typography>
                    {savings && savings.length > 0 ?  (
                        <CustomizedChartWoWSavings data={savings} />
                        ) : (
                        <p>No data available</p>
                        )}
                  </Grid>

                  
                </Grid>
                </div>
                
                
    </>
  );
};

export default Dashboard1;