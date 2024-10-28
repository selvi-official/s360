import { Grid, Typography, colors, useTheme } from "@mui/material";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Line,
  ComposedChart,
  Area,
  Dot,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { tokens } from "../theme";

const vulnerability_colors = [
  "#FF0000",
  "#8B0000",
  "#A52A2A",
  "#FF8C00",
  "#FFD700",
  "#FFFF00",
  "#808000",
  "#228B22",
  "#00FF00",
  "#006400",
  "#008000",
  "#008080",
  "#0000FF",
  "#00008B",
  "#4B0082",
  "#800080",
];
const priority_colors = ["#FF0000", "#FF8C00", "#FFFF00", "#006600"];
const formatMonthName = (monthName) => {
  return monthName.slice(0, 3); // get the first three characters of the month name
};
const monthDomain = ["Jan", "Feb", "Mar"];

export const VerticalCompositeChartWithThreshold = ({ data, threshold }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const CustomizedLabel = ({ x, y, stroke, value }) => (
    <text x={x} y={y} dx={5} dy={-10} textAnchor="middle" fill={stroke}>
      {value}
    </text>
  );
  const dataMax = Math.max(
    ...data.map((entry) => Math.max(entry.P1MTTR, entry.P0MTTR, entry.MTTD))
  );
  const domain = [0, Math.max(dataMax, 1)];

  const P0dataMax = Math.max(...data.map((entry) => entry.P0Count));
  const P0domain = [0, Math.max(P0dataMax, 1)];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        {/* <BarChart width={550} height={250} data={data} margin={{ right: 10 }}> */}
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis
          dataKey="month"
          textAnchor="middle"
          padding={{ right: 30 }}
          domain={monthDomain}
          tickFormatter={formatMonthName}
        />
        <YAxis
          padding={{ top: 30 }}
          type="number"
          domain={domain}
          label={{ value: " Minutes", angle: "-90", dx: -20, fill: "white" }}
        />
        <Tooltip contentStyle={{ backgroundColor: colors.primary[600] }} />
        <Legend />
        <Bar
          dataKey="P0Count"
          fill="red"
          barSize={12}
          label={<CustomizedLabel stroke="red" />}
          yAxisId="bar"
        />
        <Bar
          dataKey="P1Count"
          fill="burlywood"
          barSize={10}
          label={<CustomizedLabel stroke="burlywood" />}
          yAxisId="bar"
        />
        <YAxis
          yAxisId="bar"
          orientation="right"
          domain={P0domain}
          padding={{ top: 30 }}
          label={{ value: "# Outages", angle: "90", fill: "white" }}
        />
        {/* <ReferenceLine y={threshold} stroke="red" /> */}
        {/* </BarChart> */}

        {/* <LineChart width={550} height={250} data={data} > */}
        {/* <XAxis dataKey="month" />
        <YAxis type='number' domain={domain}/> */}
        <Line
          type="monotone"
          dataKey="P0MTTR"
          stroke={colors.blueAccent[500]}
          animationEasing="ease"
        />
        <Line
          type="monotone"
          dataKey="P1MTTR"
          stroke="green"
          animationEasing="ease"
        />
        <Area
          type="monotone"
          dataKey="MTTD"
          stroke="orange"
          fillOpacity={0.2}
          fill="orange"
        />
        {/* </LineChart> */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const CustomerOutagesBarChart = ({ data, isYTD = true }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const CustomizedBarLabel = ({ x, y, value, width, height, fill }) => (
    <text
      x={x + width / 2}
      y={y + height / 2}
      dy={5}
      textAnchor="middle"
      fill={fill}
    >
      {value}
    </text>
  );

  // const ToolTipFormatter = (value, name, props) => {
  //   const { payload } = props;
  //   const actual_value = payload.actual_value;
  //   return (
  //     <div>
  //       <span>Percentage: {value}%</span>
  //       <br />
  //       <span>Actual Count: {actual_value}</span>
  //     </div>
  //   );
  //   // return [`${name}: ${value}%` `Actual Count: ${actual_value}`];
  // }

  // const dataMax = Math.max(...data.map((entry) => Math.max(entry.customer_reported, entry.others)));
  // const domain = [0, Math.max(dataMax, 1)];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="horizontal"
        margin={{ left: 0, bottom: 10 }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis
          dataKey={isYTD ? "quarter" : "month"}
          textAnchor="middle"
          type="category"
          padding={{ right: 30 }}
        />
        <YAxis
          type="number"
          padding={{ top: 30 }}
          domain={["auto", "auto"]}
          label={{
            value: "Customer VS Internally Detected",
            position: "middle",
            angle: -90,
            dy: 10,
            fill: "white",
          }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: colors.primary[600] }}
          // formatter={ToolTipFormatter}
        />
        <Legend />
        <Bar
          dataKey="P0 Customer Reported"
          fill={colors.redAccent[500]}
          stackId="a"
          barSize={15}
        >
          <LabelList
            dataKey="P0 Customer Reported"
            content={<CustomizedBarLabel fill={colors.redAccent[900]} />}
          />
        </Bar>
        <Bar
          dataKey="P0 Internally Detected"
          fill={colors.blueAccent[500]}
          stackId="a"
          barSize={15}
        >
          <LabelList
            dataKey="P0 Internally Detected"
            content={<CustomizedBarLabel fill={colors.blueAccent[900]} />}
          />
        </Bar>

        <Bar
          dataKey="P1 Customer Reported"
          fill={colors.redAccent[300]}
          stackId="b"
          barSize={15}
        >
          <LabelList
            dataKey="P1 Customer Reported"
            content={<CustomizedBarLabel fill={colors.redAccent[900]} />}
          />
        </Bar>
        <Bar
          dataKey="P1 Internally Detected"
          fill={colors.blueAccent[300]}
          stackId="b"
          barSize={15}
        >
          <LabelList
            dataKey="P1 Internally Detected"
            content={<CustomizedBarLabel fill={colors.blueAccent[900]} />}
          />
        </Bar>
        {/* <ReferenceLine x={threshold} stroke="red" label="Threshold" strokeDasharray="5 5" /> */}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const TopVulnerabilitiesStackedHorizontalBarChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const priorityKeys = Object.keys(data);

  const vulnerabilityNames = Array.from(
    new Set(
      [].concat(
        ...Object.values(data).map((vulnerabilities) =>
          vulnerabilities.map((v) => Object.keys(v)[0])
        )
      )
    )
  );

  // Generate the data for each priority level
  const priorityData = priorityKeys.map((priorityKey) => {
    const priorityVulnerabilities = data[priorityKey];
    const priorityVulnerabilityCounts = vulnerabilityNames.map(
      (vulnerabilityName) =>
        priorityVulnerabilities.reduce((acc, cur) => {
          const vulnerabilityCount = cur[vulnerabilityName] || 0;
          return acc + vulnerabilityCount;
        }, 0)
    );

    return {
      name: priorityKey,
      ...priorityVulnerabilityCounts.reduce(
        (acc, cur, i) => ({ ...acc, [vulnerabilityNames[i]]: cur }),
        {}
      ),
    };
  });

  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y} dy={25} fill="#000" textAnchor="middle">
        {value !== 0 ? value : ""}
      </text>
    );
  };

  // Generate the Bar components with the dynamically generated dataKey props
  const bars = vulnerabilityNames.map((vulnerabilityName, i) => (
    <Bar
      key={i}
      dataKey={vulnerabilityName}
      stackId="a"
      fill={vulnerability_colors[i]}
    >
      <LabelList dataKey={vulnerabilityName} content={<CustomBarLabel />} />
    </Bar>
  ));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Grid padding={2} backgroundColor={colors.blueAccent[300]}>
          <Typography variant="subtitle2" component="p">
            {label}
          </Typography>
          {payload.map((p, i) => {
            if (p.value > 0) {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "5px 0",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: p.color,
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      marginRight: "5px",
                    }}
                  ></span>
                  <Typography variant="body2" component="span">
                    {p.name}: {p.value}
                  </Typography>
                </div>
              );
            }
            return null;
          })}
        </Grid>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={priorityData} layout="vertical">
        <YAxis type="category" dataKey="name" padding={{ top: 30 }} />
        <XAxis type="number" padding={{ right: 30 }} />
        <Tooltip content={<CustomTooltip />} />
        {bars}
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SlaAgeingStackedHorizontalBarChart = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (Object.keys(data).length === 0) {
    return <div>Loading...</div>;
  }

  const chartData = Object.keys(data[Object.keys(data)[0]]).map((key) => ({
    name: key,
    ...Object.keys(data).reduce(
      (acc, cur) => ({ ...acc, [cur]: data[cur][key] }),
      {}
    ),
  }));

  const CustomBarLabel = (props) => {
    console.log(props);
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y} dy={25} fill="#000" textAnchor="middle">
        {value !== 0 ? value : ""}
      </text>
    );
  };

  const bars = Object.keys(data).map((key, index) => (
    <Bar
      key={index}
      dataKey={key}
      stackId="a"
      fill={priority_colors[3 - index]}
    >
      <LabelList dataKey={key} position="middle" content={CustomBarLabel} />
    </Bar>
  ));

  // console.log(bars)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Grid padding={2} backgroundColor={colors.blueAccent[300]}>
          <Typography variant="subtitle2" component="p">
            {label}
          </Typography>
          {payload.map((p, i) => {
            if (p.value > 0) {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "5px 0",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: p.color,
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      marginRight: "5px",
                    }}
                  ></span>
                  <Typography variant="body2" component="span">
                    {p.name}: {p.value}
                  </Typography>
                </div>
              );
            }
            return null;
          })}
        </Grid>
      );
    }

    return null;
  };

  const legendPayload = Object.keys(data).map((key, index) => ({
    id: key,
    type: "square",
    value:
      key == 21
        ? "less than 21 days"
        : key == 60
        ? "21 to 60 days"
        : key == 100
        ? "61 to 100 days"
        : "more than 100 days",
    color: priority_colors[3 - index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
      >
        <YAxis type="category" dataKey="name" padding={{ top: 30 }} />
        <XAxis type="number" padding={{ right: 30 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          align="right"
          verticalAlign="top"
          layout="vertical"
          payload={legendPayload}
        />
        {bars}
      </BarChart>
    </ResponsiveContainer>
  );
};
