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
import SecurityIcon from "@mui/icons-material/Security";
import { useBUMenuOptions } from "../../customMenuOptions";
import { useContext, useEffect, useState } from "react";
import DateRangeFilter from "../../components/DateRangeFilter";
import { appConfig } from "../../appConfig";
import {
  PieChartGraph,
  PieChartGraphExplicit
} from "../../components/PieChartGraph";
import { DateContext } from "../../datecontext";
import {
  SlaAgeingStackedHorizontalBarChart,
  TopVulnerabilitiesStackedHorizontalBarChart
} from "../../components/BarChartWithThreshold";
import { SelectedBUContext } from "../../BUcontext";

const Security = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const BUs = useBUMenuOptions();
  // const [selectedBU, setSelectedBU] = useState('All')
  const { selectedBU, updateBU } = useContext(SelectedBUContext);
  const [selectedProject, setSelectedProject] = useState("All");
  const [BUList, setBUList] = useState([]);
  const [projectList, setProjectList] = useState([]);

  const { fromDate, toDate } = useContext(DateContext);

  const [unresolvedVulnerabilitiesData, setUnresolvedVulnerabilitiesData] =
    useState({
      "SLA Breached": [],
      "Risk Accepted": [],
      "On Track": [],
      "Ticket Summary": {},
      "By Priority": [],
      "Top 5 Vulnerability": {},
      AllSlaCounts: {},
      "Vulnerability Source": []
    });

  const [resolvedVulnerabilitiesData, setResolvedVulnerabilitiesData] =
    useState({});

  useEffect(() => {
    setBUList(BUs);
  }, [BUs]);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch(
        appConfig.backend_Api_Url + "/security/bu_and_projects"
      );
      const data = await response.json();
      if (selectedBU != "") {
        selectedBU === "All"
          ? setProjectList(Object.values(data).flat())
          : setProjectList(data[selectedBU]);
        if (selectedProject == "") {
          setSelectedProject("All");
        }
      } else {
        setProjectList([]);
        setSelectedProject("All");
      }
    };
    fetchProjects();
  }, [selectedBU]);

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

  const fetchUnresolvedVulnerabilitiesData = async () => {
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/security/unResolvedVulnerabilities?bu=${selectedBU}&project=${selectedProject}&from_date=${startDate}&to_date=${endDate}`
    );
    const data = await response.json();
    setUnresolvedVulnerabilitiesData(data);
  };

  const fetchResolvedVulnerabilitiesData = async () => {
    const startDate = date_conversion(fromDate) + "T00:00:00";
    const endDate = date_conversion(toDate) + "T23:59:59";
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/security/rv/projectSummary?bu=${selectedBU}&project=${selectedProject}&from_date=${startDate}&to_date=${endDate}`
    );
    const data = await response.json();
    setResolvedVulnerabilitiesData(data);
  };

  useEffect(() => {
    fetchUnresolvedVulnerabilitiesData();
    fetchResolvedVulnerabilitiesData();
  }, [fromDate, toDate, selectedBU, selectedProject]);

  const handleSecurityPageFilter = () => {};

  const ITEM_HEIGHT = 48;
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

  return (
    <Grid container alignItems="center" padding="0px 10px 40px">
      <Grid container justifyContent="space-between" spacing={1}>
        <Grid
          item
          xs="auto"
          paddingLeft="20px"
          display="flex"
          flexDirection="row"
          minWidth={300}
          alignItems={"center"}
        >
          <Link to="/security">
            <IconButton className="icon-button">
              <SecurityIcon
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
            Security
          </Typography>
        </Grid>
        <Grid
          container
          spacing={2}
          justifyContent="end"
          style={{ marginRight: "20px" }}
        >
          <Grid item xs="auto" alignSelf="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#101012", // Background color for the container
                borderRadius: 2,
                minWidth: 200,
                height: "40px" // Consistent height across both components
              }}
            >
              {/* Label Section */}
              <Box
                sx={{
                  backgroundColor: "#1B1D2A", // Darker background for the label
                  padding: "0 12px", // Consistent padding for label section
                  borderRadius: "4px 0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  height: "100%" // Ensures label section takes full height
                }}
              >
                <Typography color="#1E6DFF" variant="body2" fontWeight="bold">
                  BU
                </Typography>
              </Box>

              {/* Select Section */}
              <FormControl
                variant="outlined"
                sx={{
                  flex: 1,
                  backgroundColor: "#101012", // Background color matching the container
                  borderRadius: "0 4px 4px 0",
                  height: "100%", // Ensures the FormControl takes up the full height
                  "& .MuiOutlinedInput-root": {
                    height: "100%", // Match input height with the container
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "0 4px 4px 0" // Rounding the right corners
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none" // Removes the border around the Select input
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#fff" // Arrow icon color
                  }
                }}
              >
                <Select
                  value={selectedBU}
                  label="BU"
                  onChange={(e) => updateBU(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#1B1D2A", // Dropdown background color
                        color: "#fff",
                        "& .MuiMenuItem-root": {
                          "&.Mui-selected": {
                            backgroundColor: "#1E6DFF" // Highlight color for selected item
                          },
                          "&:hover": {
                            backgroundColor: "#1E6DFF" // Hover color
                          }
                        }
                      }
                    }
                  }}
                  sx={{
                    color: "#fff",
                    backgroundColor: "#101012" // Matches the form control background
                  }}
                >
                  {BUList.map((bu) => (
                    <MenuItem key={bu} value={bu}>
                      {bu}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs="auto" alignSelf="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#101012", // Background color for the container
                borderRadius: 2,
                minWidth: 250,
                height: "40px" // Consistent height across both components
              }}
            >
              {/* Label Section */}
              <Box
                sx={{
                  backgroundColor: "#1B1D2A", // Darker background for the label
                  padding: "0 12px", // Consistent padding for label section
                  borderRadius: "4px 0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  height: "100%" // Ensures label section takes full height
                }}
              >
                <Typography color="#1E6DFF" variant="body2" fontWeight="bold">
                  Product
                </Typography>
              </Box>

              {/* Select Section */}
              <FormControl
                variant="outlined"
                sx={{
                  flex: 1,
                  backgroundColor: "#101012", // Background color matching the container
                  borderRadius: "0 4px 4px 0",
                  height: "100%", // Ensures the FormControl takes up the full height
                  "& .MuiOutlinedInput-root": {
                    height: "100%", // Match input height with the container
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "0 4px 4px 0" // Rounding the right corners
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none" // Removes the border around the Select input
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#fff" // Arrow icon color
                  }
                }}
              >
                <Select
                  value={selectedProject}
                  label="Product"
                  onChange={(e) => setSelectedProject(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#1B1D2A", // Dropdown background color
                        color: "#fff",
                        maxHeight: "50rem", // Set maximum height
                        "& .MuiMenuItem-root": {
                          "&.Mui-selected": {
                            backgroundColor: "#1E6DFF" // Highlight color for selected item
                          },
                          "&:hover": {
                            backgroundColor: "#1E6DFF" // Hover color
                          }
                        }
                      }
                    }
                  }}
                  sx={{
                    color: "#fff",
                    backgroundColor: "#101012" // Matches the form control background
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {projectList.map((prd) => (
                    <MenuItem key={prd} value={prd}>
                      {prd}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs="auto" alignSelf="center">
            <DateRangeFilter />
          </Grid>
        </Grid>
      </Grid>
      <Grid container paddingTop={5} justifyContent="space-evenly">
        <Grid
          item
          xs={2.5}
          display="flex"
          flexDirection="column"
          border={1}
          borderRadius={2}
        >
          <Typography
            fontWeight="500"
            fontSize="20px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            # Total Unresolved
          </Typography>
          <Typography
            fontWeight="400"
            fontSize="32px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            {unresolvedVulnerabilitiesData["AllSlaCounts"]["Unresolved"]}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          display="flex"
          flexDirection="column"
          border={1}
          borderRadius={2}
        >
          <Typography
            fontWeight="500"
            fontSize="20px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            # On Track
          </Typography>
          <Typography
            fontWeight="400"
            fontSize="32px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            {unresolvedVulnerabilitiesData["AllSlaCounts"]["On Track"]}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          display="flex"
          flexDirection="column"
          border={1}
          borderRadius={2}
        >
          <Typography
            fontWeight="500"
            fontSize="20px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            # Past dueDate
          </Typography>
          <Typography
            fontWeight="400"
            fontSize="32px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            {unresolvedVulnerabilitiesData["AllSlaCounts"]["Past Duedate"]}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          display="flex"
          flexDirection="column"
          border={1}
          borderRadius={2}
        >
          <Typography
            fontWeight="500"
            fontSize="20px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            # Risk Accepted
          </Typography>
          <Typography
            fontWeight="400"
            fontSize="32px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            {unresolvedVulnerabilitiesData["AllSlaCounts"]["Risk Accepted"]}
          </Typography>
        </Grid>
        <Grid
          item
          xs={2}
          display="flex"
          flexDirection="column"
          border={1}
          borderRadius={2}
        >
          <Typography
            fontWeight="500"
            fontSize="20px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            # Unknown
          </Typography>
          <Typography
            fontWeight="400"
            fontSize="32px"
            color={colors.blueAccent[100]}
            textAlign="center"
          >
            {unresolvedVulnerabilitiesData["AllSlaCounts"]["Unknown"]}
          </Typography>
        </Grid>
      </Grid>

      <Grid container paddingTop={5} justifyContent="space-evenly">
        <Grid
          item
          xs={2}
          align="center"
          border={1}
          borderRadius={2}
          minWidth={260}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.blueAccent[900]}
            backgroundColor={colors.blueAccent[600]}
            paddingY={1}
            borderRadius={2}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: "500 !important"
            }}
          >
            {" "}
            SLA Breached
          </Typography>
          <PieChartGraphExplicit
            data={unresolvedVulnerabilitiesData["SLA Breached"]}
            dataKey="priority"
            dataValue="count"
            width={250}
            height={300}
          />
        </Grid>

        <Grid
          item
          xs={2}
          align="center"
          border={1}
          borderRadius={2}
          minWidth={260}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.blueAccent[900]}
            backgroundColor={colors.blueAccent[600]}
            paddingY={1}
            borderRadius={2}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: "500 !important"
            }}
          >
            {" "}
            Risk Accepted
          </Typography>
          <PieChartGraphExplicit
            data={unresolvedVulnerabilitiesData["Risk Accepted"]}
            dataKey="priority"
            dataValue="count"
            width={250}
            height={300}
          />
        </Grid>
        <Grid
          item
          xs={2}
          align="center"
          border={1}
          borderRadius={2}
          minWidth={260}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.blueAccent[900]}
            backgroundColor={colors.blueAccent[600]}
            paddingY={1}
            borderRadius={2}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: "500 !important"
            }}
          >
            {" "}
            on Track
          </Typography>
          <PieChartGraphExplicit
            data={unresolvedVulnerabilitiesData["On Track"]}
            dataKey="priority"
            dataValue="count"
            width={250}
            height={300}
          />
        </Grid>
        <Grid
          item
          xs={2}
          align="center"
          border={1}
          borderRadius={2}
          minWidth={260}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.blueAccent[900]}
            backgroundColor={colors.blueAccent[600]}
            paddingY={1}
            borderRadius={2}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: "500 !important"
            }}
          >
            {" "}
            By priority
          </Typography>
          <PieChartGraphExplicit
            data={unresolvedVulnerabilitiesData["By Priority"]}
            dataKey="priority"
            dataValue="count"
            width={250}
            height={300}
          />
        </Grid>
        <Grid
          item
          xs={2}
          align="center"
          border={1}
          borderRadius={2}
          minWidth={260}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.blueAccent[900]}
            backgroundColor={colors.blueAccent[600]}
            paddingY={1}
            borderRadius={2}
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: "500 !important"
            }}
          >
            {" "}
            Vulnerability Source
          </Typography>
          <PieChartGraphExplicit
            data={unresolvedVulnerabilitiesData["Vulnerability Source"]}
            dataKey="source"
            dataValue="count"
            width={250}
            height={300}
          />
        </Grid>
      </Grid>

      <Grid
        container
        display="flex"
        flexDirection="row"
        paddingY={5}
        justifyContent="space-evenly"
        marginLeft={"12px"}
      >
        <Grid item xs={5.8} minWidth={500} border={1} borderRadius={2}>
          <Typography variant="h2" fontWeight="bold" padding={2}>
            Ticket Summary
          </Typography>
          <Grid
            item
            width="100%"
            backgroundColor={colors.blueAccent[600]}
            borderRadius={2}
            padding={2}
            color={colors.primary[900]}
            minWidth={500}
          >
            <Grid display="flex" alignItems="center">
              <Typography variant="h3" fontWeight="bold" minWidth={300}>
                Project
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                # Tickets
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            width="100%"
            backgroundColor={colors.blueAccent[900]}
            padding={2}
            color={colors.blueAccent[100]}
            minWidth={500}
            sx={{
              height: 200,
              overflowY: "auto",
              overflowX: "auto"
            }}
          >
            {Object.entries(
              unresolvedVulnerabilitiesData["Ticket Summary"]
            ).map(([name, count]) => {
              const total = Object.values(
                unresolvedVulnerabilitiesData["Ticket Summary"]
              ).reduce((acc, curr) => acc + curr, 0);
              const percent = (count * 100) / total;
              return (
                <Grid key={name} display="flex" alignItems="center">
                  <Typography variant="h3" minWidth={280}>
                    {name}
                  </Typography>
                  <Grid display="flex" alignItems="center">
                    <Grid
                      backgroundColor={colors.blueAccent[300]}
                      height="20px"
                      width={`${5 * percent}px`}
                      maxWidth="400px"
                      borderRadius={2}
                    />
                    <Typography variant="h3">{count}</Typography>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
          <Grid
            item
            width="100%"
            backgroundColor={colors.blueAccent[600]}
            padding={1}
            color={colors.blueAccent[900]}
          >
            <Grid display="flex" alignItems="flex-start">
              <Typography variant="h4" fontWeight="bold" minWidth={300}>
                Total
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {Object.values(
                  unresolvedVulnerabilitiesData["Ticket Summary"]
                ).reduce((acc, curr) => acc + curr, 0)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={5.8} minWidth={500} border={1} borderRadius={2}>
          <Typography variant="h2" fontWeight="bold" padding={2}>
            {" "}
            Top 5 Vulnerabilities
          </Typography>
          <Grid backgroundColor={colors.blueAccent[900]}>
            <TopVulnerabilitiesStackedHorizontalBarChart
              data={unresolvedVulnerabilitiesData["Top 5 Vulnerability"]}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container justifyContent="space-evenly">
        <Grid item xs={5.8} border={1} borderRadius={2}>
          <Typography variant="h2" fontWeight="bold" padding={2}>
            {" "}
            Ageing after SLA breach - Resolved Bugs
          </Typography>
          <SlaAgeingStackedHorizontalBarChart
            data={resolvedVulnerabilitiesData}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Security;
