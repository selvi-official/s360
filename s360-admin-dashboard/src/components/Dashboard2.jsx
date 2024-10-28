import React from 'react';
import { Grid, Box} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
  import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
  } from '@mui/material';
  import { createTheme, ThemeProvider } from '@mui/material/styles';


    // Sample data structure

const Dashboard2 = () => {

  const accounts = [
    {
      accountName: 'dbaas-prod',
      businessUnit: 'Cloud Engineering',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 188745.00,
      cost: 123679.42,
      forecast: 230252.61,
      budgetForecastDiff: 41507.61,
      actualBudgetDiff: 65065.58,
      budgetForecastOvershot: 121.99,
    },
    {
      accountName: 'freshdesk-freddy-prod',
      businessUnit: 'CX BU',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 131570.00,
      cost: 72074.39,
      forecast: 142025.94,
      budgetForecastDiff: 10455.94,
      actualBudgetDiff: 59495.61,
      budgetForecastOvershot: 107.95,
    },
    {
      accountName: 'haystack-prod',
      businessUnit: 'Cloud Engineering',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 616132.00,
      cost: 438093.24,
      forecast: 622564.16,
      budgetForecastDiff: 6432.16,
      actualBudgetDiff: 178038.76,
      budgetForecastOvershot: 101.04,
    },
    {
      accountName: 'dbaas-app-staging',
      businessUnit: 'Cloud Engineering',
      monthYear: 'Oct-2024',
      type: 'R&D',
      budget: 43018.00,
      cost: 27511.51,
      forecast: 49039.88,
      budgetForecastDiff: 6021.88,
      actualBudgetDiff: 15502.89,
      budgetForecastOvershot: 114.00,
    },
    {
      accountName: 'platform-mcr-prod',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 58503.00,
      cost: 34480.74,
      forecast: 62537.07,
      budgetForecastDiff: 4484.07,
      actualBudgetDiff: 23722.26,
      budgetForecastOvershot: 107.72,
    },
    {
      accountName: 'freshapps-prod',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 60460.44,
      cost: 35267.36,
      forecast: 63893.45,
      budgetForecastDiff: 3519.45,
      actualBudgetDiff: 25376.64,
      budgetForecastOvershot: 105.36,
    },
    {
      accountName: 'freddy-prod',
      businessUnit: 'IT BU',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 222355.00,
      cost: 17126.62,
      forecast: 248886.68,
      budgetForecastDiff: 2531.68,
      actualBudgetDiff: 5228.38,
      budgetForecastOvershot: 111.32,
    },
    {
      accountName: 'dp-search-prod',
      businessUnit: 'Cloud Engineering',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 203932.00,
      cost: 143021.76,
      forecast: 205655.62,
      budgetForecastDiff: 1723.62,
      actualBudgetDiff: 60910.24,
      budgetForecastOvershot: 100.85,
    },
    {
      accountName: 'platform-freshid-prod',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 51063.00,
      cost: 29872.22,
      forecast: 52724.33,
      budgetForecastDiff: 1661.33,
      actualBudgetDiff: 21910.78,
      budgetForecastOvershot: 103.25,
    },
    {
      accountName: 'platform-freshbots-staging',
      businessUnit: 'CX BU',
      monthYear: 'Oct-2024',
      type: 'R&D',
      budget: 11789.00,
      cost: 6787.01,
      forecast: 13362.22,
      budgetForecastDiff: 1573.22,
      actualBudgetDiff: 5001.99,
      budgetForecastOvershot: 113.34,
    },
    {
      accountName: 'freddy-freshservice-datascience-prod',
      businessUnit: 'IT BU',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 6435.00,
      cost: 4441.60,
      forecast: 7786.24,
      budgetForecastDiff: 1351.24,
      actualBudgetDiff: 1993.40,
      budgetForecastOvershot: 121.00,
    },
    {
      accountName: 'platform-hypertrail-prod',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 5685.00,
      cost: 3803.66,
      forecast: 6789.66,
      budgetForecastDiff: 1194.66,
      actualBudgetDiff: 1813.34,
      budgetForecastOvershot: 121.01,
    },
    {
      accountName: 'platform-search-aurora-staging',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'R&D',
      budget: 4392.00,
      cost: 2708.05,
      forecast: 5545.15,
      budgetForecastDiff: 1126.15,
      actualBudgetDiff: 1683.95,
      budgetForecastOvershot: 126.46,
    },
    {
      accountName: 'platform-antispam-prod',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 20118.00,
      cost: 12541.52,
      forecast: 21144.34,
      budgetForecastDiff: 1026.34,
      actualBudgetDiff: 7576.48,
      budgetForecastOvershot: 105.10,
    },
    {
      accountName: 'platform-central-staging',
      businessUnit: 'Platforms',
      monthYear: 'Oct-2024',
      type: 'R&D',
      budget: 3702.00,
      cost: 2567.29,
      forecast: 4460.76,
      budgetForecastDiff: 758.76,
      actualBudgetDiff: 1134.71,
      budgetForecastOvershot: 120.50,
    },
    {
      accountName: 'fresh-orchestrator-prod',
      businessUnit: 'IT BU',
      monthYear: 'Oct-2024',
      type: 'R&D',
      budget: 29837.00,
      cost: 16354.22,
      forecast: 30142.80,
      budgetForecastDiff: 755.79,
      actualBudgetDiff: 1320.98,
      budgetForecastOvershot: 102.57,
    },
    {
      accountName: 'sandbox-wildcard-accounts',
      businessUnit: 'Cloud Engineering',
      monthYear: 'Oct-2024',
      type: 'COGS',
      budget: 99999.00,
      cost: 50000.00,
      forecast: 55000.00,
      budgetForecastDiff: 5001.00,
      actualBudgetDiff: 7000.00,
      budgetForecastOvershot: 105.00,
    }
  ];

  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            fontSize: '1rem', // Increase font size for the entire DataGrid
            textAlign: 'center',
            
          },
          columnHeaders: {
            fontSize: '1.2rem', // Increase font size for column headers
            textAlign: 'center',
            
            
          },
          cell: {
            fontSize: '1rem', // Increase font size for cell content
            color: '#ffffff',
            textAlign: 'center',
          },
        },
      },
    },
  });

  const yearlyRows = [
    { id: 1, monthYear: "Oct-2024", budget: "$4,882,873.00", cost: "$3,021,660.51", forecast: "$4,553,797.02", actualBudgetDiff: "$1,861,212.49" },
    { id: 2, monthYear: "Aug-2024", budget: "$4,750,778.00", cost: "$4,247,036.67", forecast: "$0.00", actualBudgetDiff: "$503,741.33" },
    { id: 3, monthYear: "Sep-2024", budget: "$4,540,603.00", cost: "$4,479,034.53", forecast: "$0.00", actualBudgetDiff: "$61,568.47" },
    { id: 4, monthYear: "Total", budget: "$14,174,254.00", cost: "$11,747,731.71", forecast: "$4,553,797.02", actualBudgetDiff: "$2,426,522.29" },
  ];
  
  // Define columns
  const yearlyColumns = [
    { field: 'monthYear', headerName: 'MONTH YEAR', width: 130 },
    { field: 'budget', headerName: 'BUDGET', width: 130, align: 'center', headerAlign: 'center' },
    { field: 'cost', headerName: 'COST', width: 130, align: 'center', headerAlign: 'center' },
    { field: 'forecast', headerName: 'FORECAST', width: 130, align: 'center', headerAlign: 'center' },
    { field: 'actualBudgetDiff', headerName: 'ACTUAL BUDGET DIFF', width: 130, align: 'center', headerAlign: 'center' }
  ];

  
  const stats = [
    { coverage: '99.90%', label: 'RI Coverage EC2', utilization: '99.31%', labelUtilization: 'RI Utilization EC2' },
    { coverage: '86.63%', label: 'RI Coverage RDS', utilization: '98.82%', labelUtilization: 'RI Utilization RDS' },
    { coverage: '76.15%', label: 'RI Coverage Redshift', utilization: '55.80%', labelUtilization: 'RI Utilization Redshift' },
  ];
  const columns = [
    { field: 'accountName', headerName: 'Account Name', width: 150 },
    { field: 'businessUnit', headerName: 'Business Unit', width: 150 },
    { field: 'monthYear', headerName: 'Month Year', width: 150 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'budget', headerName: 'Budget', width: 100},
    { field: 'cost', headerName: 'Cost', width: 100},
    { field: 'forecast', headerName: 'Forecast', width: 100},
    { field: 'budgetForecastDiff', headerName: 'Budget Diff', width: 150},
    { field: 'actualBudgetDiff', headerName: 'Actual Budget Diff', width: 150},
    { field: 'budgetForecastOvershot', headerName: '% Overshot', width: 100},
  ];
  
  const rows = accounts.map((account, index) => ({
    id: index,
    accountName: account.accountName,
    businessUnit: account.businessUnit,
    monthYear: account.monthYear,
    type: account.type,
    budget: account.budget,
    cost: account.cost,
    forecast: account.forecast,
    budgetForecastDiff: account.budgetForecastDiff,
    actualBudgetDiff: account.actualBudgetDiff,
    budgetForecastOvershot: account.budgetForecastOvershot,
  }));

  
  const totalBudget = accounts.reduce((acc, account) => acc + account.budget, 0).toFixed(2);
  const totalCost = accounts.reduce((acc, account) => acc + account.cost, 0).toFixed(2);
  const totalForecast = accounts.reduce((acc, account) => acc + account.forecast, 0).toFixed(2);

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
               <Grid
                  container
                  align="center"
                  justifyContent="space-around"
                  alignItems="center"
                  padding="10px 0px 10px 0px"
                >
                    <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      
                      borderRadius: 5,
                      height: '200px', // Fixed height
                      overflowY: 'scroll',
                      width: '48%', // Fixed height
                      overflowX: 'auto',
                      position: 'relative'
                    }}
                    backgroundColor="#1B1D2A"
                  >

                      <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                        {stats.map((stat, index) => (
                          <Grid item key={index} xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h5">{stat.coverage}</Typography>
                              <Typography variant="body2">{stat.label}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ marginTop: '10px' }}>
                        {stats.map((stat, index) => (
                          <Grid item key={index} xs={4}>
                            <Box textAlign="center">
                              <Typography variant="h5">{stat.utilization}</Typography>
                              <Typography variant="body2">{stat.labelUtilization}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
    
                  </Grid>
                  <Grid
                    item
                    justifyContent="space-evenly"
                    sx={{
                      
                      borderRadius: 5,
                      height: '200px', // Fixed height
                      width: '48%', // Fixed height
                      overflowY: 'scroll',
                      position: 'relative'
                    }}
                  >
                  <DataGrid
                      rows={yearlyRows}
                      columns={yearlyColumns}
                      hideFooter
                      disableSelectionOnClick
                    />
                   
                  </Grid>
                  </Grid>

                  
                </Grid>
        {/* Detailed Account Budget & Forecast Table */}
        <Grid item xs={12}>
        <ThemeProvider theme={theme}>
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            sx={{
              '.MuiDataGrid-footerContainer': {
                position: 'sticky',
                bottom: 0,
                zIndex: 1,
                color: 'white', // Change text color to white
                backgroundColor: '#1B1D2A', // Optional: Change background color for better contrast
              },
              '.MuiTablePagination-root': {
                color: 'white', // Change paginator text color to white
              },
              '.MuiTablePagination-selectIcon': {
                color: 'white', // Change paginator select icon color to white
              },
              '.MuiTablePagination-actions': {
                color: 'white', // Change paginator actions color to white
              },
            }}
          />
          </ThemeProvider>
        </Grid>
    </Box>
  );
};

export default Dashboard2;