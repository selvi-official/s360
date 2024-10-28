import React, { useState } from "react";
import Dashboard1 from "../../components/Dashboard1";
import Dashboard2 from "../../components/Dashboard2";
import Dashboard3 from "../../components/Dashboard3";
import Dashboard4 from "../../components/Dashboard4";
import { Grid, Typography, Box, FormControl, Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import Sidebar from "../../components/SideFilter";  // Import Sidebar component

export const CostDashboards = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const defaultFilter1 = ["Option1", "freshworks-ci-tools-prod", "freshworks-ci-tools-prod2"];
  const defaultFilter2 = ["OptionA", "OptionB", "OptionC"];
  const defaultFilter3 = ["OptionX", "OptionY", "OptionZ"];

  const [filters, setFilters] = useState({
    filter1: defaultFilter1.map((item, index) => ({ value: item, label: item, selected: index === 0 })),
    filter2: defaultFilter2.map((item, index) => ({ value: item, label: item, selected: index === 0 })),
    filter3: defaultFilter3.map((item, index) => ({ value: item, label: item, selected: index === 0 }))
  });

  const [selectedDashboard, setSelectedDashboard] = useState("Dashboard1");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [report, setReport] = useState("AWS Cost Trend Analysis History");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const reportsLst = [
    { value: "Dashboard1", text: "AWS Cost Trend Analysis History" },
    { value: "Dashboard2", text: "AWS COST - BUDGET & FORECAST" },
    { value: "Dashboard3", text: "BU - Usage Report" },
    { value: "Dashboard4", text: "AWS Cost by Account and Service" }
  ];

  // Handle dropdown change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: prevFilters[name].map(option =>
        option.value === value ? { ...option, selected: true } : { ...option, selected: false }
      )
    }));
  };

  const handleReportChange = (event) => {
    setReport(event.target.value);
  };

  const handleChange = () => {
    setIsCollapsed(!isCollapsed);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const selectedFilter1 = filters.filter1.find(option => option.selected)?.value || "";
  const selectedFilter2 = filters.filter2.find(option => option.selected)?.value || "";
  const selectedFilter3 = filters.filter3.find(option => option.selected)?.value || "";

  return (
    <Grid container spacing={2} paddingTop="20px" paddingBottom="20px">
      <Grid item xs={9}>
        <Typography variant="h1" fontWeight="600" paddingLeft="10px">
          Cost Dashboards
        </Typography>
      </Grid>

      <Grid item xs={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: colors.grey[900], borderRadius: 1, height: '38px', maxWidth: '400px', minWidth: '400px' }}>
          <FormControl
            variant="outlined"
            sx={{
              flex: 1,
              backgroundColor: '#101012',
              borderRadius: '0 4px 4px 0',
              height: '100%',
              '& .MuiOutlinedInput-root': { height: '100%', padding: '0 10px' }
            }}
          >
            <Select value={report} onChange={handleReportChange} fullWidth>
              {reportsLst.map((option) => (
                <MenuItem key={option.text} value={option.value}>
                  {option.text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Grid>

      <Grid item xs={12} sm={isSidebarOpen ? 10 : 11}>
        <Box marginTop="20px">
          {report === 'Dashboard1' && <Dashboard1 filter1={selectedFilter1} filter2={selectedFilter2} filter3={selectedFilter3} />}
          {report === 'Dashboard2' && <Dashboard2 filter1={selectedFilter1} filter2={selectedFilter2} filter3={selectedFilter3} />}
          {report === 'Dashboard3' && <Dashboard3 filter1={selectedFilter1} filter2={selectedFilter2} filter3={selectedFilter3} />}
          {report === 'Dashboard4' && <Dashboard4 filter1={selectedFilter1} filter2={selectedFilter2} filter3={
