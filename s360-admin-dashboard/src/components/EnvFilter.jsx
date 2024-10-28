import React, { useContext, useState } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { CustomFilter } from "./CustomFilter";
import { SelectedEnvContext } from "../EnvContext";

export const EnvFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { selectedEnv, updateEnv } = useContext(SelectedEnvContext);



  return (
    <CustomFilter
      label="Env"
      value={selectedEnv}
      options={["Production", "Staging"]}
      onChange={(e) => updateEnv(e.target.value)}
      isSearchable={false}
    />
  );
};
