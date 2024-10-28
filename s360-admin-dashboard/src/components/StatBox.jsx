import {
  Grid,
  Typography,
  useTheme,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
} from "@mui/material";
import { tokens } from "../theme";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { Link } from "react-router-dom";

export const OKRComparisionWithPrevQuarter = ({
  value,
  title,
  currentQuarterValue,
  previousQuarterValue,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const renderStatus = (value) => {
    if (value > 0 || isNaN(value)) {
      return (
        <Grid display="flex" flexDirection="column">
          <Grid display="flex" flexDirection="row" justifyContent="center">
            <KeyboardDoubleArrowUpIcon
              style={{
                color: colors.redAccent[600],
                alignSelf: "center",
                fontSize: "60px",
                fontWeight: "bolder",
              }}
            />
            <Typography
              fontWeight="bold"
              fontSize="75px"
              color={colors.redAccent[600]}
              textAlign="center"
            >
              {isNaN(value) ? "NA" : Math.abs(value) + " %"}
            </Typography>
          </Grid>

          <Grid
            display="flex"
            flexDirection="row"
            justifyContent="space-around"
          >
            <Typography
              fontWeight="bold"
              fontSize="20px"
              color={colors.blueAccent[500]}
              textAlign="center"
            >
              prev: {previousQuarterValue}
            </Typography>
            <Typography
              fontWeight="bold"
              fontSize="20px"
              color={colors.redAccent[500]}
              textAlign="center"
            >
              curr: {currentQuarterValue}
            </Typography>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid display="flex" flexDirection="column">
          <Grid display="flex" flexDirection="row" justifyContent="center">
            <KeyboardDoubleArrowDownIcon
              style={{
                color: colors.greenAccent[600],
                alignSelf: "center",
                fontSize: "60px",
                fontWeight: "bolder",
              }}
            />
            <Typography
              fontWeight="bold"
              fontSize="75px"
              color={colors.greenAccent[600]}
              textAlign="center"
            >
              {Math.abs(value) + " %"}
            </Typography>
          </Grid>

          <Grid
            display="flex"
            flexDirection="row"
            justifyContent="space-around"
          >
            <Typography
              fontWeight="bold"
              fontSize="20px"
              color={colors.blueAccent[500]}
              textAlign="center"
            >
              prev: {previousQuarterValue}
            </Typography>
            <Typography
              fontWeight="bold"
              fontSize="20px"
              color={colors.greenAccent[500]}
              textAlign="center"
            >
              curr: {currentQuarterValue}
            </Typography>
          </Grid>
        </Grid>
      );
    }
  };
  return (
    <Grid display="flex" flexDirection="column">
      <Typography
        fontWeight="bold"
        fontSize="20px"
        color={colors.blueAccent[100]}
        textAlign="center"
      >
        {title}
      </Typography>

      {renderStatus(parseFloat(value).toFixed(2))}
    </Grid>
  );
};

export const SimpleStatBox = ({ value, title }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Grid display="flex" flexDirection="column">
      <Typography
        fontWeight="bold"
        fontSize="20px"
        color={colors.blueAccent[100]}
        textAlign="center"
      >
        {title}
      </Typography>
      <Typography
        fontWeight="bold"
        fontSize="40px"
        color={colors.blueAccent[100]}
        textAlign="center"
      >
        {value}
      </Typography>
    </Grid>
  );
};

// export const WAFPillarStatCard = ({
//   id,
//   title,
//   value,
//   totalCount,
//   to,
//   activeId,
//   handleCardClick,
// }) => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const isActive = id === activeId;

//   return (
//     <Card
//       sx={{
//         backgroundColor: isActive
//           ? colors.blueAccent[600]
//           : colors.primary[400],
//         // cursor: 'pointer'
//       }}
//       onClick={() => {
//         handleCardClick(id);
//       }}
//     >
//       <CardActionArea>
//         <CardContent>
//           <Grid
//             container
//             flexDirection="column"
//             // alignItems="center"
//             // justifyItems="center"
//             height={100}
//             minWidth={220}
//           >
//             <Grid item>
//               <Typography variant="h3" fontWeight="bold">
//                 {title}
//               </Typography>
//             </Grid>
//             <Grid container justifyContent="space-between" >
//               <Grid item display="flex" flexDirection="column">
//                 <Typography
//                   variant="h2"
//                   color={colors.redAccent[400]}
//                   paddingLeft={1}
//                 >
//                   {value}
//                 </Typography>
//                 <Typography variant="body2">Failed </Typography>
//               </Grid>
//               <Grid item display="flex" flexDirection="column">
//                 <Typography variant="h2" paddingLeft={0.5}>
//                   {totalCount}
//                 </Typography>
//                 <Typography variant="body2">Total </Typography>
//               </Grid>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </CardActionArea>
//     </Card>
//   );
// };
