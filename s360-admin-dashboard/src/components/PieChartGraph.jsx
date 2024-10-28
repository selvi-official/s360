import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography, useTheme } from '@mui/material';
import { tokens } from '../theme';

const COLORS = ['#dc3545', '#28a745','#007bff','#ffc107','#f8f9fa'];

export const PieChartGraph = ({ data, width=300, height=300 }) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);
    // If all values are 0, return an empty pie chart
    if (total === 0) {
        return <Typography variant='h5' paddingTop={10} > No data to display</Typography>;
    }


    const pieData = Object.entries(data).map(([name, value, value2], index) => ({
        name,
        value,
        value2,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        // <ResponsiveContainer width="100%" height="100%">
        <PieChart width={width} height={height}>
            <Pie
                data={pieData}
                
                // isAnimationActive={true}
                innerRadius={40}
                outerRadius={80}
                // fill="#8884d8"
                dataKey="value"
                label
            >

                {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: colors.blueAccent[300] }} />
            <Legend />
        </PieChart>
        // </ResponsiveContainer>
    );
};

PieChartGraph.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            'SLAMISSED': PropTypes.number.isRequired,
            'IN SLA': PropTypes.number.isRequired,
        })
    ).isRequired,
};

export const PieChartGraphExplicit =({ data, dataKey, dataValue , width = 250, height = 300 }) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    // if(!width) width = 200
    // if(!height) height=300

    // const total = data.reduce((acc, curr) => acc + curr, 0);
    // If all values are 0, return an empty pie chart
    if (data.length === 0 ) {
        return <Typography variant='h5' paddingTop={10} > No data to display</Typography>;
    }


    const pieData = data.map((item, index) => ({
        name: item[dataKey],
        value: item[dataValue],
        fill: COLORS[index % COLORS.length],
    }));
    const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
    if (total === 0 ) {
        return <Typography variant='h2' paddingTop={10} textAlign='center' fontWeight='bold' color={colors.blueAccent[400]}  > NA</Typography>;
    }

    return (
        // <ResponsiveContainer width="100%" height="100%">
        <PieChart width={width} height={height}>
            <Pie
                data={pieData}
                
                // isAnimationActive={true}
                innerRadius={40}
                outerRadius={80}
                // fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label
            >

                {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: colors.blueAccent[300] }} />
            <Legend />
        </PieChart>
        // </ResponsiveContainer>
    );
};