import { Box, Grid } from '@mui/material';
import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useTheme } from '@emotion/react';
import { tokens } from '../theme';
import Header from './Header';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,

);

const options = {
    responsive: true,
    scales: {
        y: {
            beginAtZero: true
        }
    },
    
    legend: {
        position: 'top',
    },
    plugins: {
        
        title: {
            display: true,
            text: 'Chart.js Line Chart',
        },
    },
};



const GraphBox = ({ data, title, subtitle }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const graphValues = data.values

    const avgValue = (graphValues.reduce((a, b) => a + b, 0) / graphValues.length).toFixed(2)

    const chartData = {
        labels: data.months,
        datasets: [
            {
                label: 'Value',
                data: data.values,
                borderColor: colors.blueAccent[400],
                backgroundColor: colors.blueAccent[500],
            },
        ],
    };

    const chartOptions = {
        // responsive: true,
        maintainAspectRatio: false,
        // showDataSetFilter: false,

        scales: {
            y: {
                beginAtZero: true,
            }
        },
        
        plugins: {
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        
                        yMin:25,
                        yMax:25,
                        borderColor: 'red',
                        borderDash: [2, 2],
                        borderWidth: 2,
    
                    }
                }
            },
           
            legend: {
                display: false,
            }
        }


    };

    return (
        <Grid item xs style={{ backgroundColor: colors.primary[500], height: '300' }}>
            <Box display='flex' justifyContent='space-evenly' alignItems='center'>
                <Header title={title} subtitle={subtitle} variant='h3' />
                <Header title={'Average : ' + avgValue} variant='h3' />
            </Box>
            <Box style={{ backgroundColor: colors.primary[400], height: '300px', border: '1px solid grey', }}>

                <Line data={chartData} options={chartOptions} />
            </Box>
        </Grid>

    );
};

export default GraphBox;
