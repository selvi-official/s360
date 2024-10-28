import {
  Grid,
  Typography,
  TextField,
  IconButton,
  Popover,
  Chip,
  Box,
  Button
} from "@mui/material";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../theme';
import { appConfig } from '../appConfig';
import '../index.css';
import {
  GridToolbar,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";

const DetailsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { bu, firstIndexValue } = useParams();  // Retrieve both BU and Quarter from the URL

  const [page, setPage] = useState(0); // For pagination
  const [rowsPerPage, setRowsPerPage] = useState(20); // For pagination
  const [outages, setOutages] = useState({});
  const [filters, setFilters] = useState({
    id: '',
    subject: '',
    major_incident_type: '',
    caused_by_product: '',
    caused_by_bu: '',
    region: '',
    month: '',
    issue_category: '' // Added issue_category
  }); // For filtering
  const [anchorEl, setAnchorEl] = useState(null); // For popover
  const [currentFilter, setCurrentFilter] = useState(''); // To track the current filter column
  const [pinnedColumns, setPinnedColumns] = useState({ left: [], right: [] });

  const getOutages = async () => {
    try {
      const outages_response = await fetch(
        `${appConfig.backend_Api_Url}/v2/getincidentdetails?bu=${bu}&quarter=${firstIndexValue}`
      );
      const outages_data = await outages_response.json();
      console.log('API Response:', outages_data); // Log the API response here
      setOutages(outages_data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDashboardFilter = async () => {
    await getOutages();
  };

  const handleChangePage = (params) => {
    setPage(params.page);
  };

  const handleChangeRowsPerPage = (params) => {
    setRowsPerPage(params.pageSize);
    setPage(0); // Reset page to first page whenever rows per page changes
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset page to first page whenever filter changes
  };

  const handleFilterIconClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentFilter(column);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setCurrentFilter('');
  };

  const handleClearFilter = (filterKey) => {
    setFilters({
      ...filters,
      [filterKey]: ''
    });
  };

  const handleClearAllFilters = () => {
    setFilters({
      id: '',
      subject: '',
      major_incident_type: '',
      caused_by_product: '',
      caused_by_bu: '',
      region: '',
      month: '',
      issue_category: '' // Added issue_category
    });
  };

  useEffect(() => {
    handleDashboardFilter();
  }, [bu, firstIndexValue]);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Filter and paginate the outages array for the specific quarter
  const outagesForQuarter = outages[firstIndexValue] || [];
  const filteredOutages = outagesForQuarter.filter(incident =>
    Object.keys(filters).every(key =>
      incident[key] ? incident[key].toLowerCase().includes(filters[key].toLowerCase()) : true
    )
  );
  const paginatedOutages = filteredOutages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1,
      renderCell: (params) => (
        <a href={`https://lighthouse.freshservice.com/a/tickets/${params.value}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
          {params.value}
        </a>
      )
    },
    { field: 'subject', headerName: 'Subject', flex: 1 },
    { field: 'major_incident_type', headerName: 'Major Incident Type', flex: 1 },
    { field: 'caused_by_product', headerName: 'Caused by Product', flex: 1 },
    { field: 'caused_by_bu', headerName: 'Caused by BU', flex: 1 },
    { field: 'issue_category', headerName: 'Issue Category', flex: 1 },
    { field: 'region', headerName: 'Region', flex: 1 },
    { field: 'month', headerName: 'Month', flex: 1 }
  ];

  const rows = paginatedOutages.map((incident, index) => ({
    id: incident.id.match(/>([^<]*)</)[1],
    subject: incident.subject,
    major_incident_type: incident.major_incident_type,
    caused_by_product: incident.caused_by_product,
    caused_by_bu: incident.caused_by_bu,
    issue_category: incident.issue_category,
    region: incident.region,
    month: incident.month
  }));

  return (
        <Grid container direction="column" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>

        <Typography variant="h2" component="h4" sx={{ mt: 2, mb: 2, textAlign: 'center'}}>
        Incident Details for {bu} - {firstIndexValue}
        </Typography>

        <Grid item xs style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        <Box sx={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pinnedColumns={pinnedColumns}

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
        </Box>
      </Grid>
    </Grid>
  );
};

export default DetailsPage;