import React, { useContext, useEffect } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { Box, Button } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

const Login = () => {

    const isAuthenticated = useIsAuthenticated()

    const { userInfo, updateUserInfo } = useContext(UserContext)
    const { accounts, instance } = useMsal();
    const graphEndpoint = "https://graph.microsoft.com/v1.0";
    const tokenRequest = {
        scopes: ["user.read", "Group.Read.All"],
        account: accounts[0]
    };



    const handleLogin = async () => {
        try {
            const login_resp = await instance.loginPopup(loginRequest)
           
        }
        catch (error) {
            console.log('Login error:', error);
        };
    };

    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = "/";
        }
    }, [isAuthenticated])


    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: '200px',
                paddingRight: '250px'
            }}
        >
            <h1>Login</h1>
            <Button variant="contained" color="primary" onClick={handleLogin} sx={{ backgroundColor: "blueviolet" }}>
                Login with Freshworks SSO
            </Button>
        </Box>
    );
}

export default Login;