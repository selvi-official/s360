import { InteractionType } from "@azure/msal-browser"
import { useMsal, useMsalAuthentication } from "@azure/msal-react"
import { Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { loginRequest } from "./authConfig"
import { UserContext } from "./UserContext"



// const adminGrpId = "5703acc4-9870-4113-9fe2-17ca6034087b"; // replace with your admin group ID
// const readOnlyGrpId = "56167dfc-31b3-40c3-869e-c9620153bd1a"




const UserProfile = () => {

    const { userInfo } = useContext(UserContext)



    return (

        <>
            Name:  {userInfo.name}
            <br/>
            Role:  {userInfo.role}
        </>
    )


}

export default UserProfile