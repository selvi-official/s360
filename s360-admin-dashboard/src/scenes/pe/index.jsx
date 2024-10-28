import { Box, Grid, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import {
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableCell,
  TableHead,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  CircularProgress
} from "@mui/material";
import { useContext, useEffect, useState, useRef } from "react";
import { tokens } from "../../theme";
import { appConfig } from "../../appConfig";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import Paper from "@mui/material/Paper";
import "../../index.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "react-bootstrap";
import {
  CustomizedChartWithTTr,
  CustomizedChartWithoutTTr,
  CustomizedChartWithTTrQuarter,
  CustomizedChartWithoutTTrQuarter,
  CustomizedChartWithTTd,
  CustomizedChartWithoutTTd,
  CustomizedChartWithTTdQuarter,
  CustomizedChartWithoutTTdQuarter,
  CustomizedChartSysVsCusMoM,
  CustomizedChartSysVsCusQoQ,
  CustomizedChartBuVsOtherQoQ,
  CustomizedChartBuVsOtherMoM,
  CustomizedChartReliability
} from "../../components/PECustomCharts";

const PAndE2 = () => {
  const getCurrentQuarter = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const quarter = Math.ceil(month / 3);
    return `Q${quarter} ${year}`;
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [bu, setBu] = useState("CX");
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const finalData = [];
  const finalData2 = [];
  const pdfRef = useRef();

  const [
    PAndETotalSelfinducedCustomerreportedOutages,
    setPAndETotalSelfinducedCustomerreportedOutages
  ] = useState([
    {
      Counts: { Customer_Reported: 0, System_Reported: 0, Total_Outages: 0 },
      Month: "May",
      Year: 202
    }
  ]);
  const [PAndETotalOutagesQuarterly, setPAndETotalOutagesQuarterly] = useState([
    {
      quarter: "Q1 2023",
      Other_BU_Reported: 0,
      Same_BU_Reported: 0,
      Total_Outages: 0,
      Third_party_reported: 0
    }
  ]);
  const [PAndETotalOutages, setPAndETotalOutages] = useState([
    {
      Counts: {
        Other_BU_Reported: 0,
        Same_BU_Reported: 0,
        Total_Outages: 0,
        Third_party_reported: 0
      },
      Month: "May",
      Year: 2024
    },
    {
      Counts: {
        Other_BU_Reported: 0,
        Same_BU_Reported: 0,
        Total_Outages: 0,
        Third_party_reported: 0
      },
      Month: "Apr",
      Year: 2024
    }
  ]);
  const [
    PAndETotalSelfinducedCustomerreportedOutagesQuarterly,
    setPAndETotalSelfinducedCustomerreportedOutagesQuarterly
  ] = useState([
    {
      quarter: "Q1 2023",
      Customer_Reported: 0,
      System_Reported: 0,
      Total_Outages: 0
    }
  ]);
  const [PAndEMttdWithPlatforms, setPAndEMttdWithPlatforms] = useState([
    { Month: "Jun", With_Platform_TTD: 0, Year: 2023 },
    { Month: "Jul", With_Platform_TTD: 0, Year: 2023 }
  ]);
  const [PAndEMttdWithoutPlatforms, setPAndEMttdWithoutPlatforms] = useState([
    { Month: "Jun", Non_Platform_TTD: 0, Year: 2023 },
    { Month: "Jul", Non_Platform_TTD: 0, Year: 2023 }
  ]);
  const [PAndEP0MttrWithPlatforms, setPAndEP0MttrWithPlatforms] = useState([
    { Month: "Jun", With_Platform_TTR: 0, Year: 2023 },
    { Month: "Jul", With_Platform_TTR: 0, Year: 2023 }
  ]);
  const [PAndEP0MttrWithoutPlatforms, setPAndEP0MttrWithoutPlatforms] =
    useState([
      { Month: "Jun", Non_Platform_TTR: 0, Year: 2023 },
      { Month: "Jul", Non_Platform_TTR: 0, Year: 2023 }
    ]);
  const [PAndEP1MttrWithPlatforms, setPAndEP1MttrWithPlatforms] = useState([
    { Month: "Jun", With_Platform_TTR: 0, Year: 2023 },
    { Month: "Jul", With_Platform_TTR: 0, Year: 2023 }
  ]);
  const [PAndEP1MttrWithoutPlatforms, setPAndEP1MttrWithoutPlatforms] =
    useState([
      { Month: "Jun", Non_Platform_TTR: 0, Year: 2023 },
      { Month: "Jul", Non_Platform_TTR: 0, Year: 2023 }
    ]);
  const [PAndEOKRComparison, setPAndEOKRComparison] = useState([
    {
      count_p0_p1: { baseline: 0, value: 0 },
      mttd: { baseline: 0, value: 0 },
      mttr_p0: { baseline: 0, value: 0 },
      mttr_p1: { baseline: 0, value: 0 },
      total_incidents_detected_by_system: { baseline: 0, value: 0 }
    }
  ]);

  const [
    PAndEMttdWithoutPlatformsQuarterly,
    setPAndEMttdWithoutPlatformsQuarterly
  ] = useState([{ BU: "BU", Quarter: "Month", Non_Platform_TTD: 0 }]);
  const [PAndEMttdWithPlatformsQuarterly, setPAndEMttdWithPlatformsQuarterly] =
    useState([{ BU: "BU", Quarter: "Month", With_Platform_TTD: 0 }]);

  const [
    PAndEP0MttrWithPlatformsQuarterly,
    setPAndEP0MttrWithPlatformsQuarterly
  ] = useState([{ BU: "BU", Quarter: "Month", With_Platform_TTR: 0 }]);
  const [
    PAndEP0MttrWithoutPlatformsQuarterly,
    setPAndEP0MttrWithoutPlatformsQuarterly
  ] = useState([{ BU: "BU", Quarter: "Month", Non_Platform_TTR: 0 }]);
  const [
    PAndEP1MttrWithPlatformsQuarterly,
    setPAndEP1MttrWithPlatformsQuarterly
  ] = useState([{ BU: "BU", Quarter: "Month", With_Platform_TTR: 0 }]);
  const [
    PAndEP1MttrWithoutPlatformsQuarterly,
    setPAndEP1MttrWithoutPlatformsQuarterly
  ] = useState([{ BU: "BU", Quarter: "Month", Non_Platform_TTR: 0 }]);
  const [PAndEAvailabilityMonthly, setPAndEAvailabilityMonthly] = useState({
    Freshcaller: {
      AU: [{ availability_percentage: 0, ttr_minutes: 130.0 }],
      EU: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }],
      IN: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }],
      US: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }]
    },
    Freshchat: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.83, ttr_minutes: 226.0 }]
    },
    Freshdesk: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      US: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }]
    },
    Freshmarketer: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.83, ttr_minutes: 220.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }]
    },
    Freshsales: {
      AU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      EU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      IN: [{ availability_percentage: 99.97, ttr_minutes: 41.0 }],
      US: [{ availability_percentage: 99.19, ttr_minutes: 1060.0 }]
    },
    Freshservice: {
      AU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      EU: [{ availability_percentage: 100.0, ttr_minutes: 5.0 }],
      IN: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      US: [{ availability_percentage: 100.0, ttr_minutes: 0 }]
    },
    "Freshworks CRM": {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.02, ttr_minutes: 1286.0 }]
    }
  });

  const [PAndEAvailability, setPAndEAvailability] = useState({
    Freshcaller: {
      AU: [{ availability_percentage: 0, ttr_minutes: 130.0 }],
      EU: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }],
      IN: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }],
      US: [{ availability_percentage: 99.9, ttr_minutes: 130.0 }]
    },
    Freshchat: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.83, ttr_minutes: 226.0 }]
    },
    Freshdesk: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      US: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }]
    },
    Freshmarketer: {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.83, ttr_minutes: 220.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }]
    },
    Freshsales: {
      AU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      EU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      IN: [{ availability_percentage: 99.97, ttr_minutes: 41.0 }],
      US: [{ availability_percentage: 99.19, ttr_minutes: 1060.0 }]
    },
    Freshservice: {
      AU: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      EU: [{ availability_percentage: 100.0, ttr_minutes: 5.0 }],
      IN: [{ availability_percentage: 100.0, ttr_minutes: 0 }],
      US: [{ availability_percentage: 100.0, ttr_minutes: 0 }]
    },
    "Freshworks CRM": {
      AU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      EU: [{ availability_percentage: 99.88, ttr_minutes: 155.0 }],
      IN: [{ availability_percentage: 99.85, ttr_minutes: 196.0 }],
      US: [{ availability_percentage: 99.02, ttr_minutes: 1286.0 }]
    }
  });
  const [PAndEQuarter, setPAndEQuarter] = useState([]);
  const [buArray, setBuArray] = useState([]);
  const [PAndEBuOutagesTable1, setPAndEBuOutagesTable1] = useState([]);
  const [PAndEBuOutagesTable2, setPAndEBuOutagesTable2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState("May");
  const [year, setYear] = useState("2024");
  const quarterDict = [];
  const BuDict = [];
  const [monthDct, setMonthDct] = useState([]);
  const [yearDct, setYearDct] = useState([]);

  buArray.forEach((item) => {
    BuDict.push({ value: item, label: item });
  });

  PAndEQuarter.forEach((item) => {
    quarterDict.push({ value: item, label: item });
  });

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        borderRadius: 5,
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 100,
        backgroundColor: colors.blueAccent[800]
      }
    }
  };

  const handlePAndEAvailability = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url + `/v2/availability?quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEAvailability(data);
  };

  const handlePAndEAvailabilityMonthly = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/availabilitymonthly?year=${year}&month=${month}`
    );
    const data = await response.json();
    setPAndEAvailabilityMonthly(data);
  };

  const handlePAndEBuOutagesTable1 = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url + `/v2/getBuView1?bu=${bu}&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEBuOutagesTable1(data);
  };

  const handlePAndEBuOutagesTable2 = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getCustDetectedView1?bu=${bu}&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEBuOutagesTable2(data);
  };

  const handlePAndETotalOutages = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getCustDetectedView1n3?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndETotalOutages(data["monthly"]);
  };

  const handlePAndETotalSelfinducedCustomerreportedOutages = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getCustDetectedView2n4?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndETotalSelfinducedCustomerreportedOutages(data["monthly"]);
  };

  const handlePAndETotalOutagesQuarterly = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getCustDetectedView1n3?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    for (const year in data["quarterly"]) {
      for (const quarter in data["quarterly"][year]) {
        finalData.push(
          Object.assign(
            {},
            { quarter: quarter + " " + year },
            data["quarterly"][year][quarter]
          )
        );
      }
    }
    setPAndETotalOutagesQuarterly(finalData);
  };

  const handlePAndETotalSelfinducedCustomerreportedOutagesQuarterly =
    async () => {
      const response = await fetch(
        appConfig.backend_Api_Url +
          `/v2/getCustDetectedView2n4?bu='${bu}'&quarter=${quarter}`
      );
      const data = await response.json();
      for (const year in data["quarterly"]) {
        for (const quarter in data["quarterly"][year]) {
          finalData2.push(
            Object.assign(
              {},
              { quarter: quarter + " " + year },
              data["quarterly"][year][quarter]
            )
          );
        }
      }
      setPAndETotalSelfinducedCustomerreportedOutagesQuarterly(finalData2);
    };

  const handlePAndEMttdWithPlatforms = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getCustDetectedView3P0?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEMttdWithPlatforms(data["results"]);
    setPAndEMttdWithoutPlatforms(data["results2"]);

    const response2 = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getmttddataquarter?bu='${bu}'&quarter=${quarter}`
    );
    const data2 = await response2.json();
    setPAndEMttdWithPlatformsQuarterly(data2["results2"].reverse());
    setPAndEMttdWithoutPlatformsQuarterly(data2["results"].reverse());
  };

  const handlePAndEP0MttrWithPlatforms = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getMonthlyP0Mttr?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEP0MttrWithPlatforms(data["results"].reverse());
    setPAndEP0MttrWithoutPlatforms(data["results2"].reverse());

    const response2 = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getmttrdataquarterp0?bu='${bu}'&quarter=${quarter}`
    );
    const data2 = await response2.json();
    setPAndEP0MttrWithPlatformsQuarterly(data2["results2"].reverse());
    setPAndEP0MttrWithoutPlatformsQuarterly(data2["results"].reverse());
  };

  const handlePAndEP1MttrWithPlatforms = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getMonthlyP1Mttr?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEP1MttrWithPlatforms(data["results"].reverse());
    setPAndEP1MttrWithoutPlatforms(data["results2"].reverse());

    const response2 = await fetch(
      appConfig.backend_Api_Url +
        `/v2/getmttrdataquarterp1?bu='${bu}'&quarter=${quarter}`
    );
    const data2 = await response2.json();
    setPAndEP1MttrWithPlatformsQuarterly(data2["results2"].reverse());
    setPAndEP1MttrWithoutPlatformsQuarterly(data2["results"].reverse());
  };

  const handlePAndEOKRComparison = async () => {
    const response = await fetch(
      appConfig.backend_Api_Url + `/v2/kpis?bu='${bu}'&quarter=${quarter}`
    );
    const data = await response.json();
    setPAndEOKRComparison(data);
  };

  const handleQuarterPAndE = async () => {
    const response = await fetch(appConfig.backend_Api_Url + `/v2/getQuarter`);
    const data = await response.json();
    setPAndEQuarter(data);
  };

  const handleBuPAndE = async () => {
    const response = await fetch(appConfig.backend_Api_Url + `/v2/getBu`);
    const data = await response.json();
    setBuArray(data);
  };

  const handleMonthsDct = async () => {
    const response = await fetch(appConfig.backend_Api_Url + `/v2/getmonths`);
    const data = await response.json();
    const monthDct = [];
    data.forEach((item) => {
      monthDct.push({ value: item, label: item });
    });
    setMonthDct(monthDct);
  };

  const handleYearDct = async () => {
    const response = await fetch(appConfig.backend_Api_Url + `/v2/getyears`);
    const data = await response.json();
    const yearDct = [];
    data.forEach((item) => {
      yearDct.push({ value: item.toString(), label: item.toString() });
    });
    setYearDct(yearDct);
  };

  const handlePAndEPageFilter = () => {
    handleBuPAndE();
    handleMonthsDct();
    handleYearDct();
    handleQuarterPAndE();
    handlePAndEBuOutagesTable1();
    handlePAndEBuOutagesTable2();
    handlePAndETotalOutages();
    handlePAndETotalSelfinducedCustomerreportedOutages();
    handlePAndETotalOutagesQuarterly();
    handlePAndETotalSelfinducedCustomerreportedOutagesQuarterly();
    handlePAndEMttdWithPlatforms();
    handlePAndEP0MttrWithPlatforms();
    handlePAndEP1MttrWithPlatforms();
    handlePAndEOKRComparison();
    handlePAndEAvailabilityMonthly();
    handlePAndEAvailability();
  };

  const handleQuarterChange = (event) => {
    setQuarter(event.target.value);
  };
  const handleBuChange = (event) => {
    setBu(event.target.value);
  };

  useEffect(() => {
    handlePAndEPageFilter();
  }, [bu, quarter]);

  const options = {
    plugins: {
      datalabels: {
        display: true,
        color: "black",
        formatter: Math.round,
        anchor: "end",
        offset: -20,
        align: "start"
      }
    },
    legend: {
      display: false
    }
  };

  useEffect(() => {
    handlePAndEAvailabilityMonthly();
  }, [month, year]);

  const downloadPdf = () => {
    const input = pdfRef.current;
    console.log("before function call", loading);
    html2canvas(input, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
      backgroundColor: "#141b2d"
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4", true);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      console.log("inside html2canvas fn");
      pdf.addImage(
        imgData,
        "JPEG",
        imgX,
        0,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save("samplepe.pdf");
      setLoading((loading) => false);
      console.log("after function call", loading);
    });
  };
  const handleChange = () => {
    console.log("incide handlechange");
    setLoading((loading) => true);
    console.log(loading);
    downloadPdf();
  };

  return (
    <>
      <div ref={pdfRef}>
        <Grid
          container
          display="flex"
          flexDirection="column"
          gap={1}
          paddingTop="40px"
        >
          <Grid
            container
            justifyContent="space-around"
            paddingBottom={2}
            grid-gap="5px"
            paddingRight={2}
            onSubmit={handlePAndEPageFilter}
          >
            <Grid item xs={8}>
              <Typography
                variant="h1"
                fontWeight="600"
                paddingLeft="10px"
              >
                Outages Overview
              </Typography>
              <br></br>
              <Typography variant="h6" paddingLeft="1%">
                (Note: Incidents only where status_page_updated field is marked as yes, are considered in the below calculation.)
              </Typography>
            </Grid>
            

            <Grid item xs={12} sm="auto">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colors.grey[900],
          borderRadius: 1,
          height: '38px',
          maxWidth: '300px',
          minWidth: '150px',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1B1D2A',
            color: '#1E6DFF',
            padding: '0px 12px',
            borderRadius: '4px 0 0 4px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Quarter
        </Box>
        <FormControl
          variant="outlined"
          sx={{
            flex: 1,
            backgroundColor: '#101012',
            borderRadius: '0 4px 4px 0',
            height: '100%',
            '& .MuiOutlinedInput-root': {
              height: '100%',
              padding: '0 10px',
              borderRadius: '0 4px 4px 0',
              '&.Mui-focused': {
                boxShadow: 'none',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '& .MuiSvgIcon-root': {
              color: '#fff',
            },
          }}
        >
          <Select
             value={quarter}
             label="Quarter"
            onChange={handleQuarterChange}
            variant="outlined"
            fullWidth
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#1B1D2A',
                  color: '#fff',
                  '& .MuiMenuItem-root': {
                    '&.Mui-selected': {
                      backgroundColor: '#1E6DFF',
                    },
                    '&:hover': {
                      backgroundColor: '#1E6DFF',
                    },
                  },
                },
              },
            }}
            sx={{
              color: '#fff',
              backgroundColor: '#101012',
              '& .MuiSelect-outlined': {
                padding: '8px 12px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
       {quarterDict.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
          </Select>
        </FormControl>
      </Box>
  </Grid>
  <Grid item xs={12} sm="auto">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colors.grey[900],
          borderRadius: 1,
          height: '38px',
          maxWidth: '300px',
          minWidth: '150px',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#1B1D2A',
            color: '#1E6DFF',
            padding: '0px 12px',
            borderRadius: '4px 0 0 4px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          BU
        </Box>
        <FormControl
          variant="outlined"
          sx={{
            flex: 1,
            backgroundColor: '#101012',
            borderRadius: '0 4px 4px 0',
            height: '100%',
            '& .MuiOutlinedInput-root': {
              height: '100%',
              padding: '0 10px',
              borderRadius: '0 4px 4px 0',
              '&.Mui-focused': {
                boxShadow: 'none',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '& .MuiSvgIcon-root': {
              color: '#fff',
            },
          }}
        >
          <Select
           value={bu}
           label="BU"
           onChange={handleBuChange}
            variant="outlined"
            fullWidth
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#1B1D2A',
                  color: '#fff',
                  '& .MuiMenuItem-root': {
                    '&.Mui-selected': {
                      backgroundColor: '#1E6DFF',
                    },
                    '&:hover': {
                      backgroundColor: '#1E6DFF',
                    },
                  },
                },
              },
            }}
            sx={{
              color: '#fff',
              backgroundColor: '#101012',
              '& .MuiSelect-outlined': {
                padding: '8px 12px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
                    {BuDict.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      defaultValue="CX"
                    >
                      {option.label}
                    </MenuItem>
                  ))}
          </Select>
        </FormControl>
      </Box>
  </Grid>

  <Grid item xs={1} data-html2canvas-ignore="true">
  <Box
    onClick={handleChange}
    sx={{
      backgroundColor: '#1B1D2A',  // Dark background color similar to the "Region" box
      color: '#1E6DFF',  // Blue text color similar to the "Region" box
      fontSize: '14px',  // Match the font size
      fontWeight: 'bold',  // Match the font weight
      borderRadius: '4px',  // Slightly rounded corners
      padding: '8px 16px',  // Padding to give it a box-like feel
      display: 'flex',  // Ensure it behaves like a button
      alignItems: 'center',  // Center the text vertically
      justifyContent: 'center',  // Center the text horizontally
      cursor: 'pointer',  // Change cursor to pointer on hover
      minWidth: '100px',  // Minimum width for consistent appearance
      textAlign: 'center',  // Center the text inside the box
      '&:hover': {
        backgroundColor: '#1E6DFF',  // Invert colors on hover
        color: '#FFF',  // Change text color to white on hover
      },
    }}
  >
    Download
  </Box>
</Grid>



            {loading ? (
              <Grid item xs={1} data-html2canvas-ignore="true">
                <CircularProgress color="secondary" />
              </Grid>
            ) : (
              <Grid item xs={1} data-html2canvas-ignore="true"></Grid>
            )}
          </Grid>

          <Grid>

            {bu != "Platform" && (
              <Grid
              item
              xs={"auto"}
              sx={{ borderRadius: 5 }}
              alignItems="left"
              padding={2}
            >
              <TableContainer component={Paper}>
                <Table
                  sx={{ minWidth: 600, minHeight: 100 }}
                  aria-label="simple table"
                >
                  <TableHead>
                    <TableRow
                      style={{ backgroundColor: colors.blueAccent[800] }}
                    >
                      <TableCell
                        align="center"
                        style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                      >
                        Quarter
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                        colSpan={3}
                      >
                        Total Outages
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                        colSpan={2}
                      >
                        Induced by Same BU
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                        colSpan={2}
                      >
                        Induced by Other BU
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                        colSpan={2}
                      >
                        Induced By Third Party
                      </TableCell>
                    </TableRow>
                    <TableRow
                      style={{ backgroundColor: colors.blueAccent[800] }}
                    >
                      <TableCell style={{ fontSize: "100%", borderRight: '1px solid #333' }}></TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Total
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P0
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P1
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P0
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P1
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P0
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P1
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P0
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        P1
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PAndEBuOutagesTable1.map((row) => (
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        {row.map((iter, index) => {
                          const firstIndexValue = row[0]; // Store the value of index = 0
                          return (
                            <TableCell
                              align="center"
                              scope="row"
                              style={{
                                fontSize: "100%",
                                padding: "0.7%",
                                backgroundColor: colors.primary[400],
                                borderRight: '1px solid #333'
                              }}
                              key={index}
                            >
                              {index === 1 ? (
                                <a
                                  href={`/incident-details/${bu}/${firstIndexValue}`}
                                  target="_blank"
                                  style={{ color: "white" }}
                                >
                                  {iter}
                                </a>
                              ) : (
                                iter
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                <br></br>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 600, minHeight: 100 }}
                    aria-label="simple table"
                  >
                    <TableHead>
                      <TableRow
                        style={{ backgroundColor: colors.blueAccent[800] }}
                      >
                        <TableCell
                          align="center"
                          style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                        >
                          Quarter
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                          colSpan={3}
                        >
                          Total Outages
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                          colSpan={2}
                        >
                          System Identified
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontSize: "100%", borderRight: '1px solid #333' }}
                          colSpan={2}
                        >
                          Customer Reported
                        </TableCell>
                      </TableRow>
                      <TableRow
                        style={{ backgroundColor: colors.blueAccent[800] }}
                      >
                        <TableCell style={{ fontSize: "100%", borderRight: '1px solid #333' }}></TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          Total
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P0
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P1
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P0
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P1
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P0
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                          P1
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {PAndEBuOutagesTable2.map((row) => (
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 }
                          }}
                        >
                          {row.map((iter, index) => (
                            <TableCell
                              align="center"
                              scope="row"
                              style={{
                                fontSize: "100%",
                                padding: "0.7%",
                                backgroundColor: colors.primary[400],
                                borderRight: '1px solid #333'
                              }}
                              key={index}
                            >
                              {index === 1 ? (
                                <a
                                  href={`/incident-details/${bu}/${quarter}`}
                                  target="_blank"
                                  style={{ color: "white" }}
                                >
                                  {iter}
                                </a>
                              ) : (
                                iter
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {bu == "Platform" && (
              <Grid
                item
                xs={"auto"}
                sx={{ borderRadius: 5 }}
                alignItems="left"
                padding={2}
              >
                <TableContainer component={Paper}>
                <Table sx={{ minWidth: 600, minHeight: 100 }} aria-label="simple table">
                  <TableHead>
                    <TableRow style={{ backgroundColor: colors.blueAccent[800]}}>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Quarter
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Total Outages
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Induced By Third Party
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PAndEBuOutagesTable1.map((row) => (
                      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        {row.slice(0, 3).map((iter, index) => {
                          const firstIndexValue = row[0]; // Store the value of index = 0
                          return (
                            <TableCell
                              align="center"
                              scope="row"
                              style={{
                                fontSize: "100%",
                                padding: "0.7%",
                                backgroundColor: colors.primary[400],
                                borderRight: '1px solid #333'
                              }}
                              key={index}
                            >
                              {index === 1 ? (
                                <a
                                  href={`/incident-details/${bu}/${firstIndexValue}`}
                                  target="_blank"
                                  style={{ color: "white" }}
                                >
                                  {iter}
                                </a>
                              ) : (
                                iter
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <br />
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 600, minHeight: 100 }} aria-label="simple table">
                  <TableHead>
                    <TableRow style={{ backgroundColor: colors.blueAccent[800] }}>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Quarter
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Total Outages
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        System Identified
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%", borderRight: '1px solid #333' }}>
                        Customer Reported
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {PAndEBuOutagesTable2.map((row) => (
                      <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        {row.slice(0, 4).map((iter, index) => {
                          const firstIndexValue = row[0]; // Store the value of index = 0
                          return (
                            <TableCell
                              align="center"
                              scope="row"
                              style={{
                                fontSize: "100%",
                                padding: "0.7%",
                                backgroundColor: colors.primary[400],
                                borderRight: '1px solid #333'
                              }}
                              key={index}
                            >
                              {index === 1 ? (
                                <a
                                  href={`/incident-details/${bu}/${firstIndexValue}`}
                                  target="_blank"
                                  style={{ color: "white" }}
                                >
                                  {iter}
                                </a>
                              ) : (
                                iter
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </Grid>
            )}

            <Accordion
              defaultExpanded
              style={{ fontSize: "100%", fontWeight: "bold" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Total Outages, System Reported, Customer Reported (MoM and QoQ
                View)
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  spacing={2}
                  align="center"
                  justifyContent="space-around"
                  alignItems="center"
                  padding={2}
                >
                  <Grid
                    item
                    xs={"auto"}
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" align="center">
                      Total Outages, System Reported, Customer Reported(MoM)
                    </Typography>
                    <CustomizedChartSysVsCusMoM
                      data={PAndETotalSelfinducedCustomerreportedOutages}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={"auto"}
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" align="center">
                      Total Outages, System Reported, Customer Reported(QoQ)
                    </Typography>
                    <CustomizedChartSysVsCusQoQ
                      data={
                        PAndETotalSelfinducedCustomerreportedOutagesQuarterly
                      }
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              defaultExpanded
              style={{ fontSize: "100%", fontWeight: "bold" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Total Outages, Same BU and Other BU (MoM and QoQ View)
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  spacing={2}
                  align="center"
                  justifyContent="space-around"
                  alignItems="center"
                  padding={2}
                >
                  <Grid
                    item
                    xs={"auto"}
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" align="center">
                      Total Outages, Same BU and Other BU(MoM)
                    </Typography>
                    <CustomizedChartBuVsOtherMoM data={PAndETotalOutages} />
                  </Grid>

                  <Grid
                    item
                    xs={"auto"}
                    justifyContent="space-evenly"
                    sx={{
                      backgroundColor: colors.primary[400],
                      borderRadius: 5
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" align="center">
                      Total Outages, Same BU and Other BU(QoQ)
                    </Typography>
                    <CustomizedChartBuVsOtherQoQ
                      data={PAndETotalOutagesQuarterly}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12} sx={{ borderRadius: 5, padding: 2 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              paddingTop="10px"
              align="left"
            >
              MTTD
            </Typography>
          </Grid>

          <Accordion
            defaultExpanded
            style={{ fontSize: "100%", fontWeight: "bold" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              MTTD (Including and Excluding Own BU)
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
                align="center"
                justifyContent="space-around"
                alignItems="center"
                padding={2}
              >
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    MTTD (For Own BU)(MoM)
                  </Typography>
                  <CustomizedChartWithTTd data={PAndEMttdWithPlatforms} />
                </Grid>
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    MTTD (For Own BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithTTdQuarter
                    data={PAndEMttdWithPlatformsQuarterly}
                  />
                </Grid>
                <Grid item xs={12} sx={{ borderRadius: 5, padding: 2 }}></Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    MTTD (For Other BU)(MoM)
                  </Typography>
                  <CustomizedChartWithoutTTd data={PAndEMttdWithoutPlatforms} />
                </Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    MTTD (For Other BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithoutTTdQuarter
                    data={PAndEMttdWithoutPlatformsQuarterly}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 3rd row */}

          <Grid item xs={12} sx={{ borderRadius: 5, padding: 2 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              paddingTop="10px"
              align="left"
            >
              MTTR
            </Typography>
          </Grid>

          {/* <button class="btn btn-primary" type="button" data-coreui-toggle="collapse" data-coreui-target=".multi-collapse" aria-expanded="false" aria-controls="multiCollapseExample1">Toggle both elements</button> */}
          <Accordion
            defaultExpanded
            style={{ fontSize: "100%", fontWeight: "bold" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              P0 MTTR (Including and Excluding Own BU)
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
                align="center"
                justifyContent="space-around"
                alignItems="center"
                padding={2}
              >
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P0 MTTR (For Own BU)(MoM)
                  </Typography>
                  <CustomizedChartWithTTr data={PAndEP0MttrWithPlatforms} />
                </Grid>
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P0 MTTR (For Own BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithTTrQuarter
                    data={PAndEP0MttrWithPlatformsQuarterly}
                  />
                </Grid>
                <Grid item xs={12} sx={{ borderRadius: 5, padding: 2 }}></Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P0 MTTR (For Other BU)(MoM)
                  </Typography>
                  <CustomizedChartWithoutTTr
                    data={PAndEP0MttrWithoutPlatforms}
                  />
                </Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P0 MTTR (For Other BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithoutTTrQuarter
                    data={PAndEP0MttrWithoutPlatformsQuarterly}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion
            defaultExpanded
            style={{ fontSize: "100%", fontWeight: "bold" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              P1 MTTR (Including and Excluding Own BU)
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                container
                spacing={2}
                align="center"
                justifyContent="space-around"
                alignItems="center"
                padding={2}
              >
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P1 MTTR (For Own BU)(MoM)
                  </Typography>
                  <CustomizedChartWithTTr data={PAndEP1MttrWithPlatforms} />
                </Grid>
                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P1 MTTR (For Own BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithTTrQuarter
                    data={PAndEP1MttrWithPlatformsQuarterly}
                  />
                </Grid>
                <Grid item xs={12} sx={{ borderRadius: 5, padding: 2 }}></Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P1 MTTR (For Other BU)(MoM)
                  </Typography>
                  <CustomizedChartWithoutTTr
                    data={PAndEP1MttrWithoutPlatforms}
                  />
                </Grid>

                <Grid
                  item
                  xs={"auto"}
                  justifyContent="space-evenly"
                  sx={{ backgroundColor: colors.primary[400], borderRadius: 5 }}
                >
                  <Typography variant="h5" fontWeight="bold" align="center">
                    P1 MTTR (For Other BU)(QoQ)
                  </Typography>
                  <CustomizedChartWithoutTTrQuarter
                    data={PAndEP1MttrWithoutPlatformsQuarterly}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion
            defaultExpanded
            style={{ fontSize: "100%", fontWeight: "bold" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              RELIABILITY OKR's
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                item
                xs={"auto"}
                sx={{ borderRadius: 5 }}
                alignItems="left"
                padding={2}
              >
                <BarChart
                  class="flex"
                  xAxis={[
                    {
                      scaleType: "band",
                      data: [
                        "No of outages",
                        "MTTD [in mins]",
                        "MTTR(P0) [in mins]",
                        "MTTR(P1) [in mins]",
                        "80% of incidents to be system detected"
                      ]
                    }
                  ]}
                  series={[
                    // {samplePeData.map((k, data) => {data: d, label: k})}

                    {
                      data: Object.keys(PAndEOKRComparison).map(
                        (k, v) => PAndEOKRComparison[k].baseline
                      ),
                      label: "Target"
                    },
                    {
                      data: Object.keys(PAndEOKRComparison).map(
                        (k, v) => PAndEOKRComparison[k].value
                      ),
                      label: "Actual - " + quarter.slice(0, 2)
                    }
                  ]}
                  width={1150}
                  height={350}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Grid container>
          <Grid container alignItems="center" justifyContent="space-between" padding="0px 00px">
  <Grid item xs={7}>
    <Typography variant="h4" fontWeight="bold" paddingLeft="3%">
      AVAILABILITY
    </Typography>
    <br />
    <Typography variant="h6" paddingLeft="3%">
      (Note: Only P0 incidents including third party incidents where status page is updated are considered in availability calculation.)
    </Typography>
  </Grid>

  <Grid item xs="auto" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, paddingRight: '20px' }}>
    {/* Month Filter Box */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
        maxWidth: '300px',
        minWidth: '150px',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1B1D2A',
          color: '#1E6DFF',
          padding: '0px 12px',
          borderRadius: '4px 0 0 4px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        Month
      </Box>
      <FormControl
        variant="outlined"
        sx={{
          flex: 1,
          backgroundColor: '#101012',
          borderRadius: '0 4px 4px 0',
          height: '100%',
          '& .MuiOutlinedInput-root': {
            height: '100%',
            padding: '0 10px',
            borderRadius: '0 4px 4px 0',
            '&.Mui-focused': {
              boxShadow: 'none',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSvgIcon-root': {
            color: '#fff',
          },
        }}
      >
        <Select
          labelId="month-label"
          id="months"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          variant="outlined"
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#1B1D2A',
                color: '#fff',
                '& .MuiMenuItem-root': {
                  '&.Mui-selected': {
                    backgroundColor: '#1E6DFF',
                  },
                  '&:hover': {
                    backgroundColor: '#1E6DFF',
                  },
                },
              },
            },
          }}
          sx={{
            color: '#fff',
            backgroundColor: '#101012',
            '& .MuiSelect-outlined': {
              padding: '8px 12px',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          {monthDct.map((option) => (
            <MenuItem key={option.value} value={option.value} defaultValue="May">
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    {/* Year Filter Box */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: colors.grey[900],
        borderRadius: 1,
        height: '38px',
        maxWidth: '300px',
        minWidth: '150px',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1B1D2A',
          color: '#1E6DFF',
          padding: '0px 12px',
          borderRadius: '4px 0 0 4px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        Year
      </Box>
      <FormControl
        variant="outlined"
        sx={{
          flex: 1,
          backgroundColor: '#101012',
          borderRadius: '0 4px 4px 0',
          height: '100%',
          '& .MuiOutlinedInput-root': {
            height: '100%',
            padding: '0 10px',
            borderRadius: '0 4px 4px 0',
            '&.Mui-focused': {
              boxShadow: 'none',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '& .MuiSvgIcon-root': {
            color: '#fff',
          },
        }}
      >
        <Select
          labelId="year-label"
          id="years"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          variant="outlined"
          fullWidth
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#1B1D2A',
                color: '#fff',
                '& .MuiMenuItem-root': {
                  '&.Mui-selected': {
                    backgroundColor: '#1E6DFF',
                  },
                  '&:hover': {
                    backgroundColor: '#1E6DFF',
                  },
                },
              },
            },
          }}
          sx={{
            color: '#fff',
            backgroundColor: '#101012',
            '& .MuiSelect-outlined': {
              padding: '8px 12px',
            },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          {yearDct.map((option) => (
            <MenuItem key={option.value} value={option.value} defaultValue="2024">
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  </Grid>
</Grid>


            <Grid
              item
              xs={12}
              sx={{ borderRadius: 5 }}
              alignItems="left"
              padding={2}
            >
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow
                      style={{
                        backgroundColor: colors.blueAccent[800],
                        border: "1px solid rgb(0, 0, 0)"
                      }}
                    >
                      <TableCell style={{ fontSize: "100%" }}>
                        Products
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%" }}>
                        IN&nbsp;(%)
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%" }}>
                        AU&nbsp;(%)
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%" }}>
                        US&nbsp;(%)
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: "100%" }}>
                        EU&nbsp;(%)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(PAndEAvailabilityMonthly).map((row, value) => (
                      <>
                        <TableRow
                          key={row}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 }
                          }}
                        ></TableRow>
                        <TableCell
                          component="th"
                          scope="row"
                          style={{
                            backgroundColor: colors.primary[400],

                            fontSize: "100%",
                            border: "1px solid rgb(0, 0, 0)"
                          }}
                        >
                          {row}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            backgroundColor:
                              PAndEAvailabilityMonthly[row].IN.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "lightgreen"
                                : "red",
                            color:
                              PAndEAvailabilityMonthly[row].IN.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "black"
                                : "white",
                            fontSize: "100%",
                            border: "1px solid rgb(0, 0, 0)"
                          }}
                        >
                          {PAndEAvailabilityMonthly[row].IN.map(
                            (d) => d.availability_percentage
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            backgroundColor:
                              PAndEAvailabilityMonthly[row].AU.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "lightgreen"
                                : "red",
                            color:
                              PAndEAvailabilityMonthly[row].AU.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "black"
                                : "white",
                            fontSize: "100%",
                            border: "1px solid rgb(0, 0, 0)"
                          }}
                        >
                          {PAndEAvailabilityMonthly[row].AU.map(
                            (d) => d.availability_percentage
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            backgroundColor:
                              PAndEAvailabilityMonthly[row].US.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "lightgreen"
                                : "red",
                            color:
                              PAndEAvailabilityMonthly[row].US.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "black"
                                : "white",
                            fontSize: "100%",
                            border: "1px solid rgb(0, 0, 0)"
                          }}
                        >
                          {PAndEAvailabilityMonthly[row].US.map(
                            (d) => d.availability_percentage
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          style={{
                            backgroundColor:
                              PAndEAvailabilityMonthly[row].EU.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "lightgreen"
                                : "red",
                            border: "1px solid rgb(0, 0, 0)",
                            color:
                              PAndEAvailabilityMonthly[row].EU.map(
                                (d) => d.availability_percentage
                              ) >= 99.8
                                ? "black"
                                : "white",
                            fontSize: "100%"
                          }}
                        >
                          {PAndEAvailabilityMonthly[row].EU.map(
                            (d) => d.availability_percentage
                          )}
                        </TableCell>
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PAndE2;
