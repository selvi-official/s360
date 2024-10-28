import React from "react";
import { Grid, Typography, colors, useTheme } from "@mui/material";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  defs,
  linearGradient,
  stop,
  LabelList,
} from "recharts";
import { tokens } from "../theme";

export const HorizontalBarChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width}
        y={y}
        dx={25}
        dy={10}
        fill={colors.blueAccent[200]}
        textAnchor="middle"
      >
        {parseFloat(value).toFixed(2)}
      </text>
    );
  };

  data.forEach(element => {
    element.pillar = element?.pillar?.toLowerCase();
  })
  

  return (
    <ResponsiveContainer width="100%" height="90%">
      {data && data.length == 5 ? (
        <BarChart
          data={data.sort((a, b) => a.pillar.localeCompare(b.pillar))}
          layout="vertical"
          margin={{ left: 50, right: 50 }}
        >
          <XAxis type="number" domain={[0,100]} stroke={colors.primary[100]} />
          <YAxis
            type="category"
            dataKey="pillar"
            stroke={colors.primary[100]}
          />
          {/* <Tooltip /> */}

          <Bar dataKey="score" barSize={15} label={CustomBarLabel}>
            {data.map((entry, index) => {
              const value = entry.score;
              let fill;
              if (value >= 75) {
                fill = colors.greenAccent[500];
              } else if (value < 75 && value >= 40) {
                fill = colors.orangeAccent[500];
              } else {
                fill = colors.redAccent[500];
              }

              return <Cell key={index} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      ) : (
        <div>
          {/* <Typography variant='h3' padding={0} >no data</Typography>  */}
          <img
            src="/assets/nodata.png"
            alt="No Data Image"
            style={{ width: "250px", height: "auto" }}
            className="no-data-image"
          />
        </div>
      )}
    </ResponsiveContainer>
  );
};
