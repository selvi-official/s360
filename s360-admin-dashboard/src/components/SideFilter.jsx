import React from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FormControl, Select, MenuItem as MuiMenuItem, Typography, Box, IconButton } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const SideFilter = ({ isCollapsed, handleChange, filters, handleFilterChange, colors }) => {
  return (
    <Box
      sx={{
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
        "& .pro-menu-item.active": {
          background: "rgb(27 29 42) !important",
          color: "#1e6dff !important"
        },
        position: "fixed",
        overflow: "auto",
        maxHeight: "100%",
        height: "100%",
        right: 0,
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={handleChange}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              color: colors.grey[100]
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <IconButton onClick={handleChange}>
                <MenuOutlinedIcon />
              </IconButton>
              {!isCollapsed && (
                <Typography variant="h3" fontWeight="bold !important" color={colors.grey[100]}>
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
                    <MuiMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MuiMenuItem>
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
                    <MuiMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MuiMenuItem>
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
                    <MuiMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SideFilter;
