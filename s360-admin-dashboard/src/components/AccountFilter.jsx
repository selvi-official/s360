import React, { useContext, useEffect, useState } from "react";
import { SelectedAccountContext } from "../accountContext";
import {
  Autocomplete,
  FormControl,
  Grid,
  Paper,
  TextField,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme";
import { fetchAccountList } from "../util/HelperFunctions";
import { SelectedBUContext } from "../BUcontext";
import { SelectedProductContext } from "../productcontext";
import { CustomFilter } from "./CustomFilter";
import { SelectedEnvContext } from "../EnvContext";

export const AccountFilter = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedBU } = useContext(SelectedBUContext);
  const { selectedProduct } = useContext(SelectedProductContext);

  const { selectedEnv } = useContext(SelectedEnvContext);

  const { selectedAccount, updateAccount } = useContext(SelectedAccountContext);
  const [accountList, setAccountList] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      let data = [];
      if (selectedBU !== null && selectedProduct !== null) {
        data = await fetchAccountList(selectedBU, selectedProduct);
        const data_env = data.filter(
          (item) => item.environment === selectedEnv
        );

        var sortedList = data_env.sort((a, b) =>
          a.account.localeCompare(b.account)
        );
        if (sortedList.length > 1) {
          sortedList = [
            { account: "All", accountid: "All", environment: selectedEnv },
            ...sortedList,
          ]
          setAccountList(sortedList)
        } else {
          setAccountList(sortedList);
        }
        if (!sortedList.find((item) => item.accountid === selectedAccount)) {
          updateAccount(sortedList[0]?.accountid);
        }
      } else {
        updateAccount(null);
      }
    };
    fetchAccounts();
  }, [selectedBU, selectedProduct, selectedEnv]);

  const [selectedOption, setSelectedOption] = useState({
    account: "All",
    accountid: "All",
  });

  useEffect(() => {
    if (accountList.length > 0) {
      const foundAccount = accountList.find(
        (option) => option.accountid === selectedAccount
      );
      setSelectedOption(foundAccount || accountList[0]);
    } else {
      setSelectedOption(null);
    }
  }, [accountList, selectedAccount]);

  return (
    <CustomFilter
      label="Account"
      value={selectedOption}
      options={accountList}
      onChange={(value) =>
        value && value.accountid
          ? updateAccount(value.accountid)
          : updateAccount(null)
      }
      isSearchable={true}
      getOptionLabel={(option) =>
        option && option.account ? option.account : null
      }
      isOptionEqualToValue={(option, value) => option.account === value.account}
    />

    // <Grid minWidth={250}>
    //   <FormControl
    //     variant="outlined"
    //     sx={{
    //       minWidth: 200,
    //       maxWidth: 300,
    //       // color: colors.grey[100],
    //       backgroundColor: colors.primary[400],
    //       borderRadius: 2,
    //       padding: 0.3,
    //     }}
    //   >
    //     <Autocomplete
    //       value={selectedOption}
    //       onChange={(event, value) =>
    //         value ? updateAccount(value.accountid) : updateAccount(null)
    //       }
    //       options={accountList}
    //       getOptionLabel={(option) =>
    //         option && option.account ? option.account : null
    //       } // Display account in the UI
    //       //   getOptionSelected={(option, value) => option === value}
    //       blurOnSelect
    //       renderInput={(params) => (
    //         <TextField
    //           {...params}
    //           label="Account"
    //           InputLabelProps={{
    //             style: { fontSize: "20px" }, // Adjust font size as needed
    //           }}
    //         />
    //       )}
    //       PaperComponent={({ children }) => (
    //         <Paper
    //           style={{
    //             // marginLeft: -50,
    //             // width: 250,
    //             backgroundColor: colors.blueAccent[800],
    //           }}
    //         >
    //           {children}
    //         </Paper>
    //       )}
    //     />
    //   </FormControl>
    // </Grid>
  );
};
