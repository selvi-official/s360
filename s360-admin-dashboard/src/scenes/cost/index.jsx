import {
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Autocomplete,
  Paper,
  TextField,
  Box
} from "@mui/material";
import FilterBox from "../../components/FilterBox";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { tokens } from "../../theme";
import { useContext, useEffect, useState } from "react";
import { DateContext } from "../../datecontext";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";
import { appConfig } from "../../appConfig";
import { SimpleStatBox } from "../../components/StatBox";
import TableColumnFilter from "../../components/TableColumnFilter";
import { SelectedAccountContext } from "../../accountContext";
import { fetchAccountList } from "../../util/HelperFunctions";
import CustomTitle from "../../components/CustomTItle";
import { ProductFilter } from "../../components/ProductFilter";
import { AccountFilter } from "../../components/AccountFilter";
import { BUFilter } from "../../components/BUFilter";
import DateRangeFilter from "../../components/DateRangeFilter";
import { ComingSoonPage } from "../../components/ComingSoonPage";

const Cost = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(false);
  // const [selectedAccount, setSelectedAccount] = useState('All')
  const [accountList, setAccountList] = useState([]);
  const [MoMCostData, setMoMCostData] = useState([]);
  const [costByAccountData, setCostByAccountData] = useState([]);
  const [costByResourceData, setCostByResourceData] = useState([]);
  const [kpiData, setKpiData] = useState([]);

  const { selectedAccount, updateAccount } = useContext(SelectedAccountContext);

  const { fromDate, toDate } = useContext(DateContext);
  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);

  const [savingCategoryFilter, setSavingCategoryFilter] = useState("");
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const handleCategoryFilterIconClick = (event) => {
    event.stopPropagation();
    setIsCategoryFilterOpen((prevIsFilterOpen) => !prevIsFilterOpen);
  };
  const saving_categories = Array.from(
    new Set(costByResourceData.map((row) => row["Saving Category"]))
  );

  const filteredCostByResourceData = costByResourceData.filter((row) => {
    const savingCategoryMatch =
      !savingCategoryFilter || row["Saving Category"] === savingCategoryFilter;

    return savingCategoryMatch;
  });

  const [kpiNameFilter, setKpiNameFilter] = useState("");
  const [slaStatusFilter, setSlaStatusFilter] = useState("");

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

  const kpiName_categories = Array.from(
    new Set(kpiData.map((row) => row.kpi_name))
  );
  const slaStatus_categories = Array.from(
    new Set(kpiData.map((row) => row.sla_status))
  );

  const filteredKpiData = kpiData.filter((row) => {
    const kpiNameMatch = !kpiNameFilter || row.kpi_name === kpiNameFilter;
    const slaStatusMatch =
      !slaStatusFilter || row.sla_status === slaStatusFilter;
    return kpiNameMatch && slaStatusMatch;
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await fetchAccountList(selectedBU, selectedProduct);
      // console.log(accounts)
      if (!accounts.find((item) => item.accountid === selectedAccount)) {
        updateAccount(null);
      }
      setAccountList(accounts);
    };

    fetchAccounts();
  }, [selectedBU, selectedProduct]);

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
      case "OUT OF SLA":
        return colors.redAccent[300];
      case "NEARING SLA":
        return colors.blueAccent[300];
      case "IN SLA":
        return colors.greenAccent[300];
      default:
        return colors.primary[300];
    }
  };

  // const handleCostPageFilter = async () => {
  //     setLoading(true)
  //     const startDate = date_conversion(fromDate) + 'T00:00:00'
  //     const endDate = date_conversion(toDate) + 'T23:59:59'
  //     const response = await fetch(appConfig.backend_Api_Url + '/cost/getTotalCost?bu='+selectedBU+'&product='+selectedProduct+'&account='+selectedAccount+'&from_date='+startDate+'&to_date='+endDate);
  //     const data = await response.json();
  //     setMoMCostData(data)

  //     const response2 = await fetch(appConfig.backend_Api_Url + '/cost/getCostByAccountResourceCount?bu='+selectedBU+'&product='+selectedProduct+'&account='+selectedAccount+'&from_date='+startDate+'&to_date='+endDate);
  //     const data2 = await response2.json();
  //     setCostByAccountData(data2)

  //     const response3 = await fetch(appConfig.backend_Api_Url + '/cost/getCostByResource?bu='+selectedBU+'&product='+selectedProduct+'&account='+selectedAccount+'&resource=All'+'&from_date='+startDate+'&to_date='+endDate);
  //     const data3 = await response3.json();
  //     setCostByResourceData(data3)

  //     const response4 = await fetch(appConfig.backend_Api_Url + '/cost/getKpiData?bu='+selectedBU+'&product='+selectedProduct+'&from_date='+endDate+'&to_date='+startDate);
  //     const data4 = await response4.json();
  //     setKpiData(data4)

  //     setLoading(false)

  // }

  const handleCostPageFilter = async () => {
    setLoading(true);
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";
    const urls = [
      "/cost/getKpiData?bu=" +
        selectedBU +
        "&product=" +
        selectedProduct +
        "&from_date=" +
        startDate +
        "&to_date=" +
        endDate,
      "/cost/getTotalCost?bu=" +
        selectedBU +
        "&product=" +
        selectedProduct +
        "&account=" +
        selectedAccount +
        "&from_date=" +
        startDate +
        "&to_date=" +
        endDate,
      "/cost/getCostByAccountResourceCount?bu=" +
        selectedBU +
        "&product=" +
        selectedProduct +
        "&account=" +
        selectedAccount +
        "&from_date=" +
        startDate +
        "&to_date=" +
        endDate,
      "/cost/getCostByResource?bu=" +
        selectedBU +
        "&product=" +
        selectedProduct +
        "&account=" +
        selectedAccount +
        "&resource=All" +
        "&from_date=" +
        startDate +
        "&to_date=" +
        endDate
    ];

    try {
      const responses = await Promise.all(
        urls.map((url) => fetch(appConfig.backend_Api_Url + url))
      );
      const data = await Promise.all(
        responses.map((response) => response.json())
      );

      setKpiData(data[0]);
      setMoMCostData(data[1]);
      setCostByAccountData(data[2]);
      setCostByResourceData(data[3]);
    } catch (error) {
      // Handle error here
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCostPageFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU, selectedProduct, selectedAccount, fromDate, toDate]);

  return (
    <ComingSoonPage />
    // <Grid container alignItems="center" width={"100%"} padding="0px 10px 40px">
    //   <Grid item xs="auto" paddingLeft="0" display="flex" alignItems="center">
    //     <Link to="/cost">
    //       <IconButton className="icon-button">
    //         <MonetizationOnIcon
    //           sx={{
    //             color: '#ffffff',
    //             fontSize: 80,
    //             height: "38px",
    //             width: "38px"
    //           }}
    //         />
    //       </IconButton>
    //     </Link>
    //     <Typography variant="h1" fontWeight="600">
    //       Cost
    //     </Typography>
    //   </Grid>

    //   <Grid
    //     container
    //     display="flex"
    //     flexDirection="row"
    //     justifyContent="space-between"
    //     paddingY={4}
    //     alignItems="center"
    //     className="filter-wrapper"
    //   >
    //     <Grid item xs="auto" display="flex" gap={2}>
    //       <BUFilter />

    //       <ProductFilter />

    //       <AccountFilter />
    //     </Grid>
    //     <Grid item xs="auto">
    //       <DateRangeFilter />
    //     </Grid>
    //   </Grid>

    //   {/* First Table - KPI Data */}
    //   <Grid container padding="20px 0px">
    //     <Grid item xs={6} sx={{ marginBottom: 3 }}>
    //       <Typography variant="h2" fontWeight="bold">
    //         KPI Data
    //       </Typography>
    //     </Grid>

    //     <Grid item xs={12}>
    //       {loading ? (
    //         <Box
    //           display="flex"
    //           justifyContent="center"
    //           alignItems="center"
    //           height="300px"
    //         >
    //           <CircularProgress color="secondary" />
    //         </Box>
    //       ) : filteredKpiData.length > 0 ? (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingLeft: 2
    //                   }}
    //                 >
    //                   KPI Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Product
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   SLA Status
    //                 </TableCell>
    //                 <TableCell
    //                   align="center"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   SLA Defined
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Saving
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Budget overshoot
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               {filteredKpiData.map((row, index) => (
    //                 <TableRow hover key={index} height={30}>
    //                   <TableCell
    //                     align="left"
    //                     sx={{ fontSize: "14px", paddingLeft: 2 }}
    //                   >
    //                     {row.kpi_name}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {row.Product}
    //                   </TableCell>
    //                   <TableCell
    //                     align="left"
    //                     sx={{
    //                       fontSize: "14px",
    //                       color: getSLAColor(row.sla_status),
    //                       fontWeight: "bold"
    //                     }}
    //                   >
    //                     {row.sla_status}
    //                   </TableCell>
    //                   <TableCell align="center" sx={{ fontSize: "14px" }}>
    //                     {row.sla_defined}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {row.resource_name}
    //                   </TableCell>
    //                   <TableCell align="right" sx={{ fontSize: "14px" }}>
    //                     ${row.saving}
    //                   </TableCell>
    //                   <TableCell align="right" sx={{ fontSize: "14px" }}>
    //                     ${row.budget_overshoot}
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       ) : (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingLeft: 2
    //                   }}
    //                 >
    //                   KPI Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Product
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   SLA Status
    //                 </TableCell>
    //                 <TableCell
    //                   align="center"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   SLA Defined
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Saving
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Budget overshoot
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               <TableRow>
    //                 <TableCell
    //                   colSpan={7}
    //                   align="center"
    //                   sx={{ fontSize: "16px", padding: 3 }}
    //                 >
    //                   No Data to Display
    //                 </TableCell>
    //               </TableRow>
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       )}
    //     </Grid>
    //   </Grid>

    //   {/* Second Table - MoM Cost Comparison */}
    //   <Grid container padding="20px 0px">
    //     <Grid item xs={6} sx={{ marginBottom: 3 }}>
    //       <Typography variant="h2" fontWeight="bold">
    //         MoM Cost Comparison
    //       </Typography>
    //     </Grid>

    //     <Grid item xs={12}>
    //       {loading ? (
    //         <Box
    //           display="flex"
    //           justifyContent="center"
    //           alignItems="center"
    //           height="300px"
    //         >
    //           <CircularProgress color="secondary" />
    //         </Box>
    //       ) : MoMCostData.length > 0 ? (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingLeft: 2
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingRight: 2
    //                   }}
    //                 >
    //                   Total Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               {MoMCostData.map((monthData, index) => (
    //                 <TableRow hover key={index} height={30}>
    //                   <TableCell
    //                     align="left"
    //                     sx={{ fontSize: "14px", paddingLeft: 2 }}
    //                   >
    //                     {monthData.Start_Date}
    //                   </TableCell>
    //                   <TableCell
    //                     align="right"
    //                     sx={{ fontSize: "14px", paddingRight: 2 }}
    //                   >
    //                     ${monthData.Total_Usage_Amount}
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       ) : (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingLeft: 2
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800],
    //                     paddingRight: 2
    //                   }}
    //                 >
    //                   Total Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               <TableRow>
    //                 <TableCell
    //                   colSpan={2}
    //                   align="center"
    //                   sx={{ fontSize: "16px", padding: 3 }}
    //                 >
    //                   No Data to Display
    //                 </TableCell>
    //               </TableRow>
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       )}
    //     </Grid>
    //   </Grid>

    //   {/* Third Table - Cost By Account */}
    //   <Grid container padding="20px 0px">
    //     <Grid item xs={6} sx={{ marginBottom: 3 }}>
    //       <Typography variant="h2" fontWeight="bold">
    //         Cost By Account
    //       </Typography>
    //     </Grid>

    //     <Grid item xs={12}>
    //       {loading ? (
    //         <Box
    //           display="flex"
    //           justifyContent="center"
    //           alignItems="center"
    //           height="300px"
    //         >
    //           <CircularProgress color="secondary" />
    //         </Box>
    //       ) : costByAccountData.length > 0 ? (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Account Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource Count
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Total Usage Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               {costByAccountData.map((costData, index) => (
    //                 <TableRow hover key={index} height={30}>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData.Account_Name}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData.Start_Date}
    //                   </TableCell>
    //                   <TableCell align="right" sx={{ fontSize: "14px" }}>
    //                     {costData.Resource_Count}
    //                   </TableCell>
    //                   <TableCell align="right" sx={{ fontSize: "14px" }}>
    //                     ${costData.Total_usage_amount}
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       ) : (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Account Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource Count
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Total Usage Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               <TableRow>
    //                 <TableCell
    //                   colSpan={4}
    //                   align="center"
    //                   sx={{ fontSize: "16px", padding: 3 }}
    //                 >
    //                   No Data to Display
    //                 </TableCell>
    //               </TableRow>
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       )}
    //     </Grid>
    //   </Grid>

    //   {/* Fourth Table - Cost By Resource */}
    //   <Grid container padding="20px 0px">
    //     <Grid item xs={6} sx={{ marginBottom: 3 }}>
    //       <Typography variant="h2" fontWeight="bold">
    //         Cost By Resource
    //       </Typography>
    //     </Grid>

    //     <Grid item xs={12}>
    //       {loading ? (
    //         <Box
    //           display="flex"
    //           justifyContent="center"
    //           alignItems="center"
    //           height="300px"
    //         >
    //           <CircularProgress color="secondary" />
    //         </Box>
    //       ) : filteredCostByResourceData.length > 0 ? (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource ID
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Account Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Availability Zone
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Category
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Usage Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               {filteredCostByResourceData.map((costData, index) => (
    //                 <TableRow hover key={index} height={30}>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData["Resource ID"]}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData.Account_Name}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData.Start_Date}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData["Availability Zone"]}
    //                   </TableCell>
    //                   <TableCell align="left" sx={{ fontSize: "14px" }}>
    //                     {costData["Saving Category"]}
    //                   </TableCell>
    //                   <TableCell align="right" sx={{ fontSize: "14px" }}>
    //                     ${costData.Usage_amount}
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       ) : (
    //         <TableContainer sx={{ maxHeight: "400px" }}>
    //           <Table stickyHeader>
    //             <TableHead>
    //               <TableRow height={50}>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Resource ID
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Account Name
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Month
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Availability Zone
    //                 </TableCell>
    //                 <TableCell
    //                   align="left"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Category
    //                 </TableCell>
    //                 <TableCell
    //                   align="right"
    //                   sx={{
    //                     fontWeight: "bold",
    //                     fontSize: "16px",
    //                     backgroundColor: colors.blueAccent[800]
    //                   }}
    //                 >
    //                   Usage Cost
    //                 </TableCell>
    //               </TableRow>
    //             </TableHead>
    //             <TableBody sx={{ backgroundColor: colors.primary[400] }}>
    //               <TableRow>
    //                 <TableCell
    //                   colSpan={6}
    //                   align="center"
    //                   sx={{ fontSize: "16px", padding: 3 }}
    //                 >
    //                   No Data to Display
    //                 </TableCell>
    //               </TableRow>
    //             </TableBody>
    //           </Table>
    //         </TableContainer>
    //       )}
    //     </Grid>
    //   </Grid>
    // </Grid>
  );
};

export default Cost;
