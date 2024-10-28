import { Box, Button, Typography, useTheme } from '@mui/material'
import React from 'react'
import { tokens } from '../theme';

export const CustomButton = ({icon, Title, onClick}) => {
    const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: colors.primary[400],
              maxHeight: 40,
              borderRadius: 0,
              padding: 0,
            }}
          >
            <Button
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                background: "rgba(39,60,162,0.2)",
                color: "#fff !important",
                borderRadius: "4",
                height: "100%",
              }}
              onClick={onClick}
            >
              {icon}
              <Typography
                sx={{
                  marginInline: 1,
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  textTransform: "none",
                //   fontSize: "14px",
                }}
              >
                {Title}
              </Typography>
            </Button>
          </Box>
  )
}

