import {
    Select,
    InputLabel,
    MenuItem,
    FormControl,
    useTheme,
    Grid,
    Button,
    Autocomplete,
    TextField,
    Paper,
    Typography,
    Box
  } from "@mui/material";
  import React, { useState, forwardRef, useEffect, useContext } from "react";
  import { ProductFilter } from "../components/ProductFilter";
  import { tokens } from "../theme";
  
  import DatePicker from "react-datepicker";
  import "react-datepicker/dist/react-datepicker.css";
  import { SelectedProductContext } from "../productcontext";
  import { DateContext } from "../datecontext";
  import { useBUMenuOptions } from "../customMenuOptions";
  import { SelectedBUContext } from "../BUcontext";
  import { appConfig } from "../appConfig";
  import DateRangeFilter from "./DateRangeFilter";
  import { BUFilter } from "./BUFilter";
  
  const CostFilterBox = ({ }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  

    return (
      <Grid
        container
        spacing={2}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Grid container gap={2} xs="auto">
        
        </Grid>
          <Grid item paddingLeft={"0 !important"} paddingTop={"0 !important"}>
                    <span>
                    <select value={selectedDashboard} onChange={handleDashboardChange}>
                        <option value="Dashboard1">AWS Potential Savings</option>
                        <option value="Dashboard2">AWS Cost - Budget & Forecast</option>
                        <option value="Dashboard3">BU - Usage Report</option>
                    </select>
                    </span>
          </Grid>
      </Grid>
    );
  };
  
  export default FilterBox;
  