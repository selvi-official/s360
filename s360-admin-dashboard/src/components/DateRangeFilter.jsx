import React, { useContext, useState } from "react";
import { Grid, Button, useTheme } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateContext } from "../datecontext";
import { tokens } from "../theme";

const DateRangeFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {
    fromDate,
    toDate,
    updateDateRange,
    rangeSelection,
    handleRangeSelectionChange
  } = useContext(DateContext);

  const [tempDateRange, setTempDateRange] = useState([fromDate, toDate]);

  const handleCustomRangeChange = (dates) => {
    if (Array.isArray(dates) && dates.length === 2) {
      setTempDateRange(dates);
    } else if (Array.isArray(dates) && dates.length === 1) {
      setTempDateRange([dates[0], dates[0]]);
    }
  };

  const handleDatePickerClose = () => {
    if (tempDateRange && tempDateRange.length === 2) {
      const [start, end] = tempDateRange;
      const finalEnd = end || start;
      setTempDateRange([start, finalEnd]); // Ensure the input box reflects the final range
      updateDateRange(start, finalEnd);
    }
  };

  return (
    <Grid
      container
      display="flex"
      flexDirection="row"
      backgroundColor={colors.primary[400]}
      padding={0.5}
      // borderRadius={2}
      alignItems="center"
      className="date-range-filter-wrapper"
      minWidth={200}
    >
      <Grid item xs="auto">
        <Button
          sx={{
            color: rangeSelection === "7days" ? "#1E6DFF" : "#FFFFFF", // Change text color based on selection
            backgroundColor: rangeSelection === "7days" ? "#181E32" : "#1B1D2A",
            fontWeight: rangeSelection === "7days" ? "bold" : "normal"
          }}
          variant={rangeSelection === "7days" ? "outlined" : "text"}
          onClick={() => handleRangeSelectionChange("7days")}
        >
          7D
        </Button>
      </Grid>
      <Grid item xs="auto">
        <Button
          sx={{
            color: rangeSelection === "1month" ? "#1E6DFF" : "#FFFFFF",
            backgroundColor:
              rangeSelection === "1month" ? "#181E32" : "#1B1D2A",
            fontWeight: rangeSelection === "1month" ? "bold" : "normal"
          }}
          variant={rangeSelection === "1month" ? "outlined" : "text"}
          onClick={() => handleRangeSelectionChange("1month")}
        >
          1M
        </Button>
      </Grid>
      <Grid item xs="auto">
        <Button
          sx={{
            color: rangeSelection === "3months" ? "#1E6DFF" : "#FFFFFF",
            backgroundColor:
              rangeSelection === "3months" ? "#181E32" : "#1B1D2A",
            fontWeight: rangeSelection === "3months" ? "bold" : "normal"
          }}
          variant={rangeSelection === "3months" ? "outlined" : "text"}
          onClick={() => handleRangeSelectionChange("3months")}
        >
          3M
        </Button>
      </Grid>
      {/* <Grid item xs="auto" display="flex" flexDirection="column">
        <Button
          sx={{
            color: rangeSelection === "custom" ? '#1E6DFF' : '#FFFFFF',
            backgroundColor:
              rangeSelection === "custom"
              ? '#181E32'
              : '#1B1D2A',
          }}
          variant={rangeSelection === "custom" ? "outlined" : "text"}
          onClick={() => handleRangeSelectionChange("custom")}
        >
          Custom
        </Button>
        {rangeSelection === "custom" && (
          <DatePicker
            selected={tempDateRange[0]}
            onChange={handleCustomRangeChange}
            onCalendarClose={handleDatePickerClose}
            selectsRange
            startDate={tempDateRange[0]}
            endDate={tempDateRange[1]}
            maxDate={new Date()}
            dateFormat="dd/MM/yyyy"
            customInput={(
              <input
                style={{
                  backgroundColor: colors.primary[400],
                  color: colors.primary[100],
                  padding: "5px 10px",
                  borderRadius: "4px",
                  border: `1px solid ${colors.primary[300]}`,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              />
            )}
            calendarContainer={(props) => (
              <div
                {...props}
                style={{
                  backgroundColor: "#141617",
                  color: "white",
                  borderRadius: "8px",
                }}
              >
                {props.children}
              </div>
            )}
            renderDayContents={(day, date) => (
              <div
                style={{
                  color:
                    date >= tempDateRange[0] && date <= tempDateRange[1]
                      ? "white"
                      : date > new Date()
                      ? "#6b7280"
                      : "white",
                  backgroundColor:
                    date >= tempDateRange[0] && date <= tempDateRange[1]
                      ? "#3b82f6"
                      : "transparent",
                  padding: "5px",
                  borderRadius:
                    date.getTime() === tempDateRange[0]?.getTime() ||
                    date.getTime() === tempDateRange[1]?.getTime()
                      ? "50%"
                      : "0px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    date >= tempDateRange[0] && date <= tempDateRange[1]
                      ? "#3b82f6"
                      : "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    date >= tempDateRange[0] && date <= tempDateRange[1]
                      ? "#3b82f6"
                      : "transparent";
                }}
              >
                {day}
              </div>
            )}
            dayClassName={(date) =>
              date >= tempDateRange[0] && date <= tempDateRange[1]
                ? "react-datepicker-day--in-range"
                : undefined
            }
          />
        )}
      </Grid> */}
    </Grid>
  );
};

export default DateRangeFilter;
