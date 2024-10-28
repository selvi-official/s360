import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  Box,
} from "@mui/material";
import { tokens } from "../../theme";
import { fetchWAControlsList } from "../../util/HelperFunctions";

export const WAControls = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [pillar, setPillar] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [service, setService] = useState("All");

  const [controlsList, setControlsList] = useState([])


  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        borderRadius: 5,
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 100,
        backgroundColor: colors.blueAccent[800],
      },
    },
  };

  // const testdata = controlList;
  const [filteredControls, setFilteredControls] = useState([]);

  const servicesList = [...new Set(controlsList.map(item => item?.tags?.service))];

  useEffect(() => {
    const fetchControlList = async () => {
      // const data = await getControlsList()
      const data = await fetchWAControlsList()
      setControlsList(data)

    }
  
    fetchControlList()
  }, [])

  // console.log(controlsList)
  

  useEffect(() => {
    // let filteredData = [];

    let filteredData = controlsList.filter((item) => {
      const pillarMatch =
        pillar === "All" ? true : pillar.toUpperCase() === item.tags.pillar;
      const severityMatch =
        severity === "All" ? true : severity.toLowerCase() === item.severity;
      const serviceMatch =
        service === "All" ? true : service === item.tags.service;
      return pillarMatch && severityMatch && serviceMatch;
    });

    setFilteredControls(filteredData);
  }, [controlsList,pillar, severity,service]);

  return (
    <Grid
      container
      display="flex"
      flexDirection="column"
      gap={1}
      paddingTop="40px"
    >
<Grid container alignItems="center" justifyContent="space-between" padding={2}>
  <Grid item xs={6}>
    <Typography variant="h1" fontWeight="600">
      Well Architected Controls
    </Typography>
  </Grid>

  <Grid item xs="auto" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
    {/* Pillars Filter Box */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
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
        Pillars
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
          value={pillar}
          label="Pillar"
          onChange={(e) => setPillar(e.target.value)}
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
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Reliability">Reliability</MenuItem>
          <MenuItem value="Security">Security</MenuItem>
          <MenuItem value="Cost">Cost</MenuItem>
          <MenuItem value="Performance Efficiency">Performance Efficiency</MenuItem>
          <MenuItem value="Operational Excellence">Operational Excellence</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* Severity Filter Box */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
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
        Severity
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
          value={severity}
          label="Severity"
          onChange={(e) => setSeverity(e.target.value)}
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
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* Service Filter Box */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
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
        Service
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
          value={service}
          label="Service"
          onChange={(e) => setService(e.target.value)}
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
          {servicesList.map((item, index) => (
            <MenuItem key={index} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  </Grid>
</Grid>
<Grid container justifyContent="space-around" padding={2} alignItems="center">
  <TableContainer sx={{ maxHeight: "700px" }}>
    <Table sx={{ minWidth: 650 }} stickyHeader>
      <TableHead>
        <TableRow height={50}> {/* Reduced the height from 70px to 50px */}
          <TableCell
            sx={{
              fontWeight: "bold",
              fontSize: "16px",  // Reduced the font size from 20px to 16px
              backgroundColor: colors.blueAccent[800],
              paddingLeft: "30px",
              paddingTop: "10px",  // Added padding for spacing
              paddingBottom: "10px",  // Added padding for spacing
            }}
          >
            S No.
          </TableCell>
          <TableCell
            sx={{
              fontWeight: "bold",
              fontSize: "16px",  // Reduced the font size from 20px to 16px
              backgroundColor: colors.blueAccent[800],
              paddingTop: "10px",  // Added padding for spacing
              paddingBottom: "10px",  // Added padding for spacing
            }}
          >
            Control Title
          </TableCell>
          <TableCell
            sx={{
              fontWeight: "bold",
              fontSize: "16px",  // Reduced the font size from 20px to 16px
              backgroundColor: colors.blueAccent[800],
              paddingTop: "10px",  // Added padding for spacing
              paddingBottom: "10px",  // Added padding for spacing
            }}
          >
            Pillar
          </TableCell>
          <TableCell
            sx={{
              fontWeight: "bold",
              fontSize: "16px",  // Reduced the font size from 20px to 16px
              backgroundColor: colors.blueAccent[800],
              paddingTop: "10px",  // Added padding for spacing
              paddingBottom: "10px",  // Added padding for spacing
            }}
          >
            Severity
          </TableCell>
          <TableCell
            sx={{
              fontWeight: "bold",
              fontSize: "16px",  // Reduced the font size from 20px to 16px
              backgroundColor: colors.blueAccent[800],
              paddingTop: "10px",  // Added padding for spacing
              paddingBottom: "10px",  // Added padding for spacing
            }}
          >
            Service
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody sx={{ backgroundColor: colors.primary[400] }}>
        {filteredControls.map((row, index) => (
          <TableRow key={index} hover>
            <TableCell sx={{ fontSize: "14px", paddingLeft: "40px", width: "100px" }}>
              {index + 1}
            </TableCell>
            <TableCell sx={{ fontSize: "14px", maxWidth:"600px" }}>
              {row.title}
            </TableCell>
            <TableCell sx={{ fontSize: "14px" }}>{row.tags.pillar}</TableCell>
            <TableCell sx={{ fontSize: "14px" }}>
              {row.severity}
            </TableCell>
            <TableCell sx={{ fontSize: "14px" }}>
              {row.tags.service}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Grid>

    </Grid>
  );
};
