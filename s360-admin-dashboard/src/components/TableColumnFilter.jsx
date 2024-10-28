import { MenuItem, Select, useTheme } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { tokens } from "../theme";

const TableColumnFilter = ({ onClick, isFilterOpen, value, categories, onChange, onClose }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const ITEM_HEIGHT = 45;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 200,
                backgroundColor: colors.blueAccent[800]
            },
        },
    };

    return (
        <>
        <FilterAltIcon
            onClick={onClick}
            sx={{ cursor: 'pointer' }}
        />
            {isFilterOpen && (
                <Select
                    variant="outlined"
                    value={value}
                    MenuProps={MenuProps}
                    open={isFilterOpen}
                    onChange={onChange}
                    onClose={onClose}
                    sx={{ height: '30px' }}
                >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </Select>
            )}
        </>
    )
};

export default TableColumnFilter
