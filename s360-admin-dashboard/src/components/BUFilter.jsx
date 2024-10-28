import React, { useContext, useEffect, useState } from "react";
import { SelectedBUContext } from "../BUcontext";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme";
import { fetchBUs } from "../util/HelperFunctions";
import { CustomFilter } from "./CustomFilter";

export const BUFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { selectedBU, updateBU } = useContext(SelectedBUContext);
  const [BUList, setBUList] = useState([]);

  useEffect(() => {
    const fetchBUList = async () => {
      const data = await fetchBUs();
      setBUList(data.sort());
    };

    fetchBUList();
  }, []);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        // width: 200,
        backgroundColor: colors.blueAccent[800],
      },
    },
  };

  const handleClose = () => {
    // Use setTimeout to delay the blur action
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  };

  return (
    <CustomFilter
      label="BU"
      value={selectedBU}
      options={["All", ...BUList]}
      onChange={(e) => updateBU(e.target.value)}
      isSearchable={false}
    />

    // <CustomFilter2
    //   label="BU"
    //   value={selectedBU}
    //   options={["All",  ...BUList].map((bu) => ({ value: bu, label: bu }))}
    //   onChange={(e) => updateBU(e.value)}
    //   isSearchable={false}
    //   // getOptionLabel={(option) => option}
    // />
    // <Grid  minWidth={200}>
    //   <FormControl
    //     variant="outlined"
    //     sx={{
    //       minWidth: "70%",
    //       color: colors.grey[100],
    //       backgroundColor: colors.primary[400],
    //       padding: "2px",
    //       borderRadius: 2,
    //     }}
    //   >
    //     <InputLabel color="secondary" sx ={{fontSize:'20px'}}>BU</InputLabel>
    //     <Select
    //       value={selectedBU}
    //       label="BU"
    //       onChange={(e) => updateBU(e.target.value)}
    //       MenuProps={MenuProps}
    //       onClose={handleClose}
    //     >
    //       <MenuItem value='All'>All</MenuItem>
    //       {BUList.map((bu) => (
    //         <MenuItem key={bu} value={bu}>
    //           {bu}
    //         </MenuItem>
    //       ))}
    //     </Select>
    //   </FormControl>
    // </Grid>
  );
};
