import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
  useTheme
} from "@mui/material";
import FilterBox from "../../components/FilterBox";
import { tokens } from "../../theme";
import BoltIcon from "@mui/icons-material/Bolt";
import DateRangeFilter from "../../components/DateRangeFilter";
import { SimpleStatBox } from "../../components/StatBox";
import { useContext, useEffect, useState } from "react";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";
import { useBUMenuOptions } from "../../customMenuOptions";
import { appConfig } from "../../appConfig";
import {
  Legend,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line
} from "recharts";
import AiIcon from "../../icon-components/aiIcon";
import { ComingSoonPage } from "../../components/ComingSoonPage";

const AI = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [filter, setFilter] = useState("requests");

  const { selectedBU, updateBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);

  const [BUList, setBUList] = useState([]);
  const [products, setProducts] = useState([]);

  const BUs = useBUMenuOptions();

  useEffect(() => {
    setBUList(BUs);
  }, [BUs]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        appConfig.backend_Api_Url + "/bu_and_products"
      );
      const data = await response.json();
      if (selectedBU != "") {
        selectedBU === "All"
          ? setProducts(Object.values(data).flat())
          : setProducts(data[selectedBU]);
        if (selectedProduct == "") {
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

  // const handleFilterChange = (filter) => {
  //     setFilter(filter)

  //     if(filter === )
  // }

  const [chartData, setChartData] = useState([]);

  const data = {
    requests: [
      { date: "2023-02-15", value: 100 },
      { date: "2023-03-21", value: 50 },
      { date: "2023-04-05", value: 200 },
      { date: "2023-05-11", value: 250 },
      { date: "2023-06-22", value: 300 }
    ],
    cost: [
      { date: "2023-02-15", value: 50 },
      { date: "2023-03-21", value: 70 },
      { date: "2023-04-05", value: 90 },
      { date: "2023-05-11", value: 110 },
      { date: "2023-06-22", value: 130 }
    ],
    tokens: [
      { date: "2023-02-15", value: 123 },
      { date: "2023-03-21", value: 456 },
      { date: "2023-04-05", value: 789 },
      { date: "2023-05-11", value: 12 },
      { date: "2023-06-22", value: 345 }
    ]
  };

  useEffect(() => {
    setChartData(data[filter]);
    console.log(chartData);
  }, [filter]);

  const handleAIPageFilter = () => {};

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        backgroundColor: colors.blueAccent[800]
      }
    }
  };

  const dateFormatter = (timeStamp) => new Date(timeStamp).toLocaleDateString();

  return (
    <ComingSoonPage />
//     <Grid container alignItems="center" width={"100%"} padding="0px 10px 40px">
//       <Grid item xs="auto" paddingLeft="0" display="flex" alignItems="center">
//         <Link to="/ai">
//           <IconButton className="icon-button">
//             <AiIcon fill={"#ffffff"} width="38px" height="38px" />
//           </IconButton>
//         </Link>
//         <Typography variant="h1" fontWeight="600">
//           AI
//         </Typography>
//       </Grid>
//       <Grid
//         container
//         paddingY={4}
//         paddingBottom={"8px"}
//         marginRight={2}
//         marginLeft={"12px"}
//         alignItems="center"
//       >
//         <Grid item xs="auto" alignSelf="center" paddingRight={2}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               backgroundColor: "#101012", // Background color for the container
//               borderRadius: 2,
//               minWidth: 200,
//               height: "40px" // Consistent height across both components
//             }}
//           >
//             {/* Label Section */}
//             <Box
//               sx={{
//                 backgroundColor: "#1B1D2A", // Darker background for the label
//                 padding: "0 12px", // Consistent padding for label section
//                 borderRadius: "4px 0 0 4px",
//                 display: "flex",
//                 alignItems: "center",
//                 height: "100%" // Ensures label section takes full height
//               }}
//             >
//               <Typography color="#1E6DFF" variant="body2" fontWeight="bold">
//                 BU
//               </Typography>
//             </Box>

//             {/* Select Section */}
//             <FormControl
//               variant="outlined"
//               sx={{
//                 flex: 1,
//                 backgroundColor: "#101012", // Background color matching the container
//                 borderRadius: "0 4px 4px 0",
//                 height: "100%", // Ensures the FormControl takes up the full height
//                 "& .MuiOutlinedInput-root": {
//                   height: "100%", // Match input height with the container
//                   paddingLeft: "10px",
//                   paddingRight: "10px",
//                   display: "flex",
//                   alignItems: "center",
//                   borderRadius: "0 4px 4px 0" // Rounding the right corners
//                 },
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   border: "none" // Removes the border around the Select input
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "#fff" // Arrow icon color
//                 }
//               }}
//             >
//               <Select
//                 value={selectedBU}
//                 label="BU"
//                 onChange={(e) => updateBU(e.target.value)}
//                 MenuProps={{
//                   PaperProps: {
//                     sx: {
//                       backgroundColor: "#1B1D2A", // Dropdown background color
//                       color: "#fff",
//                       "& .MuiMenuItem-root": {
//                         "&.Mui-selected": {
//                           backgroundColor: "#1E6DFF" // Highlight color for selected item
//                         },
//                         "&:hover": {
//                           backgroundColor: "#1E6DFF" // Hover color
//                         }
//                       }
//                     }
//                   }
//                 }}
//                 sx={{
//                   color: "#fff",
//                   backgroundColor: "#101012" // Matches the form control background
//                 }}
//               >
//                 {BUs.map((bu) => (
//                   <MenuItem key={bu} value={bu}>
//                     {bu}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         </Grid>

//         <Grid item xs="auto" alignSelf="center" paddingRight={2}>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               backgroundColor: "#101012", // Background color for the container
//               borderRadius: 2,
//               minWidth: 250,
//               height: "40px" // Consistent height across both components
//             }}
//           >
//             {/* Label Section */}
//             <Box
//               sx={{
//                 backgroundColor: "#1B1D2A", // Darker background for the label
//                 padding: "0 12px", // Consistent padding for label section
//                 borderRadius: "4px 0 0 4px",
//                 display: "flex",
//                 alignItems: "center",
//                 height: "100%" // Ensures label section takes full height
//               }}
//             >
//               <Typography color="#1E6DFF" variant="body2" fontWeight="bold">
//                 Product
//               </Typography>
//             </Box>

//             {/* Select Section */}
//             <FormControl
//               variant="outlined"
//               sx={{
//                 flex: 1,
//                 backgroundColor: "#101012", // Background color matching the container
//                 borderRadius: "0 4px 4px 0",
//                 height: "100%", // Ensures the FormControl takes up the full height
//                 "& .MuiOutlinedInput-root": {
//                   height: "100%", // Match input height with the container
//                   paddingLeft: "10px",
//                   paddingRight: "10px",
//                   display: "flex",
//                   alignItems: "center",
//                   borderRadius: "0 4px 4px 0" // Rounding the right corners
//                 },
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   border: "none" // Removes the border around the Select input
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "#fff" // Arrow icon color
//                 }
//               }}
//             >
//               <Select
//                 value={selectedProduct}
//                 label="Product"
//                 onChange={(e) => updateProduct(e.target.value)}
//                 MenuProps={{
//                   PaperProps: {
//                     sx: {
//                       backgroundColor: "#1B1D2A", // Dropdown background color
//                       color: "#fff",
//                       maxHeight: "50rem", // Set maximum height
//                       "& .MuiMenuItem-root": {
//                         "&.Mui-selected": {
//                           backgroundColor: "#1E6DFF" // Highlight color for selected item
//                         },
//                         "&:hover": {
//                           backgroundColor: "#1E6DFF" // Hover color
//                         }
//                       }
//                     }
//                   }
//                 }}
//                 sx={{
//                   color: "#fff",
//                   backgroundColor: "#101012" // Matches the form control background
//                 }}
//               >
//                 <MenuItem value="All">All</MenuItem>
//                 {products.map((prd) => (
//                   <MenuItem key={prd} value={prd}>
//                     {prd}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         </Grid>

//         <Grid item xs="auto" alignSelf="center">
//           <DateRangeFilter />
//         </Grid>
//       </Grid>

//       {/* kpi data */}
//       {/*             
//             <Grid item xs={6} padding={5}>
//                 <Typography variant='h2' fontWeight='bold' >KPI Data</Typography>
//             </Grid>
//             <Grid item xs={6} textAlign='end' padding={5}>
//                 <Button sx={{
//                     backgroundColor: colors.blueAccent[700],
//                     color: colors.grey[100],
//                     fontSize: "12px",
//                     fontWeight: "bold",
//                     padding: "10px 10px"
//                 }}> Create Action</Button>
//             </Grid>
//  */}

//       <Grid
//         container
//         display="flex"
//         flexDirection="row"
//         justifyContent="space-around"
//         paddingTop={3}
//       >
//         <Grid
//           item
//           xs={2.8}
//           borderRadius={3}
//           sx={{ backgroundColor: colors.blueAccent[500] }}
//         >
//           <SimpleStatBox title="Total Cost" value={34} />
//         </Grid>
//         <Grid
//           item
//           xs={2.8}
//           borderRadius={3}
//           sx={{ backgroundColor: colors.blueAccent[500] }}
//         >
//           <SimpleStatBox title="Total Requests" value={4134} />
//         </Grid>
//         <Grid
//           item
//           xs={2.8}
//           borderRadius={3}
//           sx={{ backgroundColor: colors.blueAccent[500] }}
//         >
//           <SimpleStatBox title="Avg Cost/Req" value="$34" />
//         </Grid>
//         <Grid
//           item
//           xs={2.8}
//           borderRadius={3}
//           sx={{ backgroundColor: colors.blueAccent[500] }}
//         >
//           <SimpleStatBox title="Avg Latency" value="13ms" />
//         </Grid>
//       </Grid>

//       <Grid padding={3} paddingLeft={"12px"}>
//         <Grid
//           item
//           xs="auto"
//           display="flex"
//           flexDirection="row"
//           backgroundColor={colors.blueAccent[300]}
//           padding={0.5}
//           borderRadius={2}
//         >
//           <Button
//             sx={{
//               color: filter === "requests" ? colors.grey[900] : colors.grey[500]
//             }}
//             variant={filter === "requests" ? "outlined" : "text"}
//             onClick={() => setFilter("requests")}
//           >
//             Requests
//           </Button>

//           <Button
//             sx={{
//               color: filter === "cost" ? colors.grey[900] : colors.grey[500]
//             }}
//             variant={filter === "cost" ? "outlined" : "text"}
//             onClick={() => setFilter("cost")}
//           >
//             Cost
//           </Button>

//           <Button
//             sx={{
//               color: filter === "tokens" ? colors.grey[900] : colors.grey[500]
//             }}
//             variant={filter === "tokens" ? "outlined" : "text"}
//             onClick={() => setFilter("tokens")}
//           >
//             Tokens
//           </Button>
//         </Grid>
//       </Grid>

//       <Grid
//         xs={12}
//         backgroundColor="white"
//         borderRadius={2}
//         paddingY={2}
//         marginLeft={"12px"}
//       >
//         <ResponsiveContainer height={300}>
//           <LineChart data={chartData}>
//             <XAxis
//               scale="auto"
//               dataKey="date"
//               type="category" // set x-axis type as number
//               domain={["auto", "auto"]} // auto adjust based on values
//               interval="preserveStartEnd"
//               angle={0}
//               dx={0}
//               padding={{ right: 30 }}
//             />
//             <YAxis padding={{ top: 30 }} />
//             <Tooltip contentStyle={{ backgroundColor: colors.primary[600] }} />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="value"
//               stroke={colors.primary[400]}
//               name="count"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </Grid>
//     </Grid>
  );
};

export default AI;
