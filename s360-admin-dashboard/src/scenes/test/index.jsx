import { Autocomplete, Grid, Paper, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
// import ReactSelect from "react-select";

const MyGraph = ({ testdata }) => {
  const graph = {
    nodes: [
      { id: 1, account: "No1", title: "node 1" },
      { id: 2, account: "Nodeasdfd 2", title: "node 2" },
      { id: 3, account: "Nodeasfa 3", title: "node 3" },
      { id: 4, account: "Nodeasda 4", title: "node 4" },
      { id: 5, account: "Nodeasfdaasfasdfasdaas 5", title: "node 5" },
    ],
    edges: [
      { from: 1, to: 2, title: "edge1" },
      { from: 1, to: 3 },
      { from: 5, to: 4 },
      { from: 2, to: 6 },
    ],
  };

  const data1 = ["abc", "def", "ghi", "jkl", "mnopqrstuv"];

  const [val, setVal] = useState("Node 1");
  const [width, setWidth] = useState(100);
  useEffect(() => {
    // handleWidth(val);
    if (textRef.current) {
      setWidth(textRef.current.offsetWidth +80); // Add some padding
    }
  }, [val]);

  const textRef = useRef(null);

  const options = data1.map((value) => ({ value, label: value }));

  const handleWidth = (val) => {
    const minWidth = 100;
    const width = Math.max(minWidth, val.length * 10);
    setWidth(width);
  };
  return (
    <>
      <Grid container xs={4}>
        {/* <ReactSelect 
  styles={{ width: "200px" }}
  options={options}
  // value={val}
  isSearchable={false}
  // formatOptionLabel={(option) => (option.account)}
  // getOptionValue={(option) => option.title}
  onChange={(e) => setVal(e.value)}
  /> */}
        <Autocomplete
          options={graph.nodes}
          value={val}
          getOptionLabel={(option) => option.account ?? option}
          onChange={(e, value) => setVal(value.account)}
          // onInputChange={(e, value) => handleWidth(value)}
          // isOptionEqualToValue={(option, value) => {console.log(option, value) ; return option.account === value.account}}
          blurOnSelect
          disableClearable
          renderInput={(params) => (
            <TextField  {...params} sx={{ width: `${width}px` }} 
            InputProps={{      
              ...params.InputProps,      
              endAdornment: (      
                <>      
                  {params.InputProps.endAdornment}      
                  <span      
                    ref={textRef}      
                    style={{      
                      position: 'absolute',      
                      visibility: 'hidden',      
                      whiteSpace: 'nowrap',      
                           
                    }}      
                  >      
                    {val}      
                  </span>      
                </>      
              ),      
            }}      
            />
          )}
          PaperComponent={({ children }) => (
            <Paper
              style={{
                marginLeft: 0,
                minWidth: "auto",
                // width: 250,
                // width: 200,
                backgroundColor: "skyblue",
              }}
            >
              {children}
            </Paper>
          )}
        />
      </Grid>
    </>
  );
};

export default MyGraph;
