import React from "react";

const AiIcon = ({
  width = "24px",
  height = "24px",
  fill = "white",
  style = {},
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="-5.0 -10.0 110.0 135.0"
    width={width}
    height={height}
    style={{ width, height, ...style }} // Apply the style prop
    {...props} // Spread the props to allow custom styling
  >
    <g fill={fill}>
      <path d="m41.543 23.238 2.5078 6.9688c2.7891 7.7344 8.8789 13.824 16.613 16.613l6.9688 2.5078c0.62891 0.22656 0.62891 1.1172 0 1.3438l-6.9688 2.5078c-7.7344 2.7891-13.824 8.8789-16.613 16.613l-2.5078 6.9688c-0.22656 0.62891-1.1172 0.62891-1.3438 0l-2.5078-6.9688c-2.7891-7.7344-8.8789-13.824-16.613-16.613l-6.9688-2.5078c-0.62891-0.22656-0.62891-1.1172 0-1.3438l6.9688-2.5078c7.7344-2.7891 13.824-8.8789 16.613-16.613l2.5078-6.9688c0.22656-0.63281 1.1172-0.63281 1.3438 0z" />
      <path d="m72.914 6.4922 1.2734 3.5273c1.4141 3.9141 4.4961 7 8.4141 8.4141l3.5273 1.2734c0.32031 0.11719 0.32031 0.56641 0 0.67969l-3.5273 1.2734c-3.9141 1.4141-7 4.4961-8.4141 8.4141l-1.2734 3.5273c-0.11719 0.32031-0.56641 0.32031-0.67969 0l-1.2734-3.5273c-1.4141-3.9141-4.4961-7-8.4141-8.4141l-3.5273-1.2734c-0.32031-0.11719-0.32031-0.56641 0-0.67969l3.5273-1.2734c3.9141-1.4141 7-4.4961 8.4141-8.4141l1.2734-3.5273c0.11328-0.32422 0.56641-0.32422 0.67969 0z" />
      <path d="m72.914 66.406 1.2734 3.5273c1.4141 3.9141 4.4961 7 8.4141 8.4141l3.5273 1.2734c0.32031 0.11719 0.32031 0.56641 0 0.67969l-3.5273 1.2734c-3.9141 1.4141-7 4.4961-8.4141 8.4141l-1.2734 3.5273c-0.11719 0.32031-0.56641 0.32031-0.67969 0l-1.2734-3.5273c-1.4141-3.9141-4.4961-7-8.4141-8.4141l-3.5273-1.2734c-0.32031-0.11719-0.32031-0.56641 0-0.67969l3.5273-1.2734c3.9141-1.4141 7-4.4961 8.4141-8.4141l1.2734-3.5273c0.11328-0.32031 0.56641-0.32031 0.67969 0z" />
    </g>
  </svg>
);

export default AiIcon;
