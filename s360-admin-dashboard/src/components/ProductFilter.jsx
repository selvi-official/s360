import React, { useContext, useEffect, useState } from "react";
import { SelectedProductContext } from "../productcontext";
import { SelectedBUContext } from "../BUcontext";
import { fetchProducts } from "../util/HelperFunctions";
import {
  Autocomplete,
  FormControl,
  Grid,
  Paper,
  TextField,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme";
import { CustomFilter } from "./CustomFilter";

export const ProductFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct, updateProduct } = useContext(SelectedProductContext);
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const fetchProductList = async () => {
      let data = [];
      if (selectedBU) {
        data = await fetchProducts(selectedBU);
        if (!data?.includes(selectedProduct)) {
          updateProduct(data.sort()[1]);
        }
      }
      setProductList(data.sort());
    };
    fetchProductList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBU]);

  return (
    <CustomFilter
      label="Product"
      value={selectedProduct}
      options={productList}
      onChange={(value) => updateProduct(value)}
      isSearchable={true}
    />
    // <Grid minWidth={250}>
    //   <FormControl
    //     variant="outlined"
    //     sx={{
    //       minWidth: "80%",
    //       color: colors.grey[100],
    //       backgroundColor: colors.primary[400],
    //       borderRadius: 2,
    //       padding: 0.3,
    //     }}
    //   >
    //     <Autocomplete
    //       value={selectedProduct}
    //       onChange={(event, value) => updateProduct(value)}
    //       options={["All", ...productList]}
    //       blurOnSelect
    //       renderInput={(params) => (
    //         <TextField
    //           {...params}
    //           label="Product"
    //           InputLabelProps={{
    //             style: { fontSize: "20px" }, // Adjust font size as needed
    //           }}
    //         />
    //       )}
    //       PaperComponent={({ children }) => (
    //         <Paper
    //           style={{
    //             marginLeft: 0,
    //             // width: 250,
    //             backgroundColor: colors.blueAccent[600],
    //           }}
    //         >
    //           {children}
    //         </Paper>
    //       )}
    //     />
    //   </FormControl>
    // </Grid>
  );
};
