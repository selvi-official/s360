import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useState } from "react";
import { fetchHistoricalPillarScores } from "../util/HelperFunctions";

export const WAPillarScoreHistoricalChart = ({ data, className }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //   const [selectedLines, setSelectedLines] = useState(["RELIABILITY","SECURITY","PERFORMANCE EFFICIENCY","OPERATIONAL EXCELLENCE","COST"]);
  const [visibleLine, setVisibleLine] = useState(null);

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setVisibleLine((prevLine) => (prevLine === dataKey ? null : dataKey));
  };

  //   const [PillarData, setPillarData] = useState([])

  //   useEffect(async ()=>{
  //     const resp = await fetchHistoricalPillarScores("528075892726","us-east-1")
  //     setPillarData(resp)
  //   },[])

  const aggregatedData = data?.reduce((acc, current) => {
    const date = current?.run_id?.split("-").slice(0, 3).join("-");
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][current.pillar.toLowerCase()] = current.score;
    return acc;
  }, {});

  const chartData = aggregatedData
    ? Object.keys(aggregatedData).map((date) => ({
        date,
        ...aggregatedData[date]
      }))
    : [];
  const lineColors = {
    "RELIABILITY": colors.redAccent[300],
    "SECURITY": "blue",
    "PERFORMANCE EFFICIENCY": "green",
    "OPERATIONAL EXCELLENCE": "orange",
    "COST": "violet"
  };

  // Sort the data by date
  const sortedData = chartData?.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <ResponsiveContainer width="100%" height="90%">
      {sortedData.length > 0 ? (
      <LineChart
        width={300}
        height={350}
        data={sortedData}
        margin={{
          top: 30,
          right: 10,
          left: 10,
          bottom: 0
        }}
        className={className}
      >
        <XAxis dataKey="date" type="category"  tickFormatter={(date) => new Date(date).toLocaleDateString()}  stroke={colors.primary[100]} />
        <YAxis stroke={colors.primary[100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.primary[900],
            borderRadius: 10
          }}
        />
        <Legend onClick={handleLegendClick} style={{ bottom:  '-20px'}}  />

        <Line
          type="monotone"
          dataKey="cost"
          stroke={colors.blueAccent[300]}
          hide={visibleLine && visibleLine !== "cost"}
        />

        <Line
          type="monotone"
          dataKey="operational excellence"
          stroke={colors.orangeAccent[300]}
          hide={visibleLine && visibleLine !== "operational excellence"}
        />

        <Line
          type="monotone"
          dataKey="performance efficiency"
          stroke={colors.greenAccent[300]}
          hide={visibleLine && visibleLine !== "performance efficiency"}
        />

        <Line
          type="monotone"
          dataKey="reliability"
          stroke={colors.redAccent[300]}
          hide={visibleLine && visibleLine !== "reliability"}
        />
        <Line
          type="monotone"
          dataKey="security"
          stroke={colors.yellowAccent[300]}
          hide={visibleLine && visibleLine !== "security"}
        />
        
        
        

        {/* {Object.keys(chartData[0])
          .filter((key) => key !== 'pillar')
          .map((key) =>
            selectedLines.includes(key) ? (
              <Line key={key} type="monotone" dataKey={key} stroke={lineColors[key]} />
            ) : null
          )} */}
      </LineChart>
      ):(
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
