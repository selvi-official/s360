import React, { useState, forwardRef } from 'react';
import { Box, useTheme, Button } from '@mui/material';
import { tokens } from "../theme";

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ( {onSubmit}  ) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // const [fromDate, setFromDate] = useState(new Date());
    // const [toDate, setToDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [toDate, setToDate] = useState(new Date());

    const handleFromDateChange = (date) => {
        setFromDate(date);
        // Check if the difference between the dates is greater than 60 days
        if (toDate && Math.abs(date - toDate) > 60 * 24 * 60 * 60 * 1000) {
            setToDate(new Date(date.getTime() + 60 * 24 * 60 * 60 * 1000)); // Reset the "to" date if the range is too large
        }
    };

    const handleToDateChange = (date) => {
        setToDate(date);
        // Check if the difference between the dates is greater than 60 days
        if (fromDate && Math.abs(date - fromDate) > 60 * 24 * 60 * 60 * 1000) {
            setFromDate(new Date(date.getTime() - 60 * 24 * 60 * 60 * 1000)); // Reset the "from" date if the range is too large
        }
    };

    const handleSubmit = () => {
        onSubmit(fromDate, toDate);
      };

    const CustomCalendarButton = forwardRef(({ value, onClick }, ref) => (
        <Button  sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            justifyItems:"flex-end"
          }}
           onClick={onClick} ref={ref}>
          {value}
        </Button>
      ));

    return (
        <Box  display="flex" flexDirection="row" alignSelf='center'  >
            <Box paddingLeft='30px'>
                <label>From</label>
                <DatePicker
                    customInput={<CustomCalendarButton />}
                    color = {colors.blueAccent[800]}
                    selected={fromDate}
                    onChange={handleFromDateChange}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    maxDate={new Date()}
                    dateFormat="dd-MM-yyyy"

                />
            </Box>
            <Box>
                <label>To </label>
                <DatePicker
                    customInput={<CustomCalendarButton />}
                    selected={toDate}
                    onChange={handleToDateChange}
                    selectsEnd
                    startDate={fromDate}
                    maxDate={new Date()}
                    minDate={fromDate}
                    dateFormat="dd-MM-yyyy"

                />
            </Box>
            <Box display='flex' flexDirection="row" paddingTop='20px' paddingRight='60px'>
                <Button onClick={handleSubmit}
                    sx={{ 
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontSize: "10px",
                        fontWeight: "bold",
                    }}
                >
                    Go
                </Button>
            </Box>
        </Box>
    );
};

export default DateRangePicker;
