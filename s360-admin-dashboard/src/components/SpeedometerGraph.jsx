import { useTheme } from "@mui/material";
import React, { useState } from "react";
import ReactSpeedometer from "react-d3-speedometer";
import Speedometer from "react-d3-speedometer";
import { tokens } from "../theme";

const SpeedometerGraph = ({ currentValue, minValue, maxValue }) => {
  // const [max, setMax] = useState(100)
  // const [min, setMin] = useState(0)
  // const [current, setCurrent] = useState(34)

  // setMin(minValue)
  // setMax(maxValue * 1.5)
  // setCurrent(currentValue)

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const maxValue_buffered = Math.max(maxValue * 2, currentValue + 1);

  return (
    <div
      style={{
        paddingTop: "50px",
        width: "400px",
        height: "300px",
      }}
    >
      <ReactSpeedometer
        fluidWidth={true}
        forceRender={true}
        valueFormat='d'
        minValue={minValue}
        maxValue={maxValue_buffered}
        value={currentValue}
        valueTextFontSize="40px"
        // height='300'
        // paddingVertical={10}
        // fluidWidth={true}
        valueTextFontWeight="100"
        textColor={colors.grey[300]}
        startColor="limegreen"
        endColor="crimson"
        maxSegmentLabels={3}
        segments={333}
        needleColor={colors.grey[100]}
        needleTransitionDuration={1000}
        needleTransition="easeElasticOut"
        // fluidWidth={true}
      />
    </div>
  );
};

export default SpeedometerGraph;
