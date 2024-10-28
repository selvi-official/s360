import React, { useContext, useEffect, useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import BoltIcon from "@mui/icons-material/Bolt";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import { useMsal } from "@azure/msal-react";
import { pca } from "../../authConfig";
import { UserContext } from "../../UserContext";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import MemoryIcon from "@mui/icons-material/Memory";
import AiIcon from "../../icon-components/aiIcon";

const Item = ({ title, to, icon, selected, setSelected, iconStyle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: "rgba(255,255,255,0.7)",
        fontSize: "14px" // Set font size to 14px for menu items
      }}
      onClick={() => {
        setSelected(title);
        localStorage.setItem("selectedMenuOption", title);
      }}
      icon={React.cloneElement(icon, {
        style: { width: 22, height: 22, ...iconStyle }
      })} // Set icon size to 24px and apply additional styles
    >
      <Typography style={{ fontSize: "14px", color: "#ffffff" }}>
        {title}
      </Typography>
      <NavLink to={to} />
    </MenuItem>
  );
};

const Sidebar = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("");
  const { userInfo } = useContext(UserContext);

  const handleChange = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    props.updateIsCollapsed(newValue);
  };

  // const {userInfo} = useContext(UserContext)

  const { instance } = useMsal();

  // console.log(userInfo)

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + "/login"
    });
  };

  useEffect(() => {
    // Retrieve the selected state from localStorage when the component mounts
    const savedSelected = localStorage.getItem("selectedMenuOption");
    if (savedSelected) {
      setSelected(savedSelected);
    }
  }, []);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          // background: `${colors.primary[400]} !important`,
          background: `${colors.primary[400]} !important`
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important"
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important"
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
        zIndex: 9
        
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={handleChange}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100]
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography
                  variant="h3"
                  fontWeight="bold !important"
                  color={colors.grey[100]}
                >
                  FRESHWORKS
                </Typography>
                <IconButton onClick={handleChange}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}

          </MenuItem>


          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="150px"
                  height="90px"
                  src={`../../assets/s360_logo.png`}
                  style={{ cursor: "pointer", borderRadius: "0%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" color={colors.grey[100]}>
                  {userInfo.name}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "0%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pillars
            </Typography>
            <Item
              title="Well Architected"
              to="/well_architected"
              icon={<ArchitectureIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "26px", height: "26px" }}
            />
            <Item
              title="Reliability"
              to="/reliability"
              icon={<ThumbUpAltIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "22px", height: "22px" }}
            />
            <Item
              title="Security"
              to="/security"
              icon={<SecurityIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />
            <Item
              title="AI"
              to="/ai"
              icon={<AiIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "26px", height: "26px" }}
            />
            <Item
              title="Scalability"
              to="/scalability"
              icon={<AutoGraphIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "22px", height: "22px" }}
            />
            <Item
              title="Deployability"
              to="/deployability"
              icon={<RocketLaunchIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />

            <Item
              title="Cost"
              to="/cost"
              icon={<MonetizationOnIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />

            <Item
              title="CostReport"
              to="/costreport"
              icon={<MonetizationOnIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>

            <Item
              title="KPIs"
              to="/kpis"
              icon={<AssignmentIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />
            <Item
              title="OKRs"
              to="/okrs"
              icon={<ViewModuleIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />
            <Item
              title="Incidents"
              to="/incidents"
              icon={<AssignmentIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />

            <Item
              title="Well Architected Controls"
              to="/controls"
              icon={<ChecklistRtlIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "22px", height: "22px" }}
            />

            <Item
              title="Technology Stack EOL"
              to="/techstack"
              icon={<MemoryIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "22px", height: "22px" }}
            />
{/* 
            <Item
              title="P & E "
              to="/pe"
              icon={<QueryStatsIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            /> 
*/}

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
{/* 
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />
 */}
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              iconStyle={{ width: "20px", height: "20px" }}
            />

            <Button
              onClick={handleLogout}
              fullWidth
              startIcon={<LogoutIcon />}
              variant="outlined"
              sx={{
                backgroundColor: colors.primary[300],
                color: colors.blueAccent[700]
              }}
            >
              Logout
            </Button>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;