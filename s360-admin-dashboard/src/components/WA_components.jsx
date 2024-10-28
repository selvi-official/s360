import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import { useContext, useState } from "react";
import {
  DataGrid,
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { v4 as uuidv4 } from "uuid";
import CustomTitle from "./CustomTItle";
import {
  fetchControlResourceData,
  fetchFRTicketsForControlForAccount,
  fetchFRTicketsForControlForProduct,
} from "../util/HelperFunctions";
import { SelectedBUContext } from "../BUcontext";
import { SelectedProductContext } from "../productcontext";
import { SelectedAccountContext } from "../accountContext";
import { SelectedRegionContext } from "../RegionContext";
import { SelectedEnvContext } from "../EnvContext";

export const StatCard = ({
  title,
  count,
  totalCount,
  onClick,
  id,
  activeId,
  style,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isActive = id === activeId;

  return (
    <Card
      onClick={onClick}
      style={{
        // maxWidth: 200,
        // margin: 10,
        cursor: "pointer",
        backgroundColor: isActive
          ? colors.primary["filterBackground"]
          : colors.primary[400],
        // marginBottom: 10,
        ...style,
      }}
    >
      <CardContent>
        <Grid
          container
          flexDirection="column"
          // alignItems="center"
          justifyContent="space-between"
          height={100}
          minWidth={220}
        >
          <Grid item>
            {/* <Typography variant="h3">{title}</Typography> */}
            <CustomTitle title={title} variant="h3" />
          </Grid>
          <Grid container justifyContent="space-between" paddingX={4}>
            <Grid
              item
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {/* <Typography
                variant="h2"
                color={colors.redAccent[400]}
                paddingLeft={1}
              >
                {count}
              </Typography> 
              <Typography variant="body2">Failed </Typography> */}
              <CustomTitle
                title={count}
                variant="h2"
                color={colors.redAccent[400]}
              />

              <CustomTitle title="Failed" variant="body2" />
            </Grid>
            <Grid
              item
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {/* <Typography variant="h2" paddingLeft={0.5}>
                {totalCount}
              </Typography>
              <Typography variant="body2">Total </Typography> */}
              <CustomTitle title={totalCount} variant="h2" />
              <CustomTitle title="Total" variant="body2" />
            </Grid>
          </Grid>
        </Grid>
        {/* <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {value1}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {value2}
        </Typography> */}
      </CardContent>
    </Card>
  );
};

// export const StatAccordions = ({
//   pillar,
//   severity,
//   count,
//   controlList,
//   resourceList
// }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [isDialogueOpen, setDialogueOpen] = useState(false);
//   const [controlResourceList, setControlResourceList] = useState([]);
//   const resourceDataColumns = [
//     // {field: 'id', headerName: 'ID'},
//     { field: "resource", headerName: "ARN/Resource", flex: 2 },
//     { field: "pillar", headerName: "Pillar", flex: 1 },
//     { field: "service", headerName: "Service", flex: 1 },
//     { field: "reason", headerName: "Reason", flex: 2 },
//     { field: "status", headerName: "Status", flex: 1 }
//   ];

//   const handleDialogueOpen = (controlName) => {
//     // console.log(controlName);
//     console.log(resourceList);
//     const data = resourceList.filter((item) => item.control_id?.split(".")[1] === controlName);
//     const data_with_id = data.map((item, index) => {
//       return { ...item, id: index };
//     });
//     setControlResourceList(data_with_id);
//     setDialogueOpen(true);
//   };

//   const handleDialogueClose = () => {
//     setDialogueOpen(false);
//     setControlResourceList([]);
//   };
//   // const getRowId = (row) =>  uuidv4();

//   return (
//     <>
//       <Accordion sx={{ backgroundColor: colors.primary[400] }}>
//         <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//           {/* <Typography
//             variant="h3"
//             fontWeight="bold"
//             sx={{ width: "90%", flexShrink: 0 }}
//           >
//             {severity} Controls
//           </Typography>
//           <Typography
//             variant="h3"
//             fontWeight="bold"
//             color={colors.redAccent[400]}
//           >
//             {count}
//           </Typography>
//           <Typography variant="h3" fontWeight="bold">
//             /{controlList.length}
//           </Typography> */}
//           <CustomTitle title={severity} variant="h4"  sx={{ width: "95%", flexShrink: 0 }}/>
//           <CustomTitle title={count} variant="h4" color={colors.redAccent[400]} />
//           <CustomTitle title={`/${controlList.length}`} variant="h4" />
//         </AccordionSummary>
//         <AccordionDetails>
//           {controlList.map((control) => (
//             <Typography
//               key={control.name}
//               color={control.isAlarm ? "secondary" : colors.redAccent[400]}
//             >
//               {control.title}
//               <IconButton onClick={() => handleDialogueOpen(control.name)}>
//                 <OpenInNewIcon />
//               </IconButton>
//               <Dialog
//                 fullScreen={true}
//                 open={isDialogueOpen}
//                 onClose={handleDialogueClose}
//                 PaperProps={{
//                   style: {
//                     width: "80%",
//                     height: "80%",
//                     backgroundColor: colors.primary[500]
//                   }
//                 }}
//               >
//                 <AppBar
//                   sx={{
//                     position: "relative",
//                     backgroundColor: colors.primary[600]
//                   }}
//                 >
//                   <Toolbar>
//                     <Typography sx={{ ml: 2, flex: 1 }} variant="h3">
//                       Resources Details for control:{" "}
//                       {controlResourceList[0]?.control_title}
//                     </Typography>
//                     <IconButton
//                       edge="end"
//                       color="inherit"
//                       onClick={handleDialogueClose}
//                       aria-label="close"
//                     >
//                       <CloseIcon />
//                     </IconButton>

//                     {/* <Button autoFocus color="inherit" onClick={handleClose}>
//               save
//             </Button> */}
//                   </Toolbar>
//                 </AppBar>

//                 {isDialogueOpen && (
//                   <DataGrid
//                     rows={controlResourceList}
//                     columns={resourceDataColumns}
//                     // getRowId={getRowId}
//                     autoSize={true}
//                     getRowHeight={() => "auto"}
//                     rowSelection={false}
//                     slots={{ toolbar: GridToolbar }}
//                     slotProps={{
//                       toolbar: {
//                         showQuickFilter: true
//                       }
//                     }}
//                     sx={{
//                       // Customize header styles
//                       "& .MuiDataGrid-columnHeader": {
//                         color: colors.grey[100],
//                         backgroundColor: colors.blueAccent[700],
//                         fontSize: "20px"
//                       },
//                       // Customize body styles (cells)
//                       "& .MuiDataGrid-cell": {
//                         color: colors.grey[100],
//                         backgroundColor: colors.primary[400],
//                         fontSize: "20px",

//                         wordWrap: "break-word"
//                       },
//                       "& .MuiDataGrid-toolbarContainer": {
//                         backgroundColor: colors.blueAccent[400],
//                         fontSize: "40px"
//                       }
//                     }}
//                   />
//                 )}
//               </Dialog>
//             </Typography>
//           ))}
//         </AccordionDetails>
//       </Accordion>
//     </>
//   );
// };

export const StatAccordionsV2 = ({
  pillar,
  severity,
  severityControlStats,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct } = useContext(SelectedProductContext);
  const { selectedAccount } = useContext(SelectedAccountContext);
  const { selectedRegion } = useContext(SelectedRegionContext);
  const { selectedEnv } = useContext(SelectedEnvContext);

  const [isDialogueOpen, setDialogueOpen] = useState(false);
  const [isTicketDialogueOpen, setTicketDialogueOpen] = useState(false);

  const resourceDataColumns = [
    // {field: 'id', headerName: 'ID'},
    { field: "resource", headerName: "ARN/Resource", flex: 3 },
    { field: "pillar", headerName: "Pillar", flex: 1 },
    { field: "service", headerName: "Service", flex: 1 },
    { field: "reason", headerName: "Reason", flex: 2 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const FRTktDataColumns = [
    // {field: 'id', headerName: 'ID'},
    {
      field: "key",
      headerName: "TktID",
      flex: 1,
      renderCell: (params) => {
        return (
          <a
            href={`https://freshworks.freshrelease.com/ws/${
              params.value.split("-")[0]
            }/tasks/${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {params.value}
          </a>
        );
      },
    },
    { field: "title", headerName: "Title", flex: 2 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const statusMap = {
          18: "Open",
          19: "In Progress",
          20: "Closed",
        };
        const status = statusMap[params.value];
        return status || "Unknown";
      },
    },
    {
      field: "priority_id",
      headerName: "Priority",
      flex: 1,
      renderCell: (params) => {
        const severityMap = {
          5: "Low",
          6: "Medium",
          7: "High",
          8: "Urgent",
        };
        const severity = severityMap[params.value];
        return severity || "Unknown";
      },
    },
    { field: "created_at", headerName: "Created On", flex: 1 },
  ];

  const [controlResourceList, setControlResourceList] = useState([]);
  const [controlFRTicketList, setControlFRTicketList] = useState([]);

  const [controlResourceListTitle, setControlResourceListTitle] = useState("");

  const handleDialogueOpen = async (controlID, controlTitle) => {
    setDialogueOpen(true);
    setControlResourceListTitle(controlTitle);
    const data = await fetchControlResourceData(
      selectedBU,
      selectedProduct,
      selectedAccount,
      selectedRegion,
      controlID,
      selectedEnv
    );
    const data_with_id = data.map((item, index) => {
      return { ...item, id: index };
    });
    setControlResourceList(data_with_id);

    // console.log(data_with_id);
  };

  const handleDialogueClose = () => {
    setDialogueOpen(false);
    setControlResourceList([]);
  };

  const handleTicketDialogueOpen = async (controlID, controlTitle) => {
    if (selectedAccount === "All") {
      setTicketDialogueOpen(true);
      setControlResourceListTitle(controlTitle);
      const data = await fetchFRTicketsForControlForProduct(
        controlID,
        selectedProduct,
        selectedRegion
      );
      const data_with_id = data;
      setControlFRTicketList(data_with_id);
    } else {
      const data = await fetchFRTicketsForControlForAccount(
        controlID,
        selectedAccount,
        selectedRegion
      );
      const ticketKey = data[0]?.key;
      if (ticketKey) {
        // const response = await fetch('/api/fetch-id'); // Replace with your API endpoint
        // const id = response.data.id;
        // const id = "WELL-1171";
        const fr_key = ticketKey.split("-")[0];
        const linkUrl = `https://freshworks.freshrelease.com/ws/${fr_key}/tasks/${ticketKey}`; // Construct the link URL

        // Open the link in a new tab
        window.open(linkUrl, "_blank");
      } else {
        alert("No tickets found for the control");
      }
    }
  };
  const handleTicketDialogueClose = () => {
    setTicketDialogueOpen(false);
    setControlFRTicketList([]);
  };
  // const getRowId = (row) =>  uuidv4();
  // console.log(severityControlStats)

  return (
    <>
      <Accordion sx={{ backgroundColor: colors.primary[400] }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <CustomTitle
            title={severity}
            variant="h4"
            sx={{ width: "95%", flexShrink: 0 }}
          />
          <CustomTitle
            title={severityControlStats[severity.toLowerCase()]?.failed || 0}
            variant="h4"
            color={colors.redAccent[400]}
          />
          <CustomTitle
            title={`/${
              severityControlStats[severity.toLowerCase()]?.total || 0
            }`}
            variant="h4"
          />
        </AccordionSummary>
        <AccordionDetails>
          {severityControlStats[severity?.toLowerCase()]?.controlList.map(
            (control) => (
              <Typography
                key={control.control_id}
                color={
                  control.status == "pass" ? "secondary" : colors.redAccent[400]
                }
              >
                {/* {control.control_title} */}
                <a
                  href="#"
                  underline="none"
                  style={{ color: "inherit" }}
                  onClick={() =>
                    handleDialogueOpen(
                      control.control_id,
                      control.control_title
                    )
                  }
                  title="click to see resources for the control"
                >
                  {control.control_title}
                </a>
                <IconButton
                  onClick={() =>
                    handleTicketDialogueOpen(
                      control.control_id,
                      control.control_title
                    )
                  }
                >
                  <img
                    width="20"
                    height="20"
                    src="/fr_logo.ico"
                    alt="FR Logo"
                  />
                </IconButton>
                <Dialog
                  fullScreen={true}
                  open={isTicketDialogueOpen}
                  onClose={handleTicketDialogueClose}
                  PaperProps={{
                    style: {
                      width: "80%",
                      height: "80%",
                      backgroundColor: colors.primary[500],
                    },
                  }}
                >
                  <AppBar
                    sx={{
                      position: "relative",
                      backgroundColor: colors.primary[700],
                    }}
                  >
                    <Toolbar>
                      <Typography sx={{ ml: 2, flex: 1 }} variant="h3">
                        FR Tickets for the control: {controlResourceListTitle}
                      </Typography>
                      <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleTicketDialogueClose}
                        aria-label="close"
                      >
                        <CloseIcon />
                      </IconButton>

                      {/* <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button> */}
                    </Toolbar>
                    {isTicketDialogueOpen && (
                      <DataGrid
                        rows={controlFRTicketList}
                        columns={FRTktDataColumns}
                        // getRowId={getRowId}
                        getRowHeight={() => "auto"}
                        // columnHeaderHeight={40}
                        rowSelection={false}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                          toolbar: {
                            showQuickFilter: true,
                          },
                        }}
                        sx={{
                          // Customize header styles
                          "& .MuiDataGrid-columnHeader": {
                            color: "#1e6dff",
                            backgroundColor: "#1b1d2a",
                            fontSize: "14px",
                          },
                          // Customize body styles (cells)
                          "& .MuiDataGrid-cell": {
                            color: colors.grey[100],
                            backgroundColor: colors.primary[400],
                            fontSize: "14px",
                            paddingY: 1,
                            wordWrap: "break-word",
                          },
                          "& .MuiDataGrid-toolbarContainer": {
                            backgroundColor: colors.primary[300],
                            fontSize: "14px",
                          },
                        }}
                      />
                    )}
                  </AppBar>
                </Dialog>

                <Dialog
                  fullScreen={true}
                  open={isDialogueOpen}
                  onClose={handleDialogueClose}
                  PaperProps={{
                    style: {
                      width: "80%",
                      height: "80%",
                      backgroundColor: colors.primary[500],
                    },
                  }}
                >
                  <AppBar
                    sx={{
                      position: "relative",
                      backgroundColor: colors.primary[700],
                    }}
                  >
                    <Toolbar>
                      <Typography sx={{ ml: 2, flex: 1 }} variant="h3">
                        Resources Details for control:{" "}
                        {controlResourceListTitle}
                      </Typography>
                      <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleDialogueClose}
                        aria-label="close"
                      >
                        <CloseIcon />
                      </IconButton>

                      {/* <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button> */}
                    </Toolbar>
                  </AppBar>

                  {isDialogueOpen && (
                    <DataGrid
                      rows={controlResourceList}
                      columns={resourceDataColumns}
                      // getRowId={getRowId}
                      getRowHeight={() => "auto"}
                      // columnHeaderHeight={40}
                      rowSelection={false}
                      slots={{ toolbar: GridToolbar }}
                      slotProps={{
                        toolbar: {
                          showQuickFilter: true,
                        },
                      }}
                      sx={{
                        // Customize header styles
                        "& .MuiDataGrid-columnHeader": {
                          color: "#1e6dff",
                          backgroundColor: "#1b1d2a",
                          fontSize: "14px",
                        },
                        // Customize body styles (cells)
                        "& .MuiDataGrid-cell": {
                          color: colors.grey[100],
                          backgroundColor: colors.primary[400],
                          fontSize: "14px",
                          paddingY: 1,
                          wordWrap: "break-word",
                        },
                        "& .MuiDataGrid-toolbarContainer": {
                          backgroundColor: colors.primary[300],
                          fontSize: "14px",
                        },
                      }}
                    />
                  )}
                </Dialog>
              </Typography>
            )
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
