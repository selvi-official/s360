import { Typography } from '@mui/material';
import React from 'react';

const CustomTitle = ({ variant, title, ...props }) => {
  return (
	<Typography variant={variant} {...props}>
	  {title}
	</Typography>
  );
};

export default CustomTitle;