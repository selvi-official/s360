import React, { useState } from "react";
import { ProSidebar, Menu } from "react-pro-sidebar";
import Dashboard1 from "../../components/Dashboard1";
import Dashboard2 from "../../components/Dashboard2";
import Dashboard3 from "../../components/Dashboard3";
import Dashboard4 from "../../components/Dashboard4";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Grid, Typography, Box, FormControl, Select, MenuItem, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

export const CostReport = () => {
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
    const newValue = !isCollapsed;
    const newValueSidebar = !isSidebarOpen;
    setIsCollapsed(newValue);
    setIsSidebarOpen(newValueSidebar);
  };

  const selectedFilter1 = filters.filter1.find(option => option.selected)?.value || "";
  const selectedFilter2 = filters.filter2.find(option => option.selected)?.value || "";
  const selectedFilter3 = filters.filter3.find(option => option.selected)?.value || "";

  return (
    <>
      <Grid container spacing={2} paddingTop="20px" paddingBottom="20px">
        <Grid item xs={9}>
          <Typography variant="h1" fontWeight="600" paddingLeft="10px">
            Cost Dashboards
          </Typography>
        </Grid>

        <Grid item xs={3}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: colors.grey[900],
              borderRadius: 1,
              height: '38px',
              maxWidth: '400px',
              minWidth: '400px',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#1B1D2A',
                color: '#1E6DFF',
                padding: '0px 12px',
                borderRadius: '4px 0 0 4px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Select Reports
            </Box>
            <FormControl
              variant="outlined"
              sx={{
                flex: 1,
                backgroundColor: '#101012',
                borderRadius: '0 4px 4px 0',
                height: '100%',
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  padding: '0 10px',
                  borderRadius: '0 4px 4px 0',
                  '&.Mui-focused': {
                    boxShadow: 'none',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSvgIcon-root': {
                  color: '#fff',
                },
              }}
            >
              <Select
                value={report}
                label="Report"
                onChange={handleReportChange}
                variant="outlined"
                fullWidth
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#1B1D2A',
                      color: '#fff',
                      '& .MuiMenuItem-root': {
                        '&.Mui-selected': {
                          backgroundColor: '#1E6DFF',
                        },
                        '&:hover': {
                          backgroundColor: '#1E6DFF',
                        },
                      },
                    },
                  },
                }}
                sx={{
                  color: '#fff',
                  backgroundColor: '#101012',
                  '& .MuiSelect-outlined': {
                    padding: '8px 12px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              >
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
            {report === 'Dashboard4' && <Dashboard4 filter1={selectedFilter1} filter2={selectedFilter2} filter3={selectedFilter3} />}
          </Box>
        </Grid>

        {/* Sidebar for filters */}
        <Grid item xs={12} sm={isSidebarOpen ? 2 : 1}>
          <Box sx={{
            "& .pro-sidebar-inner": {
              background: `${colors.primary[400]} !important`,
              justifyContent: "space-around",
              padding: "2px"
            },
            "& .pro-icon-wrapper": {
              backgroundColor: "transparent !important"
            },
            "& .pro-menu-item:hover": {
              background: "rgba(255, 255, 255, 0.2) !important",
              color: "#fff !important"
            },
            "& .pro-menu-item:hover p": {
              color: "#fff !important"
            },
            "& .pro-menu-item.active": {
              background: "rgb(27 29 42) !important",
              color: "#1e6dff !important"
            },
            "& .pro-menu-item.active p": {
              color: "#1e6dff !important"
            },
            "& .pro-menu-item.active svg": {
              fill: "#1e6dff !important"
            },
            position: "fixed",
            overflow: "auto",
            maxHeight: "100%",
            height: "100%",
            right: 0,
          }}>
            <ProSidebar collapsed={isCollapsed}>
              <Menu iconShape="square">
                <MenuItem
                  onClick={handleChange}
                  icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                  style={{
                    color: colors.grey[100]
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <IconButton onClick={handleChange}>
                      <MenuOutlinedIcon />
                    </IconButton>
                    {!isCollapsed && (
                      <Typography
                        variant="h3"
                        fontWeight="bold !important"
                        color={colors.grey[100]}
                      >
                        Filters
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
                {!isCollapsed && (
                  <Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Filters
                    </Typography>
                    <FormControl fullWidth margin="normal">
                      <Select
                        label="Filter 1"
                        variant="outlined"
                        name="filter1"
                        value={filters.filter1.find(option => option.selected)?.value || ""}
                        onChange={handleFilterChange}
                      >
                        {filters.filter1.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <Select
                        label="Filter 2"
                        variant="outlined"
                        name="filter2"
                        value={filters.filter2.find(option => option.selected)?.value || ""}
                        onChange={handleFilterChange}
                      >
                        {filters.filter2.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <Select
                        label="Filter 3"
                        variant="outlined"
                        name="filter3"
                        value={filters.filter3.find(option => option.selected)?.value || ""}
                        onChange={handleFilterChange}
                      >
                        {filters.filter3.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Menu>
            </ProSidebar>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default CostReport;