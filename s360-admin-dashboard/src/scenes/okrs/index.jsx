import {
  Box,
  useTheme,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableCell,
  TableHead,
  TableContainer,
  Table,
  TableRow,
  TableBody
} from "@mui/material";
import { tokens } from "../../theme";

import SpeedometerGraph from "../../components/SpeedometerGraph";
import {
  CustomerOutagesBarChart,
  VerticalCompositeChartWithThreshold
} from "../../components/BarChartWithThreshold";
import FilterBox from "../../components/FilterBox";
import { useContext, useEffect, useState } from "react";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";
import { appConfig } from "../../appConfig";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ErrorIcon from "@mui/icons-material/Error";
import { OKRComparisionWithPrevQuarter } from "../../components/StatBox";

const OKRs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct } = useContext(SelectedProductContext);
  const [quarter, setQuarter] = useState("YTD");
  const [isYTD, setIsYTD] = useState(true);

  const [customerOutages, setCustomerOutages] = useState([]);
  const [incTrendData, setIncTrendData] = useState([]);
  const [inc90percentileTrendData, setInc90percentileTrendData] = useState([]);
  const [totalOutages, setTotalOutages] = useState(0);
  const [slaTotalOutages, setSLATotalOutages] = useState(100);
  const [P0Drop, setP0Drop] = useState("");
  const [P1Drop, setP1Drop] = useState("");
  const [MTTDDrop, setMTTDDrop] = useState("");
  const [P0MTTRDrop, setP0MTTRDrop] = useState("");
  const [P1MTTRDrop, setP1MTTRDrop] = useState("");
  const [BuTrendsData, setBuTrendsData] = useState([]);
  const [repairItemsData, setRepairItemsData] = useState({});

  const handleTotalOutages = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/outagesv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setTotalOutages(parseInt(data.current_value));
    setSLATotalOutages(parseInt(data.sla_outages / 2));
  };

  const handleCustomerOutages = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/customer_outagesv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setCustomerOutages(data);
  };

  const handleIncTrendDataChanges = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/mttd_mttr_outages?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setIncTrendData(data);
  };

  const handle90percentileIncTrendDataChanges = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/mttd_mttr_outages_90percentile?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setInc90percentileTrendData(data);
  };

  const handleP0Drop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/outagesdropv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setP0Drop(data);
  };
  const handleP1Drop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/p1Dropv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setP1Drop(data);
  };

  const handleMTTDDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/quarterMTTDv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setMTTDDrop(data);
  };

  const handleP0MTTRDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/p0Mttrv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setP0MTTRDrop(data);
  };

  const handleP1MTTRDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/p1Mttrv2?bu=${selectedBU}&product=${selectedProduct}&quarter=${quarter}`
    );
    const data = await response.json();
    setP1MTTRDrop(data);
  };

  const handleBuTrendsData = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url + `/okr/bu_and_outagesv2?quarter=${quarter}`
    );
    const data = await response.json();
    setBuTrendsData(data);
  };
  const handleRepairItemsData = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/okr/repairItems?bu=${selectedBU}&product=${selectedProduct}`
    );
    const data = await response.json();
    setRepairItemsData(data);
  };

  const handleOKRPageFilter = () => {
    if (selectedBU != "" && selectedProduct != "") {
      handleTotalOutages();
      // handleMttdChanges()
      handleIncTrendDataChanges();
      handle90percentileIncTrendDataChanges();
      handleCustomerOutages();
      if (!isYTD) {
        handleP0Drop();
        handleP1Drop();
        handleMTTDDrop();
        handleP0MTTRDrop();
        handleP1MTTRDrop();
      }
      handleBuTrendsData();
      handleRepairItemsData();
    }
  };

  useEffect(() => {
    handleOKRPageFilter();
  }, [selectedBU, selectedProduct, quarter]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        borderRadius: 5,
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 100,
        backgroundColor: colors.blueAccent[800]
      }
    }
  };

  const renderStatusIcon = (reportedCount, customerCount) => {
    if (customerCount <= Math.ceil(0.2 * reportedCount)) {
      return <CheckBoxIcon style={{ color: "green" }} />;
    } else {
      return <ErrorIcon style={{ color: "red" }} />;
    }
  };

  const handleQuarterChange = (event) => {
    setQuarter(event.target.value);
    event.target.value === "YTD" ? setIsYTD(true) : setIsYTD(false);
  };

  return (
    <Grid container alignItems="center" width={"100%"} padding="0px 10px 40px">
      <Grid container>
        <Grid item xs="auto" paddingLeft="10px">
          <Typography variant="h1" fontWeight="600">
            OKRs
          </Typography>
        </Grid>
        {/* <Grid item xs={1}>
        <FormControl
          variant="outlined"
          sx={{
            m: "1",
            width: 100,
            color: colors.grey[100],
            backgroundColor: colors.blueAccent[700],
            padding: "2px",
            borderRadius: 2
          }}
        >
          <InputLabel>Quarter</InputLabel>
          <Select
            value={quarter}
            label="Quarter"
            onChange={handleQuarterChange}
            MenuProps={MenuProps}
          >
            <MenuItem value="Q1">Q1</MenuItem>
            <MenuItem value="Q2">Q2</MenuItem>
            <MenuItem value="Q3">Q3</MenuItem>
            <MenuItem value="Q4">Q4</MenuItem>
            <MenuItem value="YTD">YTD</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={7}>
        <FilterBox onSubmit={handleOKRPageFilter} showDateFilter={false} />
      </Grid> */}

        <Grid
          container
          paddingY={4}
          paddingBottom={"20px"}
          marginRight={2}
          marginLeft={"12px"}
          alignItems="center"
          gap={2}
        >
          <Grid item xs={2}>
            <FormControl
              variant="outlined"
              sx={{
                m: "1",
                width: 100,
                color: colors.grey[100],
                backgroundColor: colors.blueAccent[700],
                padding: "2px",
                borderRadius: 2
              }}
            >
              <InputLabel>Quarter</InputLabel>
              <Select
                value={quarter}
                label="Quarter"
                onChange={handleQuarterChange}
                MenuProps={MenuProps}
              >
                <MenuItem value="Q1">Q1</MenuItem>
                <MenuItem value="Q2">Q2</MenuItem>
                <MenuItem value="Q3">Q3</MenuItem>
                <MenuItem value="Q4">Q4</MenuItem>
                <MenuItem value="YTD">YTD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={7} paddingLeft={"24px"}>
            <FilterBox onSubmit={handleOKRPageFilter} showDateFilter={false} />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        align="center"
        justifyContent="space-around"
        alignItems="center"
        padding={2}
        paddingLeft={0}
      >
        <Grid
          item
          xs={4}
          justifyContent="space-evenly"
          sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
        >
          <Typography variant="h3" fontWeight="bold">
            # Incidents (Goal:{" <"} 50% YoY - {slaTotalOutages})
          </Typography>
          <SpeedometerGraph
            currentValue={totalOutages}
            minValue={0}
            maxValue={slaTotalOutages}
          />
        </Grid>

        <Grid
          item
          xs={5}
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: 5,
            padding: 2
          }}
        >
          <Typography variant="h3" fontWeight="bold">
            # Customer Reported Incidents <br />
            (Goal: {"< 20%; YoY < "} {Math.ceil(slaTotalOutages * 0.2)})
          </Typography>
          <CustomerOutagesBarChart data={customerOutages} isYTD={isYTD} />
        </Grid>
      </Grid>

      {/* 2nd row */}
      <Grid container spacing={1} align="center" justifyContent="space-around">
        <Grid
          item
          xs={5.5}
          sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
        >
          <Typography variant="h3" fontWeight="bold">
            Incidents Trend Data
          </Typography>
          <VerticalCompositeChartWithThreshold
            data={incTrendData}
            threshold={15}
          />
        </Grid>

        <Grid
          item
          xs={5.5}
          sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
        >
          <Typography variant="h3" fontWeight="bold">
            90 percentile Incidents Trend Data
          </Typography>
          <VerticalCompositeChartWithThreshold
            data={inc90percentileTrendData}
            threshold={15}
          />
        </Grid>
      </Grid>

      {!isYTD && (
        <Grid
          container
          alignItems=""
          padding={2}
          justifyContent="space-evenly"
          spacing={1}
        >
          <Grid
            item
            xs={5}
            backgroundColor={colors.primary[400]}
            borderRadius={5}
            padding={5}
            margin={2}
          >
            <OKRComparisionWithPrevQuarter
              value={P0Drop.outagesDrop}
              title=" # P0 compared to prev Quarter"
              currentQuarterValue={P0Drop.curr_value}
              previousQuarterValue={P0Drop.prev_value}
            />
          </Grid>

          <Grid
            item
            xs={5}
            backgroundColor={colors.primary[400]}
            borderRadius={5}
            padding={5}
            margin={2}
          >
            <OKRComparisionWithPrevQuarter
              value={P1Drop.pdDrop}
              title=" # P1 compared to prev Quarter"
              currentQuarterValue={P1Drop.curr_value}
              previousQuarterValue={P1Drop.prev_value}
            />
          </Grid>

          <Grid
            item
            xs="auto"
            backgroundColor={colors.primary[400]}
            borderRadius={5}
            padding={5}
            margin={2}
          >
            <OKRComparisionWithPrevQuarter
              value={MTTDDrop.percent}
              title="MTTD compared to prev Quarter"
              currentQuarterValue={MTTDDrop.curr_value + "m"}
              previousQuarterValue={MTTDDrop.prev_value + "m"}
            />
          </Grid>

          <Grid
            item
            xs="auto"
            backgroundColor={colors.primary[400]}
            borderRadius={5}
            padding={5}
            margin={2}
          >
            <OKRComparisionWithPrevQuarter
              value={P0MTTRDrop.percent}
              title="P0 MTTR compared to prev Quarter"
              currentQuarterValue={P0MTTRDrop.curr_value + "m"}
              previousQuarterValue={P0MTTRDrop.prev_value + "m"}
            />
          </Grid>

          <Grid
            item
            xs="auto"
            backgroundColor={colors.primary[400]}
            borderRadius={5}
            padding={5}
            margin={2}
          >
            <OKRComparisionWithPrevQuarter
              value={P1MTTRDrop.percent}
              title="P1 MTTR compared to prev Quarter"
              currentQuarterValue={P1MTTRDrop.curr_value + "m"}
              previousQuarterValue={P1MTTRDrop.prev_value + "m"}
            />
          </Grid>
        </Grid>
      )}

      {/* 3rd row */}
      <Grid
        container
        alignItems="center"
        padding="10px 10px"
        justifyContent="space-around"
      >
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: 5,
            padding: 2
          }}
        >
          <Typography variant="h2" fontWeight="bold" paddingBottom="10px">
            BU Incidents Trend
          </Typography>
          <TableContainer sx={{ maxHeight: "450px" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow height={70}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    BU
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Reported Incidents
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Customer Incidents
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Max Customer Incidents
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                align="center"
                sx={{ backgroundColor: colors.primary[400] }}
              >
                {BuTrendsData.map((row, index) => (
                  <TableRow hover key={index} height={30}>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "15px", paddingLeft: "40px" }}
                    >
                      {row.bu}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {row.reportedIncidents}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {row.customerReportedIncidents}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {Math.ceil(row.reportedIncidents * 0.2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {renderStatusIcon(
                        row.reportedIncidents,
                        row.customerReportedIncidents
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Grid
        container
        alignItems="center"
        padding="10px 10px"
        justifyContent="space-around"
      >
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: 5,
            padding: 2
          }}
        >
          <Typography variant="h2" fontWeight="bold" paddingBottom="10px">
            Repair Items
          </Typography>
          <TableContainer sx={{ maxHeight: "450px" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow height={70}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    BU / Product
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Count
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(repairItemsData).map(([name, count]) => (
                  <TableRow hover key={name} height={30}>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "15px", paddingLeft: "40px" }}
                    >
                      {name}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "15px", paddingLeft: "40px" }}
                    >
                      {count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OKRs;
