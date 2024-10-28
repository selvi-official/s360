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
  CircularProgress,
  Box,
} from "@mui/material";
import { tokens } from "../../theme";
import { fetchTechStackDetails } from "../../util/HelperFunctions";
import { DataGrid, getGridStringOperators, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { v4 as uuidv4 } from "uuid";

export const TechStack = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(false);

  const [awsAccount, setAWSAccount] = useState("All");
  const [region, setRegion] = useState("All");
  const [technology, setTechnology] = useState("All");
  const [isEOL, setIsEOL] = useState('All')

  const [techStack, setTechStack] = useState([]);
  const [filteredTechStack, setFilteredTechStack] = useState([]);

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

  const techStackHeaders = [
    // {field: 'id', headerName: 'ID'},
    { field: "aws_account_name", headerName: "AWS Account", flex: 1, filterable: false },
    {
      field: "container_image",
      headerName: "Container Name",
      flex: 2,
      valueFormatter: (value) => {
        const regex = /\/([^@]+)@/;
        const match = value?.match(regex);
        return match ? match[1] : value;
      }
    },
    { field: "technology_name", headerName: "Technology", flex: 1 },
    { field: "current_version", headerName: "Version", flex: 1, filterable: false },
    { field: "is_cur_version_eol", headerName: "End of Life", flex: 1,
        valueFormatter: (value) => {
            const val = value == "" ? "NA": value
            return val
        }, 
        filterable: false
     },
    // { field: "region", headerName: "Region", flex: 1 },
  ];

  // const getRowId = (row,index) => uuidv4();

  // console.log(techstackList);
  const accountList = [
    ...new Set(techStack.map((item) => item?.aws_account_name)),
  ];
  // console.log(accountList);
  const technologyList = [
    ...new Set(techStack.map((item) => item?.technology_name)),
  ];

  useEffect(() => {
    const fetchTechStack = async () => {
      // const data = await getControlsList()
      setLoading(true);

      const data = await fetchTechStackDetails();
      // const eol_true_data = data.filter(
      //   (item) => item.is_cur_version_eol == "True"
      // );

      const data_with_id = data.map((item,index) =>  { return {...item, id:index}})
      setTechStack(data_with_id);

      setLoading(false);
    };

    fetchTechStack();
  }, []);

  useEffect(() => {
    let filteredData = [];

    filteredData = techStack.filter((item) => {
      const accountMatch =
        awsAccount === "All" ? true : awsAccount === item.aws_account_name;
      const regionMatch = region === "All" ? true : region === item.region;
      const technologyMatch =
        technology === "All" ? true : technology === item.technology_name;
      const isEOLMatch = isEOL === "All" ? true : isEOL === item.is_cur_version_eol;
      return accountMatch && regionMatch && technologyMatch && isEOLMatch;
    });

    setFilteredTechStack(filteredData);
  }, [techStack, awsAccount, region, technology, isEOL]);

  return (
    <Grid
      container
      display="flex"
      flexDirection="column"
      gap={1}
      paddingTop="40px"
    >
      <Grid
        container
        justifyContent="space-between"
        padding={2}
        alignItems="center"
      >
        <Grid item xs='auto'>
          <Typography variant="h1" fontWeight="600">
            TechStack End Of Life
          </Typography>
        </Grid>
        <Grid item xs="auto" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>

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
        Account
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
          value={awsAccount}
          label="Account"
          onChange={(e) => setAWSAccount(e.target.value)}
          variant="outlined"
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#1B1D2A',
                color: '#fff',
                maxHeight:'50rem',
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
              {accountList.map((account) => (
                <MenuItem value={account}>{account}</MenuItem>
              ))}
        </Select>
      </FormControl>
    </Box>
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
        Region
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
                        value={region}
                        label="Region"
                        onChange={(e) => setRegion(e.target.value)}
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
              <MenuItem value="us-east-1">us-east-1</MenuItem>
              <MenuItem value="eu-central-1">eu-central-1</MenuItem>
              <MenuItem value="ap-south-1">ap-south-1</MenuItem>
              <MenuItem value="ap-southeast-2">ap-southeast-2</MenuItem>
        </Select>
      </FormControl>
    </Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
        maxWidth: '450px',
        minWidth: '250px',
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
        Technology
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
          value={technology}
          label="Technology"
          onChange={(e) => setTechnology(e.target.value)}
          variant="outlined"
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#1B1D2A',
                maxHeight:'50rem',
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
       {technologyList.map((tech) => (
                <MenuItem value={tech}>{tech}</MenuItem>
              ))}
        </Select>
      </FormControl>
    </Box>
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
        EndOfLife
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
           value={isEOL}
           label="EndOfLife"
           onChange={(e) => setIsEOL(e.target.value)}
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
             
             <MenuItem  value="True">True</MenuItem>
             <MenuItem  value="False">False</MenuItem>
             <MenuItem  value="">NA</MenuItem>
        </Select>
      </FormControl>
    </Box>
        </Grid>
      </Grid>
      <Grid
  container
  justifyContent="space-around"
  padding={2}
  alignItems="center"
  height={800}
  sx={{
    border: "none", // Removes the border for the container
  }}
>
  <DataGrid
    rows={filteredTechStack}
    columns={techStackHeaders}
    getRowHeight={() => "auto"}
    loading={loading}
    sx={{
      border: "auto", // Removes the border for the grid
      // Remove outer border
      "& .MuiDataGrid-root": {
        border: "none !important", // Removes the outer border
      },
      // Customize header styles
      "& .MuiDataGrid-columnHeader": {
        fontSize: "14px", // Set font size to 14px
        height: "40px", // Adjust height of header row
        padding: "0 10px", // Add padding inside the header cells
        lineHeight: "40px", // Vertically center text
        backgroundColor: '#1b1d2a !important',
        color: '#1e6dff !important',
        fontWeight: '500 !important'
      },
      // Customize header separators
      "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus": {
        outline: "none",
      },
      // Customize body styles (cells)
      "& .MuiDataGrid-cell": {
        color: colors.grey[100],
        backgroundColor: colors.primary[400],
        fontSize: "14px", // Set font size to 14px for the body as well
        wordWrap: "break-word",
        padding: "10px", // Add padding inside the cells
      },
      // Customize toolbar container
      "& .MuiDataGrid-toolbarContainer": {
        backgroundColor: colors.blueAccent[400],
        fontSize: "40px",
      },
    }}
  />
</Grid>


    </Grid>
  );
};
