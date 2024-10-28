import { Box, CircularProgress, Grid, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

const PillarStatBox = ({ title, icon, sla_missed, sla_nearing, in_sla, isLoading = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Grid container
      // spacing={2}
      // display='flex'
      // flexDirection='column'
      justifyContent="space-around"
      alignItems="center"
      padding="30px 10px"
      borderRadius={3}
      // zeroMinWidth={false}
      bgcolor={colors.primary[400]}
    >
      {/* pillar name and logo */}
      <Grid item xs={3} display='flex' flexDirection='column' alignItems="center" padding={1}>
        {icon}
        <Typography align="center" variant="h4" fontWeight="bold" sx={{ color: colors.grey[100] }}>
          {title}
        </Typography>
      </Grid>

      {/* stats */}
      <Grid item xs={8} >
        <Grid container justifyContent='space-around'>
          <Grid item xs='auto' display='flex' flexDirection='column' textAlign="center" padding={1}>
            {isLoading ? (
              <CircularProgress color="secondary"  />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ color: colors.grey[100] }}>
                {sla_missed}
              </Typography>
            )}
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.redAccent[400] }}>
              SLA Missed
            </Typography>
          </Grid>
          <Grid item xs='auto' display='flex' flexDirection='column' textAlign="center" padding={1}>
            {isLoading ? (
              <CircularProgress color="secondary" />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ color: colors.grey[100] }}>
                {sla_nearing}
              </Typography>
            )}
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.blueAccent[400] }}>
              Approaching SLA
            </Typography>
          </Grid>
          <Grid item xs='auto' display='flex' flexDirection='column' textAlign="center" padding={1}>
            {isLoading ? (
              <CircularProgress color="secondary" />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ color: colors.grey[100] }}>
                {in_sla}
              </Typography>
            )}
            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.greenAccent[400] }}>
              In SLA
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  );
};

export default PillarStatBox;
