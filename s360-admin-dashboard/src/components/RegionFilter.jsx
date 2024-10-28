import React, { useContext } from "react";
import { SelectedRegionContext } from "../RegionContext";
import { FormControl, Grid, InputLabel, MenuItem, Select, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { CustomFilter } from "./CustomFilter";

const RegionFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { selectedRegion, updateRegion } = useContext(SelectedRegionContext);
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        // maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        // width: 120,
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
      label="Region"
      value={selectedRegion}
      options={["All","us-east-1", "eu-central-1", "ap-south-1", "ap-southeast-2"]}
      onChange={(e) => updateRegion(e.target.value)}
      isSearchable={false}
      />
    // <Grid flexGrow={1}>
    //   <FormControl
    //     variant="outlined"
    //     sx={{
    //       minWidth: 120,
    //       backgroundColor: colors.primary[400],
    //       borderRadius: 2,
    //       padding: 0.3,
    //     }}
        
    //   >
    //     <InputLabel color="secondary" sx ={{fontSize:'20px'}}>Region</InputLabel>
    //     <Select
    //       value={selectedRegion}
    //       label="Region"
    //       onChange={(e) => updateRegion(e.target.value)}
    //       MenuProps={MenuProps}
    //       onClose={handleClose}
    //     >
    //       <MenuItem value="us-east-1">us-east-1</MenuItem>
    //       <MenuItem value="eu-central-1">eu-central-1</MenuItem>
    //       <MenuItem value="ap-south-1">ap-south-1</MenuItem>
    //       <MenuItem value="ap-southeast-2">ap-southeast-2</MenuItem>
    //     </Select>
    //   </FormControl>
    // </Grid>
  );
};

export default RegionFilter;
