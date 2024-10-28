import React from "react";
import { Grid, Typography, colors, useTheme, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
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
  LineChart,
  Legend,
  Line,
  Label,
  LabelList,
} from "recharts";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { tokens } from "../theme";

export const CustomizedChartWithTTr = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const CustomLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text
      x={x}
      y={y}
      dx={0}
      dy={-5}
        fill={colors.blueAccent[200]}
textAnchor="middle"
        fontSize="75%"
      >
        {value} 
      </text>
    );
  };
  

  return (
    <ResponsiveContainer width={650}
    height={350}  >
      {data.length == 12 ? (
        <LineChart
        data={data}
        margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
        
      >
        <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
        </XAxis>
        <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
        <Tooltip  />
        <Legend  />
        <Line type="monotone"  dataKey="Non_Platform_TTR" stroke="#02b2af" name="TTR(in mins)" >
          <LabelList content={<CustomLabel />} />
        </Line>
        </LineChart>
      ): (
        
        <div>
            <h1>{data.length}</h1>
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

export const CustomizedChartWithTTrQuarter = ({ data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    const CustomLabel3 = (props) => {
      const { x, y, value } = props;
      return (
        <text
        x={x}
        y={y}
        dx={0}
        dy={-5}
          fill={colors.blueAccent[200]}
  textAnchor="middle"
        fontSize="75%"
        >
          {value} 
        </text>
      );
    };
  
    return (
      <ResponsiveContainer width={650}
      height={350}  >
        {data.length > 0? (
          <LineChart
          data={data}
          margin={{ top: 40, right: 40, left: -10, bottom: 30 }}
          
        >
          <XAxis dataKey="Quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
          </XAxis>
          <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
          <Tooltip  />
          <Legend  />
          <Line type="monotone"  dataKey="Non_Platform_TTR" stroke="#02b2af" name="TTR(in mins)" >
            <LabelList content={<CustomLabel3 />} />
          </Line>
          </LineChart>
        ): (
          
          <div>
              <h1>{data.length}</h1>
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
  


export const CustomizedChartWithoutTTr = ({ data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    const CustomLabel2 = (props) => {
      const { x, y, value } = props;
      return (
        <text
        x={x}
        y={y}
        dx={0}
        dy={-5}
          fill={colors.blueAccent[200]}
  textAnchor="middle"
        fontSize="75%"
        >
          {value} 
        </text>
      );
    };
  
    return (
      <ResponsiveContainer width={650}
      height={350}  >
        {data.length > 0 ? (
          <LineChart
          data={data}
          margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
          
        >
          <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
          </XAxis>
          <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
          <Tooltip  />
          <Legend  />
          <Line type="monotone"  dataKey="With_Platform_TTR" stroke="#02b2af" name="TTR(in mins)" >
            <LabelList content={<CustomLabel2 />} />
          </Line>
          </LineChart>
        ): (
          
          <div>
              <h1>{data.length}</h1>
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
  
  export const CustomizedChartWithoutTTrQuarter = ({ data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    const CustomLabel_2 = (props) => {
      const { x, y, value } = props;
      return (
        <text
        x={x}
        y={y}
        dx={0}
        dy={-5}
          fill={colors.blueAccent[200]}
  textAnchor="middle"
        fontSize="75%"
        >
          {value} 
        </text>
      );
    };
  
    return (
      <ResponsiveContainer width={650}
      height={350}  >
        {data.length > 0 ? (
          <LineChart
          data={data}
          margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
          
        >
          <XAxis dataKey="Quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
          </XAxis>
          <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
          <Tooltip  />
          <Legend  />
          <Line type="monotone"  dataKey="With_Platform_TTR" stroke="#02b2af" name="TTR(in mins)" >
            <LabelList content={<CustomLabel_2 />} />
          </Line>
          </LineChart>
        ): (
          
          <div>
              <h1>{data.length}</h1>
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
  export const CustomizedChartWithTTd = ({ data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    const CustomLabel_1 = (props) => {
      const { x, y, value } = props;
      return (
        <text
        x={x}
        y={y}
        dx={0}
        dy={-5}
          fill={colors.blueAccent[200]}
  textAnchor="middle"
        fontSize="75%"
        >
          {value} 
        </text>
      );
    };
  
    return (
      <ResponsiveContainer width={650}
      height={350}  >
        {data.length == 12 ? (
          <LineChart
          data={data}
          margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
          
        >
          <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
          </XAxis>
          <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
          <Tooltip  />
          <Legend  />
          <Line type="monotone"  dataKey="Non_Platform_TTD" stroke="#02b2af" name="TTD(in mins)" >
            <LabelList content={<CustomLabel_1 />} />
          </Line>
          </LineChart>
        ): (
          
          <div>
              <h1>{data.length}</h1>
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
  
  export const CustomizedChartWithTTdQuarter = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabel_5 = (props) => {
        const { x, y, value } = props;
        return (
          <text
          x={x}
          y={y}
          dx={0}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value} 
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {data.length > 0? (
            <LineChart
            data={data}
            margin={{ top: 40, right: 40, left: -10, bottom: 30 }}
            
          >
            <XAxis dataKey="Quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />
            <Line type="monotone"  dataKey="Non_Platform_TTD" stroke="#02b2af" name="TTD(in mins)" >
              <LabelList content={<CustomLabel_5 />} />
            </Line>
            </LineChart>
          ): (
            
            <div>
                <h1>{data.length}</h1>
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
    
  
  
  export const CustomizedChartWithoutTTd = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabel_3 = (props) => {
        const { x, y, value } = props;
        return (
          <text
          x={x}
          y={y}
          dx={0}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value} 
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {data.length > 0 ? (
            <LineChart
            data={data}
            margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
            
          >
            <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />
            <Line type="monotone"  dataKey="With_Platform_TTD" stroke="#02b2af" name="TTD(in mins)" >
              <LabelList content={<CustomLabel_3 />} />
            </Line>
            </LineChart>
          ): (
            
            <div>
                <h1>{data.length}</h1>
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
    
    export const CustomizedChartWithoutTTdQuarter = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabel_4 = (props) => {
        const { x, y, value } = props;
        return (
          <text
          x={x}
          y={y}
          dx={0}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value} 
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {data.length > 0 ? (
            <LineChart
            data={data}
            margin={{ top: 40, right: 40, left: 0, bottom: 30 }}
            
          >
            <XAxis dataKey="Quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />
            <Line type="monotone"  dataKey="With_Platform_TTD" stroke="#02b2af" name="TTD(in mins)" >
              <LabelList content={<CustomLabel_4 />} />
            </Line>
            </LineChart>
          ): (
            
            <div>
                <h1>{data.length}</h1>
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
    
    export const CustomizedChartSysVsCusMoM = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabell1 = (props) => {
        const { x, y, value } = props;
        
        return (
          <text
          x={x}
          y={y}
          dx={5}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value}
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {
            <BarChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 30 }}
            barGap={0.5}
          >
            <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />

            <Bar dataKey="Counts.Total_Outages"  fill={colors.redAccent[400]}  label={<CustomLabell1 />} name="Total Outages"/>
            <Bar dataKey="Counts.System_Reported"  fill={colors.blueAccent[300]} label={<CustomLabell1 />} name="System Reported"/>
            <Bar dataKey="Counts.Customer_Reported"  fill={colors.greenAccent[300]} label={<CustomLabell1 />} name="Customer Reported"/>
            </BarChart>
          }
        </ResponsiveContainer>
      );
    };
    
  
    export const CustomizedChartSysVsCusQoQ = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabell1 = (props) => {
        const { x, y, value } = props;
        
        return (
          <text
          x={x}
          y={y}
          dx={5}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value}
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {
            <BarChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 30 }}
            barGap={0.5}
          >
            <XAxis dataKey="quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />

            <Bar dataKey="Total_Outages"  fill={colors.redAccent[400]}  label={<CustomLabell1 />} name="Total Outages"/>
            <Bar dataKey="System_Reported"  fill={colors.blueAccent[300]} label={<CustomLabell1 />} name="System Reported"/>
            <Bar dataKey="Customer_Reported"  fill={colors.greenAccent[300]} label={<CustomLabell1 />} name="Customer Reported"/>
            </BarChart>
          }
        </ResponsiveContainer>
      );
    };
    
  
    export const CustomizedChartBuVsOtherMoM = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabell12 = (props) => {
        const { x, y, value } = props;
        
        return (
          <text
          x={x}
          y={y}
          dx={5}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value}
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {
            <BarChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 30 }}
            barGap={0.5}
          >
            <XAxis dataKey="Month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />

            <Bar dataKey="Counts.Total_Outages"  fill={colors.redAccent[400]}  label={<CustomLabell12 />} name="Total Outages"/>
            <Bar dataKey="Counts.Same_BU_Reported"  fill={colors.blueAccent[300]} label={<CustomLabell12 />} name="Caused by Same BU"/>
            <Bar dataKey="Counts.Other_BU_Reported"  fill={colors.greenAccent[300]} label={<CustomLabell12 />} name="Caused by Other BU"/>
            <Bar dataKey="Counts.Third_party_reported"  fill={colors.orangeAccent[300]} label={<CustomLabell12 />} name="Caused by Third Party"/>
            </BarChart>
          }
        </ResponsiveContainer>
      );
    };
    
  
    export const CustomizedChartBuVsOtherQoQ = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabell1 = (props) => {
        const { x, y, value } = props;
        
        return (
          <text
          x={x}
          y={y}
          dx={5}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value}
          </text>
        );
      };
    
      return (
        <ResponsiveContainer width={650}
        height={350}  >
          {
            <BarChart
            data={data}
            margin={{ top: 40, right: 30, left: 0, bottom: 30 }}
            barGap={0.5}
          >
            <XAxis dataKey="quarter" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />

            <Bar dataKey="Total_Outages"  fill={colors.redAccent[400]}  label={<CustomLabell1 />} name="Total Outages"/>
            <Bar dataKey="Same_BU_Reported"  fill={colors.blueAccent[300]} label={<CustomLabell1 />} name="Caused by Same BU"/>
            <Bar dataKey="Other_BU_Reported"  fill={colors.greenAccent[300]} label={<CustomLabell1 />} name="Caused by Other BU"/>
            <Bar dataKey="Third_party_reported"  fill={colors.orangeAccent[300]} label={<CustomLabell1 />} name="Caused by Third Party"/>
            </BarChart>
          }
        </ResponsiveContainer>
      );
    }

    export const CustomizedChartWoWSavings = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      const CustomLabel_5 = (props) => {
        const { x, y, value } = props;
        return (
          <text
          x={x}
          y={y}
          dx={0}
          dy={-5}
            fill={colors.blueAccent[200]}
    textAnchor="middle"
        fontSize="75%"
          >
            {value} 
          </text>
        );
      };
    
      return (
        <ResponsiveContainer  width="100%" height="100%">
          {data.length > 0 ? (
            <LineChart
              data={data}
              margin={{ top: 30, right: 40, left: -10, bottom: 50 }}
            >
            <XAxis dataKey="month" stroke={colors.blueAccent[100]} color={colors.blueAccent[100]} overflow="false" fontSize="65%">
            </XAxis>
            <YAxis stroke={colors.blueAccent[100]} style={{color:colors.blueAccent[100]}} fontSize="65%" />
            <Tooltip  />
            <Legend  />
            <Line type="monotone"  dataKey="actual" stroke="#02b2af" name="Actual" >
              <LabelList content={<CustomLabel_5 />} />
            </Line>
            <Line type="monotone"  dataKey="budget" stroke="#ffffff" name="Budget" >
              <LabelList content={<CustomLabel_5 />} />
            </Line>
            </LineChart>
          ): (
            
            <div>
                <h1>{data.length}</h1>
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

    
    export const PotentialSavingsTable = ({ data }) => {
      const CustomPagination = (props) => {
        return <div {...props} />;
      };
    
      console.log(data);
    
      // Extract unique dates
      const dates = [...new Set(Object.values(data).flat().map(item => item.DATE))];
      const accountNames = Object.keys(data);
    
      // Extract account names
      const columns = [
        { field: 'accountName', headerName: 'Account Name', width: 150},
        ...dates.flatMap(date => [
          {
            field: `${date}-cost`,
            headerName: `${date}`,
            width: 150,
            renderHeader: () => (
              <div>
                <div>{date}</div>
                <div>Cost ($)</div>
              </div>
            )
          },
          {
            field: `${date}-resources`,
            headerName: `${date}`,
            width: 150,
            renderHeader: () => (
              <div>
                <div>{date}</div>
                <div>Resources</div>
              </div>
            )
          }
        ])
      ];
    
      // Prepare rows for DataGrid
      const rows = accountNames.map((accountName, index) => {
        const row = { id: index, accountName };
        dates.forEach(date => {
          const rowData = data[accountName].find(item => item.DATE === date);
          row[`${date}-cost`] = rowData ? rowData["Cost($)"] : '-';
          row[`${date}-resources`] = rowData ? rowData.Resources : '-';
        });
        return row;
      });
    
      return (
        <Paper style={{ height: '90%',  display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              disableSelectionOnClick
              components={{
                Pagination: CustomPagination,
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                },
                '& .MuiDataGrid-footerContainer': {
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 1,
                },
              }}
              initialState={{
                pagination: {
                  pageSize: 5, // Ensure the initial page size is set correctly
                },
                pinnedColumns: { left: ['accountName'] }, // Freezing the first column
              }}
            />
          </div>
        </Paper>
      );
    };

    export const CustomizedChartWoWTopAccounts = ({ data }) => {
      const theme = useTheme();
      const colors = tokens(theme.palette.mode);
    
      // Custom label for the line chart
      const CustomLabel_6 = (props) => {
        const { x, y, value } = props;
        return (
          <text
            x={x}
            y={y}
            dx={0}
            dy={-5}
            fill={colors.blueAccent[200]}
            textAnchor="middle"
            fontSize="75%"
          >
            {value}
          </text>
        );
      };
    
      // Transform the data to match the required structure for the chart
      const transformedData = Object.keys(data).length
        ? data[Object.keys(data)[0]].map((item, idx) => {
            const dateEntry = { DATE: item.DATE };
            Object.keys(data).forEach((account) => {
              dateEntry[account] = data[account][idx]?.["Cost($)"];
            });
            return dateEntry;
          })
        : [];
    
      return (
        <ResponsiveContainer  width="100%" height="100%">
          {transformedData.length > 0 ? (
            <LineChart
              data={transformedData}
              margin={{ top: 30, right: 40, left: -10, bottom: 50 }}
            >
              <XAxis
                dataKey="DATE"
                stroke={colors.blueAccent[100]}
                color={colors.blueAccent[100]}
                fontSize="65%"
              />
              <YAxis
                stroke={colors.blueAccent[100]}
                style={{ color: colors.blueAccent[100] }}
                fontSize="65%"
              />
              <Tooltip />
              <Legend />
              {Object.keys(data).map((account) => (
                <Line
                  key={account}
                  type="monotone"
                  dataKey={account}
                  stroke="#02b2af"
                  name={account}
                >
                   <LabelList content={<CustomLabel_6 />} />
                </Line>
              ))}
            </LineChart>
          ) : (
            <div>
              <h1>{data.length}</h1>
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

  
    export const IdleResourcesTable = ({ data }) => {

      const CustomPagination = (props) => {
        return <div {...props} />;
      };
      const columns = [
        { field: 'account_name', headerName: 'ACCOUNT_NAME', width: 200 },
        { field: 'region', headerName: 'REGION', width: 150 },
        { field: 'resource_type', headerName: 'RESOURCE TYPE', width: 150 },
        { field: 'resource_id', headerName: 'RESOURCE_ID', width: 200 },
        { field: 'saving_category', headerName: 'SAVING CATEGORY', width: 200 },
        { 
          field: 'estimated_cost_saving_monthly', 
          headerName: 'ESTIMATED COST SAVING MONTHLY($)', 
          width: 250,
          valueFormatter: (params) => {
            if (typeof params.value === 'number') {
              return `$${params.value.toFixed(2)}`;
            }
            return params.value;
          },
        },
      ];
    
      const rows = data.map((item, index) => ({
        id: index,
        ...item
      }));
    
      return (
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={5} 
          components={{
                Pagination: CustomPagination,
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  zIndex: 1,
                },
                '& .MuiDataGrid-footerContainer': {
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 1,
                },
              }} />
        </div>
      );
    };

    export const AWSBudgetOverview = ({ data }) => {
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      };
    
      return (
        <Grid container>
  <Typography>AWS Quarterly Budget Overview - CX - Q3'24</Typography>
  
  <Grid container>
    <Typography>Quarterly Overview</Typography>
    <Grid item>
      <p className="font-semibold">Total Budget Allocated for Q4</p>
      <p className="text-xl">{data?.totalBudgetAllocated ? formatCurrency(data.totalBudgetAllocated) : 'N/A'}</p>
    </Grid>
    <Grid item>
      <p className="font-semibold">Total Budget used for Q4</p>
      <p className="text-xl">{data?.totalBudgetUsed ? formatCurrency(data.totalBudgetUsed) : 'N/A'}</p>
    </Grid>
    <Grid item>
      <p className="font-semibold">Total AWS Budget Allocated vs Used</p>
      <p className="text-xl text-green-700">{data?.totalBudgetAllocatedVsUsed ? formatCurrency(data.totalBudgetAllocatedVsUsed) : 'N/A'}</p>
    </Grid>
  </Grid>
  
  <Grid container>
    <Typography>AWS Cost overview for CX - Sep month</Typography>
    <Grid container spacing={2}>
    {data?.monthlyCostOverview ? (
      Object.entries(data.monthlyCostOverview).map(([key, value]) => (
        <React.Fragment key={key}>
          <Grid item xs={6}>
            <Box p={2} className="bg-gray-100 rounded">
              <Typography variant="subtitle1" fontWeight="bold">
                {key}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              p={2}
              className={typeof value === 'number' && value !== 0 ? 'bg-green-100' : 'bg-gray-100'}
            >
              <Typography variant="h6">
                {typeof value === 'number' ? (key.includes('Budget') ? formatCurrency(value) : value) : value}
              </Typography>
            </Box>
          </Grid>
        </React.Fragment>
      ))
    ) : (
      <Grid item xs={12}>
        <Typography>No data available</Typography>
      </Grid>
    )}
  </Grid>
  </Grid>
  
  <Grid>
    <Typography>AWS Cost and Usage split by account</Typography>
    <Grid item>
      <Table>
        <TableHead>
          <TableRow>
            {['ACCOUNT ID', 'ACCOUNT NAME', 'BUDGET', 'USAGE', 'FORECAST', 'B VS F'].map((header) => (
              <TableCell key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.accountSplit 
            ? data.accountSplit.map((account) => (
                <TableRow key={account.accountId} className={account.budget > account.usage ? 'bg-green-50' : 'bg-red-50'}>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{account.accountId}</TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{account.accountName}</TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{formatCurrency(account.budget)}</TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{formatCurrency(account.usage)}</TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{formatCurrency(account.forecast)}</TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">{formatCurrency(account.bVsF)}</TableCell>
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={6} className="text-center">No account data available</TableCell>
              </TableRow>}
        </TableBody>
      </Table>
    </Grid>
  </Grid>
</Grid>
      );
    };
    
    