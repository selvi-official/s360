import {
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Typography,
  useTheme,
  Autocomplete,
  TextField,
  Paper,
  Box,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import FilterBox from "../../components/FilterBox";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import RefreshIcon from "@mui/icons-material/Refresh";
import { tokens } from "../../theme";
import { useContext, useEffect, useState } from "react";
import { DateContext } from "../../datecontext";
import { SelectedBUContext } from "../../BUcontext";
import { SelectedProductContext } from "../../productcontext";

import { HorizontalBarChart } from "../../components/CustomBarChart";
import {
  fetchPillarScores,
  fetchEvalResultData,
  fetchAccountList,
  fetchHistoricalPillarScores,
  fetchPillarScoresV2,
  fetchHistoricalPillarScoresV2,
  fetchEvalResultDataV2,
  fetchPillarControlStatsData,
  fetchSeverityControlStatsData,
} from "../../util/HelperFunctions";

import { SelectedAccountContext } from "../../accountContext";
import {
  StatAccordions,
  StatAccordionsV2,
  StatCard,
} from "../../components/WA_components";
import { BUFilter } from "../../components/BUFilter";
import { ProductFilter } from "../../components/ProductFilter";
import { AccountFilter } from "../../components/AccountFilter";
import { SelectedRegionContext } from "../../RegionContext";
import RegionFilter from "../../components/RegionFilter";
import DateRangeFilter from "../../components/DateRangeFilter";
import { WAPillarScoreHistoricalChart } from "../../components/CustomLineChart";
import CustomTitle from "../../components/CustomTItle";
import { CustomButton } from "../../components/CustomButton";
import { EnvFilter } from "../../components/EnvFilter";
import { SelectedEnvContext } from "../../EnvContext";
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import { CardActionArea } from '@mui/material';


export const WellArchitected = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(false);
  // const [selectedAccount, setSelectedAccount] = useState("All");
  const [accountList, setAccountList] = useState([]);

  const { fromDate, toDate, rangeSelection } = useContext(DateContext);
  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);
  const { selectedAccount, updateAccount } = useContext(SelectedAccountContext);
  const { selectedRegion, updateRegion } = useContext(SelectedRegionContext);
  const { selectedEnv } = useContext(SelectedEnvContext);

  

  const date_conversion = (date) =>
    date
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split(", ")[0]
      .split("/")
      .reverse()
      .join("-");

  const [pillarScoreData, setPillarScoreData] = useState([]);

  const fetchPillarScoreData = async (bu, product, account, region) => {
    // var data = [];
    if (!account || !product || !bu) {
      setPillarScoreData([]);
    } else {
      const data = await fetchPillarScoresV2(
        bu,
        product,
        account,
        region,
        selectedEnv
      );

      setPillarScoreData(data);
    }
  };

  const [historicalPillarScoreData, setHistoricalPillarScoreData] = useState(
    []
  );

  const fetchHistoricalPillarScoresData = async (account, region) => {
    // var data = [];
    if (!account) {
      setHistoricalPillarScoreData([]);
    } else {
      const data = await fetchHistoricalPillarScoresV2(
        selectedBU,
        selectedProduct,
        account,
        region,
        date_conversion(fromDate),
        date_conversion(toDate),
        selectedEnv
      );

      setHistoricalPillarScoreData(data);
    }
  };

  const [pillarControlStats, setPillarControlStats] = useState({
    RELIABILITY: { failed: 0, total: 0 },
    SECURITY: { failed: 0, total: 0 },
    COST: { failed: 0, total: 0 },
    "OPERATIONAL EXCELLENCE": { failed: 0, total: 0 },
    "PERFORMANCE EFFICIENCY": { failed: 0, total: 0 },
  });

  const fetchPillarControlStats = async (bu, product, account, region, env) => {
    const data = await fetchPillarControlStatsData(
      bu,
      product,
      account,
      region,
      env
    );
    if (Object.keys(data).length > 0) {
      setPillarControlStats(data);
    } else
      setPillarControlStats({
        RELIABILITY: { failed: 0, total: 0 },
        SECURITY: { failed: 0, total: 0 },
        COST: { failed: 0, total: 0 },
        "OPERATIONAL EXCELLENCE": { failed: 0, total: 0 },
        "PERFORMANCE EFFICIENCY": { failed: 0, total: 0 },
      });
  };

  const [severityControlStats, setSeverityControlStats] = useState({});

  const fetchSeverityControlStats = async (
    bu,
    product,
    account,
    region,
    pillar,
    env
  ) => {
    const data = await fetchSeverityControlStatsData(
      bu,
      product,
      account,
      region,
      pillar,
      env
    );
    setSeverityControlStats(data);
  };

  useEffect(() => {
    handlePageRefresh();
  }, [
    selectedBU,
    selectedProduct,
    selectedAccount,
    selectedRegion,
    selectedEnv,
  ]);

  useEffect(() => {
    fetchHistoricalPillarScoresData(selectedAccount, selectedRegion);
  }, [
    selectedProduct,
    selectedAccount,
    selectedRegion,
    fromDate,
    toDate,
    selectedEnv,
  ]);

  const handlePageRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPillarScoreData(
          selectedBU,
          selectedProduct,
          selectedAccount,
          selectedRegion,
          selectedEnv
        ),
        fetchPillarControlStats(
          selectedBU,
          selectedProduct,
          selectedAccount,
          selectedRegion,
          selectedEnv
        ),
      ]);
    } catch (error) {
      console.error("Error fetching data from backend api", error);
    } finally {
      setLoading(false);
    }
  };

  const [activePillarCard, setActivePillarCard] = useState(null);
  const handleCardClick = (pillar) => {
    if (activePillarCard === pillar) {
      setActivePillarCard(null);
    }
    // Reset the active ID if the clicked card is already active
    else {
      setActivePillarCard(pillar); // Update the active ID to the clicked card's ID
    }
  };
  useEffect(() => {
    if (activePillarCard) {
      fetchSeverityControlStats(
        selectedBU,
        selectedProduct,
        selectedAccount,
        selectedRegion,
        activePillarCard,
        selectedEnv
      );
    }
  }, [selectedAccount, selectedRegion, activePillarCard, selectedEnv]);

  return (
    <Grid container alignItems="center">
      <Grid
        minWidth={350}
        display="flex"
        flexDirection="row"
        alignItems="center"
      >
        <Link to="/well_architected">
          <IconButton className="icon-button">
            <ArchitectureIcon
              sx={{
                color: "#ffffff",
                fontSize: 70,
                height: "38px",
                width: "38px",
              }}
            />
          </IconButton>
        </Link>
        <Typography variant="h1" fontWeight="600">
          Well Architected
          {/* <span style={{ color: "red", marginLeft: "5px", fontSize: "20px" }}>
            Beta
          </span> */}
        </Typography>
        <Typography
          sx={{
            color: "red",
            marginLeft: "5px",
            fontSize: "20px",
            alignSelf: "flex-start",
          }}
        >
          Beta
        </Typography>
      </Grid>
      <Grid
        container
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        paddingY={4}
        marginRight={2}
        marginLeft={"12px"}
        alignItems="center"
        className="filter-wrapper"
      >
        <Grid item xs="auto" display="flex" gap={2}>
          <BUFilter />

          <ProductFilter />

          <EnvFilter />

          <AccountFilter />

          <RegionFilter />

          <DateRangeFilter />

          {/* <CustomButton
            icon={<RefreshIcon />}
            Title="Refresh"
            onClick={handlePageRefresh}
          /> */}
        </Grid>
        {/* <Grid item xs="auto">
          
        </Grid> */}
      </Grid>
      {/* </Grid> */}

      {selectedAccount !== null ? (
        <>
          <Grid
            container
            spacing={1}
            padding={1}
            style={{ padding: "8px 20px", fontSize: "12px" }}
          >
            <Grid
              container
              justifyContent="space-between"
              className="grid-item-border-wrapper"
            >
              <Grid
                item
                xs={5.8}
                display="flex"
                flexDirection="column"
                borderRadius={2}
                backgroundColor={colors.primary[400]}
                padding={2}
                alignItems="center"
              >
                {/* <Typography variant="h2" fontWeight="bold" fontSize="30px">
                Pillar scores
              </Typography> */}
                <CustomTitle title="Pillar Scores" variant="h3" />
                <Grid width="100%" height={350}>
                  <HorizontalBarChart data={pillarScoreData} />

                  {/* <HorizontalBarChart data={pillarScoreData} /> */}
                </Grid>
              </Grid>
              <Grid
                item
                xs={5.8}
                display="flex"
                flexDirection="column"
                borderRadius={2}
                backgroundColor={colors.primary[400]}
                padding={2}
                alignItems="center"
              >
                {/* <Typography variant="h2" fontWeight="bold" fontSize="30px">
                Historical Pillar scores
              </Typography> */}
                <CustomTitle title="Historical Pillar Scores" variant="h3" />
                <Grid width="100%" height={350}>
                  <WAPillarScoreHistoricalChart
                    data={historicalPillarScoreData}
                    className={"wapillaryscorehistoricalchart"}
                  />

                  {/* <HorizontalBarChart data={pillarScoreData} /> */}
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              display="flex"
              justifyContent="space-between"
              paddingY={4}
              alignContent="space-between"
              paddingBottom={"0"}
            >
              <StatCard
                id="RELIABILITY"
                activeId={activePillarCard}
                title="Reliability"
                // count={getAlarmControlCountBySeverity("RELIABILITY", "all")}
                // totalCount={getTotalControlCount("RELIABILITY")}
                count={pillarControlStats["RELIABILITY"]?.failed || 0}
                totalCount={pillarControlStats["RELIABILITY"]?.total || 0}
                onClick={() => {
                  handleCardClick("RELIABILITY");
                }}
                style={{ marginBottom: "16px" }}
              />
              <StatCard
                id="SECURITY"
                activeId={activePillarCard}
                title="Security"
                // count={getAlarmControlCountBySeverity("SECURITY", "all")}
                // totalCount={getTotalControlCount("SECURITY")}
                count={pillarControlStats["SECURITY"]?.failed || 0}
                totalCount={pillarControlStats["SECURITY"]?.total || 0}
                onClick={() => {
                  handleCardClick("SECURITY");
                }}
                style={{ marginBottom: "16px" }}
              />
              <StatCard
                id="COST"
                activeId={activePillarCard}
                title="Cost"
                // count={getAlarmControlCountBySeverity("COST", "all")}
                // totalCount={getTotalControlCount("COST")}
                count={pillarControlStats["COST"]?.failed || 0}
                totalCount={pillarControlStats["COST"]?.total || 0}
                onClick={() => {
                  handleCardClick("COST");
                }}
                style={{ marginBottom: "16px" }}
              />
              <StatCard
                id="OPERATIONAL EXCELLENCE"
                activeId={activePillarCard}
                title="Operational Excellence"
                // count={getAlarmControlCountBySeverity(
                //   "OPERATIONAL EXCELLENCE",
                //   "all"
                // )}
                // totalCount={getTotalControlCount("OPERATIONAL EXCELLENCE")}
                count={
                  pillarControlStats["OPERATIONAL EXCELLENCE"]?.failed || 0
                }
                totalCount={
                  pillarControlStats["OPERATIONAL EXCELLENCE"]?.total || 0
                }
                onClick={() => {
                  handleCardClick("OPERATIONAL EXCELLENCE");
                }}
                style={{ marginBottom: "16px" }}
              />
              <StatCard
                id="PERFORMANCE EFFICIENCY"
                activeId={activePillarCard}
                title="Performance Efficiency"
                // count={getAlarmControlCountBySeverity(
                //   "PERFORMANCE EFFICIENCY",
                //   "all"
                // )}
                // totalCount={getTotalControlCount("PERFORMANCE EFFICIENCY")}
                count={
                  pillarControlStats["PERFORMANCE EFFICIENCY"]?.failed || 0
                }
                totalCount={
                  pillarControlStats["PERFORMANCE EFFICIENCY"]?.total || 0
                }
                onClick={() => {
                  handleCardClick("PERFORMANCE EFFICIENCY");
                }}
                style={{ marginBottom: "16px" }}
              />
            </Grid>
            <Grid container paddingY={4}>
              {/* <Outlet /> */}
              {activePillarCard && (
                <Grid display="flex" flexDirection="column" width="100%">
                  <StatAccordionsV2
                    pillar={activePillarCard}
                    severity={"Critical"}
                    severityControlStats={severityControlStats}
                  />
                  <StatAccordionsV2
                    pillar={activePillarCard}
                    severity={"High"}
                    severityControlStats={severityControlStats}
                  />
                  <StatAccordionsV2
                    pillar={activePillarCard}
                    severity={"Medium"}
                    severityControlStats={severityControlStats}
                  />
                  <StatAccordionsV2
                    pillar={activePillarCard}
                    severity={"Low"}
                    severityControlStats={severityControlStats}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Dialog open={loading}>
            <DialogContent>
              <CircularProgress />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Grid container justifyContent="center">
          {/* <Typography variant="h3" paddingTop={5}>
            No account Selected
          </Typography> */}
          <CustomTitle
            title="No Account Selected"
            variant="h3"
            alignSelf="center"
          />
        </Grid>
      )}
    </Grid>
  );
};
