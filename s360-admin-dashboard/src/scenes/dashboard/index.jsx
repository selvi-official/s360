import {
  Box,
  Button,
  FormControl,
  Grid,
  Select,
  Typography,
  useTheme,
  MenuItem,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SecurityIcon from "@mui/icons-material/Security";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BoltIcon from "@mui/icons-material/Bolt";

import PillarStatBox from "../../components/PillarStatBox";

import FilterBox from "../../components/FilterBox";
import TrendGraph from "../../components/TrendGraph";
import { DateContext } from "../../datecontext";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";
import { Link } from "react-router-dom";
import { appConfig } from "../../appConfig";
import { useBUMenuOptions } from "../../customMenuOptions";
import DateRangeFilter from "../../components/DateRangeFilter";
import AiIcon from "../../icon-components/aiIcon";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [pillarLoading, setPillarLoading] = useState(false);

  // const [fromDate, setFromDate] = useState(new Date(2023, 1, 1));
  // const [toDate, setToDate] = useState(new Date(2023, 1, 28));
  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct } = useContext(SelectedProductContext);
  const { fromDate, toDate } = useContext(DateContext);

  const [reliabilityStatus, setReliabilityStatus] = useState({
    sla_missed: 0,
    sla_approaching: 0,
    in_sla: 0
  });
  const [scalabilityStatus, setScalabilityStatus] = useState([0, 0, 0]);
  const [deployabilityStatus, setDeployabilityStatus] = useState([0, 0, 0]);
  const [securityStatus, setSecurityStatus] = useState({
    sla_missed: 0,
    sla_approaching: 0,
    in_sla: 0
  });
  const [costStatus, setCostStatus] = useState({
    sla_missed: 0,
    sla_approaching: 0,
    in_sla: 0
  });
  const [aiStatus, setAIStatus] = useState([0, 0, 0]);

  const [BUList, setBUList] = useState([]);
  const BUs = useBUMenuOptions();

  useEffect(() => {
    setBUList(BUs);
  }, [BUs]);

  const [pillar, setPillar] = useState("Reliability");
  const [pillarSlaBUData, setPillarSlaBUData] = useState({
    sla_missed: {},
    sla_approaching: {},
    in_sla: {}
  });

  const date_conversion = (date) =>
    date
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
      .split(", ")[0]
      .split("/")
      .reverse()
      .join("-");

  useEffect(() => {
    handleDashboardFilter();
    handleSlaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU, selectedProduct, fromDate, toDate]);

  const handleDashboardFilter = async () => {
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";
    // setReliabilityStatus([1, 2, 3]);
    if (selectedBU !== "" && selectedProduct !== "") {
      setPillarLoading(true);
      const reliability_status_response = await fetch(
        appConfig.backend_Api_Url +
          `/reliability_status?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const reliability_status = await reliability_status_response.json();
      setReliabilityStatus(reliability_status);

      const security_status_response = await fetch(
        appConfig.backend_Api_Url +
          `/security_status?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const security_status = await security_status_response.json();
      setSecurityStatus(security_status);

      const cost_status_response = await fetch(
        appConfig.backend_Api_Url +
          `/cost/cost_status?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const cost_status = await cost_status_response.json();
      setCostStatus(cost_status);

      setPillarLoading(false);
    }
  };

  // const testdata = [{ "date": "2022-01-01", "sla_missed": 2, "sla_approaching": 1, "in_sla": 7 }, { "date": "2022-01-02", "sla_missed": 1, "sla_approaching": 4, "in_sla": 5 }, { "date": "2022-01-03", "sla_missed": 5, "sla_approaching": 3, "in_sla": 2 }, { "date": "2022-01-04", "sla_missed": 3, "sla_approaching": 5, "in_sla": 2 }, { "date": "2022-01-05", "sla_missed": 6, "sla_approaching": 3, "in_sla": 1 }, { "date": "2022-01-06", "sla_missed": 4, "sla_approaching": 3, "in_sla": 2 }]

  const [slaTrendData, setSlaTrendData] = useState([]);

  const handleSlaData = async () => {
    setLoading(true);
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";

    const sla_trend_response = await fetch(
      appConfig.backend_Api_Url +
        `/sla_trends_main?pillar=${pillar}&bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
    );
    const sla_trend = await sla_trend_response.json();
    setSlaTrendData(sla_trend);

    // setSlaTrendData(testdata)
    // console.log(slaTrendData)
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/bu_based_sla?pillar=${pillar}&bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
    );
    const data = await response.json();
    setPillarSlaBUData(data);

    setLoading(false);
  };

  useEffect(() => {
    handleSlaData();
  }, [pillar]);

  // const handlePillarSlaBUData = async (pillar) => {
  //   const startDate = date_conversion(fromDate) + 'T00:00:00'
  //   const endDate = date_conversion(toDate) + 'T23:59:59'

  // }

  const ITEM_HEIGHT = 45;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "right"
    },

    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        backgroundColor: colors.blueAccent[800]
      }
    }
  };

  return (
    <Grid container alignItems="center" width={"100%"} padding="0px 10px 40px">
      <Grid item xs="auto" paddingLeft="10px">
        <Typography variant="h1" fontWeight="600">
          Service 360
        </Typography>
      </Grid>

      <Grid
        container
        paddingY={4}
        paddingBottom={"8px"}
        marginRight={2}
        marginLeft={"12px"}
        alignItems="center"
      >
        <Grid container marginLeft={"12px"}>
          <FilterBox />
        </Grid>
      </Grid>
      {/* <Grid item xs={1} >
          <Button startIcon={<DownloadOutlinedIcon />}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "20px 20px",

            }}
          >
            Reports
          </Button>
        </Grid> */}

      {/* PILLARS */}
      {/* <Grid container padding='30px 0px' > */}
      {/* ROW 1 */}

      <Grid
        container
        padding="30px 0px"
        justifyContent="space-around"
        spacing={1}
        className="grid-item-inner-border-wrapper"
      >
        <Grid
          item
          xs={3.8}
          minWidth={300}
          paddingBottom={2}
          paddingLeft={"0 !important"}
        >
          <PillarStatBox
            title="Reliability"
            icon={
              <Link to="/reliability">
                <IconButton className="icon-button">
                  <ThumbUpAltIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 80,
                      width: "40px",
                      height: "40px"
                    }}
                  />
                </IconButton>
              </Link>
            }
            sla_missed={reliabilityStatus.sla_missed}
            sla_nearing={reliabilityStatus.sla_approaching}
            in_sla={reliabilityStatus.in_sla}
            isLoading={pillarLoading}
          />
        </Grid>

        <Grid item xs={3.8} minWidth={300} paddingBottom={2}>
          <PillarStatBox
            title="Security"
            icon={
              <Link to="/security">
                <IconButton className="icon-button">
                  <SecurityIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 80,
                      width: "40px",
                      height: "40px"
                    }}
                  />
                </IconButton>
              </Link>
            }
            sla_missed={securityStatus.sla_missed}
            sla_nearing={securityStatus.sla_approaching}
            in_sla={securityStatus.in_sla}
            isLoading={pillarLoading}
          />
        </Grid>

        <Grid item xs={3.8} minWidth={300} paddingBottom={2}>
          <PillarStatBox
            title="AI"
            icon={
              <Link to="/ai">
                <IconButton className="icon-button">
                  {/* <BoltIcon
                    sx={{ color: '#ffffff', fontSize: 80, width: '40px', height: '40px' }}
                  /> */}
                  <AiIcon width={"40px"} height={"40px"} />
                </IconButton>
              </Link>
            }
            sla_missed={aiStatus[0]}
            sla_nearing={aiStatus[1]}
            in_sla={aiStatus[2]}
            isLoading={pillarLoading}
          />
        </Grid>

        {/* ROW 2 */}

        <Grid
          item
          xs={3.8}
          minWidth={300}
          paddingBottom={2}
          paddingLeft={"0 !important"}
        >
          <PillarStatBox
            title="Scalability"
            icon={
              <Link to="/scalability">
                <IconButton className="icon-button">
                  <AutoGraphIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 80,
                      width: "40px",
                      height: "40px"
                    }}
                  />
                </IconButton>
              </Link>
            }
            sla_missed={scalabilityStatus[0]}
            sla_nearing={scalabilityStatus[1]}
            in_sla={scalabilityStatus[2]}
          />
        </Grid>

        <Grid item xs={3.8} minWidth={300} paddingBottom={2}>
          <PillarStatBox
            title="Deployability"
            icon={
              <Link to="/deployability">
                <IconButton className="icon-button">
                  <RocketLaunchIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 80,
                      width: "40px",
                      height: "40px"
                    }}
                  />
                </IconButton>
              </Link>
            }
            sla_missed={deployabilityStatus[0]}
            sla_nearing={deployabilityStatus[1]}
            in_sla={deployabilityStatus[2]}
          />
        </Grid>

        <Grid item xs={3.8} minWidth={300} paddingBottom={2}>
          <PillarStatBox
            title="Cost"
            icon={
              <Link to="/cost">
                <IconButton className="icon-button">
                  <MonetizationOnIcon
                    sx={{
                      color: "#ffffff",
                      fontSize: 80,
                      width: "40px",
                      height: "40px"
                    }}
                  />
                </IconButton>
              </Link>
            }
            sla_missed={costStatus.sla_missed}
            sla_nearing={costStatus.sla_approaching}
            in_sla={costStatus.in_sla}
            isLoading={pillarLoading}
          />
        </Grid>
      </Grid>
      <Grid container padding="10px">
        <Grid item xs={6}>
          <Typography variant="h2" fontWeight="bold">
            BU SLA Data
          </Typography>
        </Grid>
        <Grid item xs={6} textAlign="end" sx={{ paddingBottom: 3 }}>
          <FormControl
            variant="outlined"
            sx={{
              minWidth: 250,
              backgroundColor: colors.grey[900],
              borderRadius: 1,
              height: "40px"
            }}
          >
            <Select
              labelId="Pillar-label"
              id="pillars"
              value={pillar}
              onChange={(event) => setPillar(event.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: colors.grey[900],
                    color: colors.grey[100],
                    "& .MuiMenuItem-root": {
                      padding: "8px 16px",
                      "&:hover": {
                        backgroundColor: colors.blueAccent[700]
                      },
                      "&.Mui-selected": {
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100]
                      }
                    }
                  }
                }
              }}
              sx={{
                color: colors.grey[100],
                padding: "4px 16px", // Adjust padding to align text left and icon right
                height: "40px",
                "& .MuiSelect-icon": {
                  color: colors.grey[100],
                  right: "12px" // Ensure the icon stays on the right end
                },
                "& .MuiSelect-select": {
                  paddingRight: "32px", // Ensure there is space for the icon
                  textAlign: "left" // Ensure the text is left-aligned
                }
              }}
            >
              <MenuItem key="Reliability" value="Reliability">
                Reliability
              </MenuItem>
              <MenuItem key="Security" value="Security">
                Security
              </MenuItem>
              <MenuItem key="AI" value="AI">
                AI
              </MenuItem>
              <MenuItem key="Scalability" value="Scalability">
                Scalability
              </MenuItem>
              <MenuItem key="Deployability" value="Deployability">
                Deployability
              </MenuItem>
              <MenuItem key="Cost" value="Cost">
                Cost
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid container paddingBottom={5}>
          <Grid item xs={12} backgroundColor={colors.primary[400]}>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="300px"
              >
                <CircularProgress color="secondary" />
              </Box>
            ) : (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow key="header" height={50}>
                      <TableCell
                        align="left"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          backgroundColor: colors.blueAccent[800],
                          paddingLeft: 5
                        }}
                      >
                        BU
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          backgroundColor: colors.blueAccent[800]
                        }}
                      >
                        IN SLA
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          backgroundColor: colors.blueAccent[800]
                        }}
                      >
                        NEARING SLA
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          backgroundColor: colors.blueAccent[800]
                        }}
                      >
                        SLA MISSED
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(pillarSlaBUData["in_sla"]).map((bu, index) => (
                      <TableRow hover key={index} height={50}>
                        <TableCell
                          align="left"
                          sx={{ fontSize: "15px", paddingLeft: 5 }}
                        >
                          {bu}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {pillarSlaBUData["in_sla"][bu]}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {pillarSlaBUData["sla_approaching"][bu]}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {pillarSlaBUData["sla_missed"][bu]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* SLA Trend */}
      <Grid container padding="10px">
        <Grid item xs={6} sx={{ marginBottom: 3 }}>
          {" "}
          {/* Add margin below the title */}
          <Typography variant="h2" fontWeight="bold">
            SLA Trends
          </Typography>
        </Grid>

        <Grid
          item
          xs={12}
          sx={{
            height: "300px",
            width: "100%", // Ensure the graph takes the full width of its container
            maxWidth: "800px", // Set a max-width for the graph
            margin: "0 auto", // Center the graph horizontally
            backgroundColor: colors.primary[400],
            borderRadius: 5,
            display: "flex", // Center content both horizontally and vertically
            justifyContent: "center",
            alignItems: "center",
            padding: 3 // Add padding inside the graph box
          }}
        >
          {loading ? (
            <CircularProgress color="secondary" />
          ) : (
            <TrendGraph data={slaTrendData} />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
