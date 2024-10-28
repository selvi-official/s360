import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Autocomplete,
  TextField,
  Paper
} from "@mui/material";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import { scrollbarHiddenStyle } from "../util/customStyles";
import "../index.css";
import CustomTitle from "./CustomTItle";

export const CustomFilter = ({
  label,
  value,
  options,
  onChange,
  isSearchable,
  getOptionLabel,
  isOptionEqualToValue,
  renderOption,
  ...otherProps
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const textRef = useRef(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    if (textRef.current) {
      setWidth(textRef.current.offsetWidth + 80);
    }
  }, [value]);

  const MenuProps = {
    PaperProps: {
      style: {
        backgroundColor: colors.primary[500],
        maxHeight: 40 * 4.5 + 8,
        ...scrollbarHiddenStyle
      }
    }
  };

  const isOptionObject = options.length > 0 && typeof options[0] === "object";

  const defaultGetOptionLabel = (option) => {
    if (isOptionObject) {
      return option.label || option.name || JSON.stringify(option);
    }
    return String(option);
  };

  const defaultIsOptionEqualToValue = (option, value) => {
    if (isOptionObject) {
      return option.value || option.account === value.value || option.account;
    }
    return option === value;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: colors.primary[400],
        maxHeight: 40,
        borderRadius: 0,
        padding: 0
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          background: "rgba(39,60,162,0.2)",
          color: "#2f80eb !important",
          borderRadius: "4px 0 0 4px", // Rounded corners on the left side
          height: "100%"
        }}
      >
        <Typography
          sx={{
            marginRight: 1,
            fontWeight: "bold",
            whiteSpace: "nowrap"
          }}
        >
          {label}
        </Typography>
      </Box>
      <FormControl
        variant="outlined"
        sx={{
          display: "flex",
          flexGrow: 1,
          backgroundColor: colors.primary[400],
          borderRadius: 0,
         
          maxHeight: 40,
          padding: 0,
          marginLeft: "4px",
          justifyContent: "center"
        }}
      >
        {isSearchable ? (
          <Autocomplete
            sx={{
              flexGrow: 1,
              minWidth: "150px",
              maxWidth: "400px",
              "& input": {
                minWidth: "auto",
                paddingTop: 0,
                paddingBottom: 0,
                textAlign: "left"
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none"
              }
            }}
            value={value}
            options={options}
            isOptionEqualToValue={
              isOptionEqualToValue || defaultIsOptionEqualToValue
            }
            getOptionLabel={getOptionLabel || defaultGetOptionLabel}
            blurOnSelect
            disableClearable
            renderOption={(props, option, { selected }) => (
              <li
                {...props}
                style={{
                  backgroundColor: selected ? "#1E6DFF": "inherit",
                  color: selected ? colors.grey[100] : "inherit",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E6DFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selected ? "#1E6DFF" : "inherit";
                }}
              >
                {getOptionLabel ? getOptionLabel(option) : option}
              </li>
            )}
            onChange={(event, newValue) => {
              if (onChange) {
                onChange(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ width: "100%" }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <span
                        ref={textRef}
                        style={{
                          position: "absolute",
                          visibility: "hidden",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {typeof value === "object"
                          ? value?.account || value?.value
                          : value}
                      </span>
                    </>
                  )
                }}
              />
            )}
            PaperComponent={({ children }) => (
              <Paper
                style={{
                  marginLeft: 0,
                  minWidth: "auto",
                  width:'100%',
                  backgroundColor: colors.primary[800]
                }}
              >
                {children}
              </Paper>
            )}
          />
        ) : (
          <Select
            value={value}
            onChange={onChange}
            MenuProps={MenuProps}
            sx={{
              flexGrow: 1,
              color: colors.grey[100],
              "& .MuiOutlinedInput-root": {
                paddingRight: "32px",
                borderRadius: 0,
                height: "100%",
                display: "flex",
                alignItems: "left",
                justifyContent: "left",
                padding: 0
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none"
              }
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "#1E6DFF",
                    "&:hover": {
                      backgroundColor: "#1E6DFF",
                    },
                  },
                  "&:hover": {
                    backgroundColor:"#1E6DFF",
                  },
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }}
              >
                {option}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </Box>
  );
};
