import React, { useContext, useEffect, useState } from "react";
import { SelectedBUContext } from "./BUcontext";
import { UserContext } from "./UserContext";
import { appConfig } from "./appConfig";

export const useBUMenuOptions = () => {
    const [BUs, setBUs] = useState([]);
    const { userInfo } = useContext(UserContext)
    const {selectedBU, updateBU} = useContext(SelectedBUContext)
    useEffect(() => {
        const fetchBUs = async () => {
            try {
                const response = await fetch(appConfig.backend_Api_Url + '/v2/getBu');
                const data = await response.json();

                if(userInfo.role === 'admin')  { 
                    setBUs([...data]) 
                //     if(selectedBU === '') updateBU('All') 
                    
                //  }else
                if(userInfo.role === 'CRM')  { 
                    setBUs(['CRM']) 
                    updateBU('CRM')
                 } else if(userInfo.role === 'CX')  { 
                    setBUs(['CX']) 
                    updateBU('CX')
                 } else if(userInfo.role === 'IT')  { 
                    setBUs(['IT']) 
                    updateBU('IT')
                 } else if(userInfo.role === 'Platform')  { 
                    setBUs(['Platform'])
                    updateBU('Platform')
                 } else if(userInfo.role === 'Cloud Engg')  { 
                    setBUs(['Cloud engineering']) 
                    updateBU('Cloud engineering')
                 } else if (userInfo.role === 'OtherBUs') {
                    setBUs(['Others']);
                    updateBU('Others')
                 }

            } }catch (error) {
                console.error(error);
            }
        };

        fetchBUs();
    }, [userInfo]);

    return BUs;
};





export const useUserOptions = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(appConfig.backend_Api_Url + `/users`);
                const data = await response.json()
                setUsers(Object.keys(data))
            } catch (error) {
                console.error(error)
            }
        };
        fetchUsers();
    }, [])
    // console.log( users )

    return users;
}
