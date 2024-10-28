import { useMsal } from "@azure/msal-react";
import React, { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
  });

  const updateUserInfo = (user) => {
    setUserInfo(user);
  };

  return (
    <UserContext.Provider
      value={{ userInfo: userInfo, updateUserInfo: updateUserInfo }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const SetUserContext = ({ setIsUserSet }) => {
  const { accounts, instance } = useMsal();
  const { userInfo, updateUserInfo } = useContext(UserContext);

  const graphEndpoint = "https://graph.microsoft.com/v1.0";
  const tokenRequest = {
    scopes: ["user.read", "Group.Read.All"],
    account: accounts[0],
  };
  const fetchGroupNames = async () => {
    const token_response = await instance.acquireTokenSilent(tokenRequest);
    const token = token_response.accessToken;

    const headers = new Headers();
    const bearer = `Bearer ${token}`;
    headers.append("Authorization", bearer);
    const options = {
      method: "GET",
      headers: headers,
    };

    const endpoint = `${graphEndpoint}/me/memberOf`;
    let groups = [];
    let nextLink = endpoint;

    while (nextLink) {
      try {
        const response = await fetch(nextLink, options);
        const data = await response.json();

        groups = groups.concat(data.value.map((grp) => grp.displayName));
        // console.log("groups", groups);
        nextLink = data["@odata.nextLink"] || null;
      } catch (error) {
        console.error("Error fetching groups:", error);
        break;
      }
    }

    return groups;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      // const groupNames = await fetchGroupNames();
      // console.log(groupNames);

      // if (groupNames.includes("sso-service360-admins")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "admin",
      //   });
      // } else if (groupNames.includes("sso-service360-CRM")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "CRM",
      //   });
      // } else if (groupNames.includes("sso-service360-CX")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "CX",
      //   });
      // } else if (groupNames.includes("sso-service360-IT")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "IT",
      //   });
      // } else if (groupNames.includes("sso-service360-Platform")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "Platform",
      //   });
      // } else if (groupNames.includes("sso-service360-CloudEngg")) {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "Cloud Engg",
      //   });
      // } else {
      //   updateUserInfo({
      //     name: accounts[0].name,
      //     role: "OtherBUs",
      //   });
      // }
      updateUserInfo({
        name: accounts[0].name,
        role: "admin",
      });
    };
    fetchUserInfo().then(() => {
      setIsUserSet(true);
    });
  }, [instance]);

  return null;
};
