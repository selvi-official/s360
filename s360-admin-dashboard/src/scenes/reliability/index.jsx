import {
  Box,
  Button,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
  Grid,
  Paper,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Autocomplete,
  IconButton,
  Link
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useState, useEffect, useContext } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import FilterBox from "../../components/FilterBox";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TrendGraph from "../../components/TrendGraph";
import { SelectedProductContext } from "../../productcontext";
import { useKpiOptions, useUserOptions } from "../../customMenuOptions";
import { DateContext } from "../../datecontext";
import { SelectedBUContext } from "../../BUcontext";
import { appConfig } from "../../appConfig";
import HandshakeIcon from "@mui/icons-material/Handshake";
import TableColumnFilter from "../../components/TableColumnFilter";
import { PieChartGraph } from "../../components/PieChartGraph";

// const test_action_data = [{ "action_id": "S3-23", "KPI_Name": "P0_Count", "Priority": "High", "Product": "FreshSales", "end_date": "24-03-2023" },
// { "action_id": "S3-24", "KPI_Name": "Avg_TTD", "Priority": "Low", "Product": "FreshSales", "end_date": "20-03-2023" }
// ];
// const test_trend_data = [{ "date": "2022-01-01", "sla_missed": 2, "sla_approaching": 1, "in_sla": 7 }, { "date": "2022-01-02", "sla_missed": 1, "sla_approaching": 4, "in_sla": 5 }, { "date": "2022-01-03", "sla_missed": 5, "sla_approaching": 3, "in_sla": 2 }, { "date": "2022-01-04", "sla_missed": 3, "sla_approaching": 5, "in_sla": 2 }, { "date": "2022-01-05", "sla_missed": 6, "sla_approaching": 3, "in_sla": 1 }, { "date": "2022-01-06", "sla_missed": 4, "sla_approaching": 3, "in_sla": 2 }]

const Reliability = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const { fromDate, toDate } = useContext(DateContext);

  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        appConfig.backend_Api_Url + "/bu_and_products"
      );
      const data = await response.json();
      if (selectedBU !== "") {
        selectedBU === "All"
          ? setProducts(Object.values(data).flat())
          : setProducts(data[selectedBU]);
        if (selectedProduct === "") {
          updateProduct("All");
        }
      } else {
        setProducts([]);
        updateProduct("All");
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU]);

  const reliability_kpis = useKpiOptions("Reliability");

  const incColumnNames = [
    "Incident No",
    "Product",
    "Priority",
    "Issue Category",
    "Region",
    "TTD",
    "TTR",
    "# Customers Impacted",
    "Alert Source",
    "Is Recurring"
  ];
  const kpiActionItemColumnnNames = [
    "Action ID",
    "KPI Name",
    "Product",
    "Title",
    "Priority",
    "Status",
    "Start Date",
    "End Date"
  ];
  const [KpiActionItemData, setKpiActionItemData] = useState([]);

  const [kpiData, setKpiData] = useState([]);
  const [incData, setIncData] = useState([]);
  const [incActionItemsData, setIncActionItemsData] = useState([]);
  const [incActionItemSLAData, setIncActionItemSLAData] = useState({
    Urgent: { "SLA MISSED": 0, "IN SLA": 0 },
    High: { "SLA MISSED": 0, "IN SLA": 0 },
    Medium: { "SLA MISSED": 0, "IN SLA": 0 },
    Low: { "SLA MISSED": 0, "IN SLA": 0 }
  });

  // create KPI Action Item ticket
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketKpiName, setTicketKpiName] = useState("");
  const [ticketAssignee, setTicketAssignee] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketETA, setTicketETA] = useState(new Date());
  const [ticketPriority, setTicketPriority] = useState("");

  const ticketPriorityList = ["Urgent", "High", "Medium", "Low"];
  // const ticketAssigneeList = ['Myself','That Guy','Not Me','God']
  const ticketAssigneeList = useUserOptions();

  const handleClickOpen = () => setTicketOpen(true);
  const handleClose = () => setTicketOpen(false);

  const handleTicketSubmit = async (event) => {
    event.preventDefault();
    try {
      const params = {
        title: ticketTitle,
        product: selectedProduct,
        start_date: date_conversion(new Date()),
        due_by: date_conversion(ticketETA),
        kpi_name: ticketKpiName,
        assignee: ticketAssignee,
        priority: ticketPriority,
        description: ticketDescription
      };

      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&");
      console.log(queryString);
      const create_tkt_response = await fetch(
        appConfig.backend_Api_Url + `/create_ticket?${queryString}`
      );
      const result = await create_tkt_response.text();
      alert(result);
      setTicketTitle("");
      setTicketAssignee("");
      setTicketPriority("");
      setTicketDescription("");
    } catch (error) {
      console.error(error);
    }
    handleClose();
  };

  //Filters on columns
  const [kpiNameFilter, setKpiNameFilter] = useState("");
  const [slaStatusFilter, setSlaStatusFilter] = useState("");

  const [incActionItemStatusFilter, setIncActionItemStatusFilter] =
    useState("");
  const [incActionItemPriorityFilter, setIncActionItemPriorityFilter] =
    useState("");
  const [incActionItemSlaStatusFilter, setIncActionItemSlaStatusFilter] =
    useState("");

  const [isSLAFilterOpen, setIsSLAFilterOpen] = useState(false);
  const handleSLAFilterIconClick = (event) => {
    event.stopPropagation();
    setIsSLAFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };

  const [isKPIFilterOpen, setIsKPIFilterOpen] = useState(false);
  const handleKPIFilterIconClick = (event) => {
    event.stopPropagation();
    setIsKPIFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };

  const [isIncActionStatusFilterOpen, setIsIncActionStatusFilterOpen] =
    useState(false);
  const handlesIncActionStatusFilterIconClick = (event) => {
    event.stopPropagation();
    setIsIncActionStatusFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };
  const [isIncActionPriorityFilterOpen, setIsIncActionPriorityFilterOpen] =
    useState(false);
  const handlesIncActionPriorityFilterIconClick = (event) => {
    event.stopPropagation();
    setIsIncActionPriorityFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };
  const [isIncActionSlaStatusFilterOpen, setIsIncActionSlaStatusFilterOpen] =
    useState(false);
  const handlesIncActionSlaStatusFilterIconClick = (event) => {
    event.stopPropagation();
    setIsIncActionSlaStatusFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };

  const kpiName_categories = Array.from(new Set(kpiData.map((row) => row.KPI)));
  const slaStatus_categories = Array.from(
    new Set(kpiData.map((row) => row.sla_status))
  );

  const incAction_status_categories = Array.from(
    new Set(incActionItemsData.map((row) => row.status))
  );
  const incAction_priority_categories = Array.from(
    new Set(incActionItemsData.map((row) => row.priority))
  );
  const incAction_slaStatus_categories = Array.from(
    new Set(incActionItemsData.map((row) => row.sla_status))
  );

  const filteredKpiData = kpiData.filter((row) => {
    const kpiNameMatch = !kpiNameFilter || row.KPI === kpiNameFilter;
    const slaStatusMatch =
      !slaStatusFilter || row.sla_status === slaStatusFilter;
    return kpiNameMatch && slaStatusMatch;
  });

  const filteredIncActionItemsData = incActionItemsData.filter((row) => {
    const statusMatch =
      !incActionItemStatusFilter || row.status === incActionItemStatusFilter;
    const priorityMatch =
      !incActionItemPriorityFilter ||
      row.priority === incActionItemPriorityFilter;
    const slaStatusMatch =
      !incActionItemSlaStatusFilter ||
      row.sla_status === incActionItemSlaStatusFilter;
    return statusMatch && priorityMatch && slaStatusMatch;
  });

  //sla trends
  const [slaTrendKpi, setSlaTrendKpi] = useState("All");
  const [slaTrendData, setSlaTrendData] = useState([]);

  const handleSlaTrendData = async (kpi) => {
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";

    const sla_trend_response = await fetch(
      appConfig.backend_Api_Url +
        `/reliability/kpi_sla_trends?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}&kpi=${kpi}`
    );

    const sla_trend = await sla_trend_response.json();

    setSlaTrendData(sla_trend.kpi_sla_trends);
    // setSlaTrendData(testdata)
    // console.log(slaTrendData)
  };
  const handleSlaTrendChange = (event) => {
    setSlaTrendKpi(event.target.value);
    handleSlaTrendData(event.target.value);
  };

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

  const getSLAColor = (status) => {
    switch (status) {
      case "SLA MISSED":
        return colors.redAccent[300];
      case "NEARING SLA":
        return colors.blueAccent[300];
      case "IN SLA":
        return colors.greenAccent[300];
      default:
        return colors.primary[300];
    }
  };

  const handleReliabilityPageFilter = async () => {
    setLoading(true);

    // const product2 = 'Freshdesk'
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";
    if (selectedBU !== "" && selectedProduct !== "") {
      const kpi_response = await fetch(
        appConfig.backend_Api_Url +
          `/reliability/kpi_data?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const kpi_data = await kpi_response.json();
      setKpiData(kpi_data);

      const actions_response = await fetch(
        appConfig.backend_Api_Url +
          `/reliability/action_items?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const actions_data = await actions_response.json();
      setKpiActionItemData(actions_data);

      const inc_response = await fetch(
        appConfig.backend_Api_Url +
          `/reliability/incident_data?bu=${selectedBU}&product=${selectedProduct}&from_date=${startDate}&to_date=${endDate}`
      );
      const inc_data = await inc_response.json();
      setIncData(inc_data.incidents);
      setIncActionItemsData(inc_data.preventive_action_items);
      setIncActionItemSLAData(inc_data.repair_items_chart);

      handleSlaTrendData(slaTrendKpi);
    }
    setLoading(false);
  };

  const ITEM_HEIGHT = 45;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 200,
        backgroundColor: colors.blueAccent[800]
      }
    }
  };

  useEffect(() => {
    handleReliabilityPageFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU, selectedProduct, fromDate, toDate]);

  return (
    <Grid container alignItems="center" padding="0px 10px 40px">
      <Grid
        item
        xs="auto"
        paddingLeft="10px"
        display="flex"
        alignItems="center"
      >
        <Link to="/reliability">
          <IconButton className="icon-button">
            <ThumbUpAltIcon
              sx={{
                color: '#ffffff',
                fontSize: 80,
                height: "38px",
                width: "38px"
              }}
            />
          </IconButton>
        </Link>
        <Typography variant="h1" fontWeight="600">
          Reliability
        </Typography>
      </Grid>
      <Grid
        container
        paddingY={4}
        paddingBottom={"0"}
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
                            fontWeight: "semi-bold",
                            padding: "20px 20px",

                        }}
                    >
                        Reports
                    </Button>
                </Grid> */}
      <Grid container padding="50px 20px">
        <Grid
          item
          xs={12}
          container
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h2" fontWeight="bold">
            KPI Data
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "12px",
              fontWeight: "semi-bold",
              padding: "5px 10px"
            }}
          >
            Create Action
          </Button>
        </Grid>

        <Grid item xs={12}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : filteredKpiData.length > 0 ? (
            <TableContainer sx={{ maxHeight: "400px", marginTop: "20px" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow height={50}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800],
                        paddingLeft: "40px"
                      }}
                    >
                      KPI Name
                      <TableColumnFilter
                        isFilterOpen={isKPIFilterOpen}
                        value={kpiNameFilter}
                        categories={kpiName_categories}
                        onChange={(event) =>
                          setKpiNameFilter(event.target.value)
                        }
                        onClose={() => setIsKPIFilterOpen(false)}
                        onClick={handleKPIFilterIconClick}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      SLA Status
                      <TableColumnFilter
                        isFilterOpen={isSLAFilterOpen}
                        value={slaStatusFilter}
                        categories={slaStatus_categories}
                        onChange={(event) =>
                          setSlaStatusFilter(event.target.value)
                        }
                        onClose={() => setIsSLAFilterOpen(false)}
                        onClick={handleSLAFilterIconClick}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Product
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Month
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Value
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      SLA Defined
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Error Budget
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Action Items
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  align="center"
                  sx={{ backgroundColor: colors.primary[400] }}
                >
                  {filteredKpiData.map((row, index) => (
                    <TableRow hover key={index} height={30}>
                      <TableCell sx={{ fontSize: "15px", paddingLeft: "40px" }}>
                        {row.KPI}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          fontSize: "15px",
                          color: getSLAColor(row.sla_status),
                          fontWeight: "bold"
                        }}
                      >
                        {row.sla_status}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: "15px" }}>
                        {row.product}
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: "15px" }}>
                        {row.actual_month}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "15px" }}>
                        {(+row.Value).toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "15px" }}>
                        {row.SLA_defined}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: "15px", paddingRight: "40px" }}
                      >
                        {(+row.error_budget_remaining_percent).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.Action_Items}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: "14px", margin: "20px 0" }}
            >
              No Data to Display
            </Typography>
          )}
        </Grid>
      </Grid>
      <Grid container padding="10px 20px">
        <Grid item xs={12} mb={3}>
          <Typography variant="h2" fontWeight="bold">
            KPI Action Items
          </Typography>
        </Grid>

        <Grid item xs={12} paddingBottom="40px">
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : KpiActionItemData.length > 0 ? (
            <TableContainer sx={{ maxHeight: "400px", marginTop: "20px" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow key="header" height={50}>
                    {kpiActionItemColumnnNames.map((columnName, index) => (
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          backgroundColor: colors.blueAccent[800]
                        }}
                        key={index}
                      >
                        {columnName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: colors.primary[400] }}>
                  {KpiActionItemData.map((row, index) => (
                    <TableRow hover key={index} height={30}>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        <a
                          href={
                            "https://freshworks.freshrelease.com/ws/S3/tasks/" +
                            row.action_id
                          }
                          style={{ color: colors.greenAccent[500] }}
                        >
                          {row.action_id}
                        </a>
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.kpi_name}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.product}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.title}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.priority}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.status}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.start_date
                          ? row.start_date.slice(0, -9)
                          : row.start_date}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.end_date
                          ? row.end_date.slice(0, -9)
                          : row.end_date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: "14px", margin: "10px 0" }}
            >
              No Data to Display
            </Typography>
          )}
        </Grid>
      </Grid>

      <Grid container padding="10px 20px">
        <Grid item xs={12} mb={3}>
          <Typography variant="h2" fontWeight="bold">
            Incident Data
          </Typography>
        </Grid>

        <Grid item xs={12} paddingBottom="40px">
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : incData.length > 0 ? (
            <TableContainer sx={{ maxHeight: "400px", marginTop: "20px" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow key="header" height={50}>
                    {incColumnNames.map((columnName, index) => (
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          backgroundColor: colors.blueAccent[800]
                        }}
                        key={index}
                      >
                        {columnName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: colors.primary[400] }}>
                  {incData.map((row, index) => (
                    <TableRow hover key={index} height={30}>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        <a
                          href={
                            "https://freshworks.freshrelease.com/ws/INC/tasks/" +
                            row.incident_no
                          }
                          style={{ color: colors.greenAccent[500] }}
                        >
                          {row.incident_no}
                        </a>
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.product}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.priority}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.issue_category}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.region}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.TTD}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.TTR}
                      </TableCell>
                      <TableCell
                        align="center"
                        width={150}
                        sx={{ fontSize: "15px" }}
                      >
                        {row.customers_impacted}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.alert_source}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "15px" }}>
                        {row.is_recurring_incident}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              variant="h6"
              align="center"
              sx={{ fontSize: "14px", margin: "20px 0" }}
            >
              No Data to Display
            </Typography>
          )}
        </Grid>
      </Grid>

      <Grid container padding="10px 20px">
        <Grid item xs={12} mb={3} sx={{ marginBottom: 4 }}>
          <Typography variant="h2" fontWeight="bold">
            Incident Repair Items
          </Typography>
        </Grid>

        <Grid item xs={12} sx={{ paddingY: 3 }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="300px"
            >
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : (
            <Grid
              container
              spacing={3}
              justifyContent="space-between"
              sx={{ marginTop: 2, padding: "0px 20px" }}
            >
              <Grid
                item
                xs={2.8}
                display="flex"
                flexDirection="column"
                alignItems="center"
                border={0.5}
                color={colors.blueAccent[100]}
                borderRadius={3}
                padding={3}
                sx={{ marginBottom: 2 }}
              >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  Urgent Repair Items
                </Typography>
                <PieChartGraph data={incActionItemSLAData["Urgent"]} />
              </Grid>

              <Grid
                item
                xs={2.8}
                display="flex"
                flexDirection="column"
                alignItems="center"
                border={0.5}
                color={colors.blueAccent[100]}
                borderRadius={3}
                padding={3}
                sx={{ marginBottom: 2 }}
              >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  High Repair Items
                </Typography>
                <PieChartGraph data={incActionItemSLAData["High"]} />
              </Grid>

              <Grid
                item
                xs={2.8}
                display="flex"
                flexDirection="column"
                alignItems="center"
                border={0.5}
                color={colors.blueAccent[100]}
                borderRadius={3}
                padding={3}
                sx={{ marginBottom: 2 }}
              >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  Medium Repair Items
                </Typography>
                <PieChartGraph data={incActionItemSLAData["Medium"]} />
              </Grid>

              <Grid
                item
                xs={2.8}
                display="flex"
                flexDirection="column"
                alignItems="center"
                border={0.5}
                color={colors.blueAccent[100]}
                borderRadius={3}
                padding={3}
                sx={{ marginBottom: 2 }}
              >
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  Low Repair Items
                </Typography>
                <PieChartGraph data={incActionItemSLAData["Low"]} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Grid container padding="10px 20px">
        <Grid item xs={12} mb={3}>
          <Typography variant="h2" fontWeight="bold">
            SLA Status
          </Typography>
        </Grid>

        <Grid item xs={12} paddingY="10px">
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "400px" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow key="header" height={50}>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Action ID
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      INC ID
                    </TableCell>
                    <TableCell
                      align="left"
                      width={400}
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      SLA Status
                      <TableColumnFilter
                        isFilterOpen={isIncActionSlaStatusFilterOpen}
                        value={incActionItemSlaStatusFilter}
                        categories={incAction_slaStatus_categories}
                        onChange={(event) =>
                          setIncActionItemSlaStatusFilter(event.target.value)
                        }
                        onClose={() => setIsIncActionSlaStatusFilterOpen(false)}
                        onClick={handlesIncActionSlaStatusFilterIconClick}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Priority
                      <TableColumnFilter
                        isFilterOpen={isIncActionPriorityFilterOpen}
                        value={incActionItemPriorityFilter}
                        categories={incAction_priority_categories}
                        onChange={(event) =>
                          setIncActionItemPriorityFilter(event.target.value)
                        }
                        onClose={() => setIsIncActionPriorityFilterOpen(false)}
                        onClick={handlesIncActionPriorityFilterIconClick}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Status
                      <TableColumnFilter
                        isFilterOpen={isIncActionStatusFilterOpen}
                        value={incActionItemStatusFilter}
                        categories={incAction_status_categories}
                        onChange={(event) =>
                          setIncActionItemStatusFilter(event.target.value)
                        }
                        onClose={() => setIsIncActionStatusFilterOpen(false)}
                        onClick={handlesIncActionStatusFilterIconClick}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        backgroundColor: colors.blueAccent[800]
                      }}
                    >
                      End Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: colors.primary[400] }}>
                  {filteredIncActionItemsData.length > 0 ? (
                    filteredIncActionItemsData.map((row, index) => (
                      <TableRow hover key={index} height={30}>
                        <TableCell align="left" sx={{ fontSize: "15px" }}>
                          <a
                            href={
                              "https://freshworks.freshrelease.com/ws/" +
                              row.project.split("-")[0] +
                              "/tasks/" +
                              row.project
                            }
                            style={{ color: colors.greenAccent[500] }}
                          >
                            {row.project}
                          </a>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ fontSize: "15px", height: 20 }}
                        >
                          {row.incident_no}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            fontSize: "15px",
                            whiteSpace: "normal",
                            wordBreak: "break-word"
                          }}
                        >
                          {row.title}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: "15px",
                            color: getSLAColor(row.sla_status),
                            fontWeight: "bold"
                          }}
                        >
                          {row.sla_status}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {row.priority}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {row.status}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {row.start_date ? row.start_date.split(" ")[0] : ""}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: "15px" }}>
                          {row.end_date ? row.end_date.split(" ")[0] : ""}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        align="center"
                        colSpan={8}
                        sx={{ fontSize: "14px", padding: "20px" }}
                      >
                        No Data to Display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <Grid container padding="10px 20px">
        <Grid item xs={6}>
          <Typography variant="h2" fontWeight="bold">
            SLA Trends
          </Typography>
        </Grid>
        <Grid item xs={6} textAlign="end">
          <FormControl
            variant="outlined"
            sx={{
              maxWidth: "300px", // Control the maximum width
              minWidth: "150px", // Control the minimum width
              height: "32px" // Set a smaller height for the FormControl
            }}
          >
            <Select
              value={slaTrendKpi}
              onChange={handleSlaTrendChange}
              MenuProps={MenuProps}
              sx={{
                backgroundColor: colors.grey[900],
                color: colors.grey[100],
                textAlign: "left",
                padding: "4px 8px", // Adjust padding to reduce height
                height: "32px", // Set the height to match the FormControl
                minHeight: "32px", // Ensure the Select component maintains this height
                ".MuiSelect-icon": {
                  color: colors.grey[100] // Ensure the icon color matches the text
                }
              }}
            >
              <MenuItem key="All" value="All" sx={{ padding: "4px 8px" }}>
                All
              </MenuItem>
              {reliability_kpis.map((item) => (
                <MenuItem key={item} value={item} sx={{ padding: "4px 8px" }}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Add padding or margin between the title and the panel */}
        <Grid item xs={12} sx={{ paddingY: 3 }}>
          <Grid
            item
            xs={12}
            height="300px"
            backgroundColor={colors.primary[400]}
            borderRadius={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {loading ? (
              <CircularProgress color="secondary" />
            ) : slaTrendData.length > 0 ? (
              <TrendGraph data={slaTrendData} />
            ) : (
              <Typography variant="h6" color={colors.grey[100]}>
                No Data to Display
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Reliability;
