import { useTheme } from '@mui/material';
import React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, ComposedChart } from 'recharts';
import { tokens } from '../theme';



const TrendGraph = ({ data }) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const sortedData = data.sort((a,b) => new Date(a.date) - new Date(b.date))

    const chartData = sortedData.map(({ date, sla_missed, sla_approaching, in_sla }) => ({
        date: new Date(date).getTime(),
        sla_missed,
        sla_approaching,
        in_sla
    }));

    const dateValues = chartData.map(d => d.date);
  const minXValue = Math.min(...dateValues);
  const maxXValue = Math.max(...dateValues);

  const dateFormatter = timeStamp => new Date(timeStamp).toLocaleDateString();

    return (
        <ResponsiveContainer >
            <LineChart data={chartData}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                < XAxis 
                    scale='time'
                    dataKey="date"
                    type="number" // set x-axis type as number
                    domain={['auto', 'auto']} // auto adjust based on values
                    tickFormatter={dateFormatter} // format tick label as date
                    interval='preserveStartEnd' angle={0} dx={0}
                    padding='gap'
                />
                <YAxis padding={{top: 30}} />
                <Tooltip 
                contentStyle={{backgroundColor:colors.primary[600]}} 
                // content = {() => {}}
                labelFormatter={dateFormatter}
                />
                <Legend />
                <Line type="monotone" dataKey="sla_missed" stroke={colors.redAccent[400]} name="SLA MISSED" />
                <Line type="monotone" dataKey="sla_approaching" stroke={colors.blueAccent[400]} name="SLA APPROACHING" />
                <Line type="monotone" dataKey="in_sla" stroke={colors.greenAccent[400]} name="IN SLA" />
            </LineChart>
        </ResponsiveContainer>
    );
};


export default TrendGraph;
