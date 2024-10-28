import {
  Box,
  Grid,
  Typography,
  useTheme,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination
} from "@mui/material";
import { tokens } from "../../theme";
import { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import FilterBox from "../../components/FilterBox";
import { SelectedProductContext } from "../../productcontext";
import { SelectedBUContext } from "../../BUcontext";
import { appConfig } from "../../appConfig";
import { DateContext } from "../../datecontext";

const KPIs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedProduct } = useContext(SelectedProductContext);
  const { selectedBU } = useContext(SelectedBUContext);
  const { fromDate, toDate } = useContext(DateContext);

  const [pillar, setPillar] = useState("Reliability");
  const [kpis, setKpis] = useState([]);
  const [page, setPage] = useState(0); // For pagination
  const [rowsPerPage, setRowsPerPage] = useState(20); // For pagination

  const getKpis = async () => {
    const kpis_response = await fetch(
      appConfig.backend_Api_Url +
        `/kpi_table?bu=${selectedBU}&product=${selectedProduct}`
    );
    const kpis_data = await kpis_response.json();
    setKpis(kpis_data);
  };

  const handlePillarChange = (event) => {
    setPillar(event.target.value);
  };

  const handleDashboardFilter = async () => {
    getKpis();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to first page whenever rows per page changes
  };

  useEffect(() => {
    handleDashboardFilter();
  }, [selectedBU, selectedProduct, fromDate, toDate]);

  // Paginate the kpis array
  const paginatedKpis = kpis.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Grid container alignItems="center" width={"100%"} padding="0px 10px 40px">
      <Grid item xs="auto" paddingLeft="10px">
        <Typography variant="h1" fontWeight="600">
          KPIs
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

      <Grid container padding="20px 10px">
        <TableContainer component={Paper} sx={{ minHeight: "600px" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ height: "40px" }}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    backgroundColor: colors.blueAccent[800],
                    paddingLeft: "40px"
                  }}
                >
                  KPI Name
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    backgroundColor: colors.blueAccent[800],
                    width: "150px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Product
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    backgroundColor: colors.blueAccent[800],
                    whiteSpace: "nowrap"
                  }}
                >
                  SLA Defined
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    backgroundColor: colors.blueAccent[800]
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              align="center"
              sx={{ backgroundColor: colors.primary[400] }}
            >
              {paginatedKpis.length > 0 ? (
                paginatedKpis.map((row, index) => (
                  <TableRow hover key={index}>
                    <TableCell sx={{ fontSize: "15px", paddingLeft: "40px" }}>
                      {row["KPI Name"]}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        fontSize: "15px",
                        width: "150px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {row.Product}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "15px", whiteSpace: "nowrap" }}
                    >
                      {row.SLA}
                    </TableCell>
                    <TableCell align="left" sx={{ fontSize: "15px" }}>
                      {row.Description}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ fontSize: "15px" }}
                  >
                    No Data to Display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 25]}
            component="div"
            count={kpis.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Grid>
    </Grid>
  );
};

export default KPIs;
