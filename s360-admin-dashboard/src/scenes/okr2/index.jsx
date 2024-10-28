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
} from "../../components/BarChartWithThresholdv2";
import FilterBox from "../../components/FilterBox";
import { useContext, useEffect, useState } from "react";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";
import { appConfig } from "../../appConfig";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ErrorIcon from "@mui/icons-material/Error";
import { OKRComparisionWithPrevQuarter } from "../../components/StatBox";

const OKR2 = () => {
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
        `/v2/okryoyincidents?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    console.log(data);
    setTotalOutages(parseInt(data.curr_yr_outages_count));
    setSLATotalOutages(parseInt(data.sla_outages / 2));
  };

  const handleCustomerOutages = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetokrcustcount?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    console.log(data);
    setCustomerOutages(data);
  };

  const handleIncTrendDataChanges = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetokrmttd1?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setIncTrendData(data);
  };

  const handleP0Drop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetcomparisondatap0?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setP0Drop(data);
  };
  const handleP1Drop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetcomparisondatap1?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setP1Drop(data);
  };

  const handleMTTDDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetcomparisondatamttd?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setMTTDDrop(data);
  };

  const handleP0MTTRDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetcomparisondatamttrp0?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setP0MTTRDrop(data);
  };

  const handleP1MTTRDrop = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrgetcomparisondatamttrp1?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
    );
    const data = await response.json();
    setP1MTTRDrop(data);
  };

  const handleBuTrendsData = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/okrbuincidentstrendv2?bu='${selectedBU}'&product='${selectedProduct}'&quarter=${quarter}`
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

  const renderStatusIcon = (i) => {
    if (i == "yes") {
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
        <Grid
          container
          paddingY={4}
          paddingBottom={"20px"}
          marginRight={2}
          marginLeft={"12px"}
          alignItems="center"
          gap={2}
        >
          <Grid item>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, position:'relative', top: '-8px' }}>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colors.grey[900],
          borderRadius: 1,
          height: '42px',
          maxWidth: '300px',
          minWidth: '150px',
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
          Quarter
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
            value={quarter}
            onChange={handleQuarterChange}
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
            <MenuItem value="Q1 2024">Q1 2024</MenuItem>
            <MenuItem value="Q2 2024">Q2 2024</MenuItem>
            <MenuItem value="Q3 2024">Q3 2024</MenuItem>
            <MenuItem value="Q4 2024">Q4 2024</MenuItem>
            <MenuItem value="YTD">YTD</MenuItem>
          </Select>
        </FormControl>
      </Box>
      </Box>
          </Grid>
          <Grid item paddingLeft={"24px"}>
            <FilterBox onSubmit={handleOKRPageFilter} showDateFilter={false} />
          </Grid>
        </Grid>
      </Grid>

      <Grid
  container
  spacing={1}
  align="center"
  alignItems="stretch"
  paddingTop={2}
  paddingBottom={2}
  paddingRight={0}
  paddingLeft={1}
>
  <Grid
    item
    xs={6}
    justifyContent="space-evenly"
    sx={{
      backgroundColor: colors.primary[400],
      borderRadius: 2,
      padding: 2,
      paddingLeft: 0, // Adjust padding left
      paddingRight: 1, // Adjust padding right
      marginRight: "16px !important"
    }}
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
    xs={5.6}
    sx={{
      backgroundColor: colors.primary[400],
      borderRadius: 2,
      padding: 2,
      paddingLeft: 1, // Adjust padding left
      paddingRight: 0 // Adjust padding right
    }}
  >
    <Typography variant="h3" fontWeight="bold">
      # Customer Reported Incidents <br />
      (Goal: {"< 20%; YoY < "} {Math.ceil(slaTotalOutages * 0.2)})
    </Typography>
    <CustomerOutagesBarChart data={customerOutages} isYTD={isYTD} />
  </Grid>
</Grid>
      <Grid
        container
        alignItems="center"
        justifyContent="space-around"
        paddingLeft={4}
        paddingRight={4}
        paddingLeft={0}
      >
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: colors.primary[400],
            borderRadius: 5,
            borderRadius: 2
          }}
        >
          <Typography variant="h3" fontWeight="bold" padding="2%">
            Incidents Trend Data
          </Typography>
          <VerticalCompositeChartWithThreshold
            data={incTrendData}
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
        padding="10px 30px"
        justifyContent="space-around"
        paddingLeft={0}
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
          <TableContainer sx={{ maxHeight: "450px", paddingTop: "20px" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow height={50}>
                  <TableCell
                    align="left"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    BU
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    Allowed Customer Incidents
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    P0 Customer Incidents
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    P0 Non - Customer Incidents
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
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
                      align="center"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {row.allowed_cust_incidents}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {row.p0_cust_count}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {row.p0_non_cust_count}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: "15px", paddingRight: "40px" }}
                    >
                      {renderStatusIcon(row.status)}
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
        padding="10px 30px"
        justifyContent="space-around"
        paddingLeft={0}
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
          <TableContainer sx={{ maxHeight: "450px", paddingTop: "20px" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow height={50}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      paddingLeft: "40px",
                      backgroundColor: colors.blueAccent[800]
                    }}
                  >
                    BU / Product
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
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

export default OKR2;
