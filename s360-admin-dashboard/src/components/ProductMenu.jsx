import * as React from 'react';
import { Box, Select, InputLabel, MenuItem, FormControl, useTheme } from '@mui/material';

import { tokens } from "../theme";


const ProductMenu = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [product, setProduct] = React.useState('All');
    const [productList, setProductList] = React.useState([]);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
             maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
             width: 250,
             backgroundColor: colors.blueAccent[800]
            },
        },
    };


    const handleChange = (event) => {
        setProduct(event.target.value);
    };


    React.useEffect(() => {
        fetch('http://127.0.0.1:5006/products')
          .then((response) => response.text())
          .then((resp) =>{
            // console.log(resp)
            setProductList(resp.split('\n'))
          })
          .catch(error => {
            console.error(error);
          });
      }, []);

   

    // const productlist = ['FreshDesk', 'FreshChat', 'FreshBots', 'FreshChannel','Galaxy'];

    return (
        <Box display="flex" flexDirection="row" alignSelf='end' >
            <FormControl variant="outlined"  sx={{ m:'1', minWidth: 250, color:colors.grey[100], backgroundColor: colors.blueAccent[700] }}>
                <InputLabel id="productmenu-label">Product</InputLabel>
                <Select
                    labelId="productmenu-label"
                    id="productmenu"
                    value={product}
                    label="Product"
                    onChange={handleChange}
                    MenuProps={MenuProps}
                >
                    <MenuItem value='All'>All</MenuItem>
                    {productList.map(prd => (
                        <MenuItem key={prd} value={prd}>{prd}</MenuItem>

                    ))}
                </Select>
            </FormControl>

        </Box>
    );
}

export default ProductMenu