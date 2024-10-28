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

const FilterBox = ({ showDateFilter }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dateFilter = showDateFilter === false ? false : true;

  const { selectedBU, updateBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);

  const [BUList, setBUList] = useState([]);

  const [products, setProducts] = useState([]);
  // console.log(userInfo)
  const BUs = useBUMenuOptions();
  // console.log(BUs)
  // console.log(BUList)

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
        if (!data[selectedBU]?.includes(selectedProduct)) {
          updateProduct("All");
        }
      } else {
        setProducts([]);
        updateProduct("");
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU]);

  const { fromDate, toDate, updateDateRange } = useContext(DateContext);

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

  const CustomCalendarButton = forwardRef(({ value, onClick }, ref) => (
    <Button
      sx={{
        backgroundColor: colors.blueAccent[700],
        color: colors.grey[100],
        fontSize: "15px",
        fontWeight: "bold"
        // justifyItems: "flex-end"
      }}
      onClick={onClick}
      ref={ref}
    >
      {value}
    </Button>
  ));

  const handleDateRange = (daterange) => {
    updateDateRange(daterange[0], daterange[1]);
  };

  const date_converion = (date) =>
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

  // const handleSubmit = (event) => {
  //     // console.log(date_converion(fromDate)+"   button  "+ date_converion(toDate))

  //     onSubmit();
  // }

  return (
    <Grid
      container
      spacing={2}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
    >
      <Grid container gap={2} xs="auto">
        <BUFilter />
<ProductFilter />
      </Grid>
      {dateFilter && (
        <Grid item paddingLeft={"0 !important"} paddingTop={"0 !important"}>
          <DateRangeFilter />
        </Grid>
      )}
    </Grid>
  );
};

export default FilterBox;
