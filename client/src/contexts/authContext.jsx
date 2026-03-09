import { createContext, useReducer,useEffect} from 'react';
import { AuthReducer } from '../reducer/authReducer';
import axios from 'axios';
import {
    apiURL,
    LOCAL_STORAGE_TOKEN_NAME,
    SET_AUTH} from '../utils/VariableName';
import SetAuthToken from '../utils/SetAuthToken';

export const AuthContext = createContext();

const AuthContextProvider = ({children}) => {
    const [authState,dispatch] = useReducer(AuthReducer, {
        authLoading: true,
        isAuthenticated: false,
        user: null
    });

    const loadUser = async () => {
        if(localStorage[LOCAL_STORAGE_TOKEN_NAME]) {
            SetAuthToken(localStorage[LOCAL_STORAGE_TOKEN_NAME]);
        }

        try {
            const response = await axios.get(`${apiURL}/auth`);
            // console.log(response.data.payload);
            if(response.data.success) {
                dispatch({type: SET_AUTH, payload: {
                    isAuthenticated: true, 
                    user: response.data.payload
                }});
            }
        } catch(error) {
            localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
            SetAuthToken(null);
            dispatch({type: SET_AUTH, payload: {
                isAuthenticated: false,
                user: null
            }});
        }
    };

    useEffect(() => {
        loadUser()
    },[]);

    const loginUser = async userForm => {
        try {
            const response = await axios.post(`${apiURL}/auth/login`,userForm);

            if(response.data.success) {
                localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME,response.data.payload);
            }

            await loadUser();

            return response.data;
        } catch (error) {
            if(error.response.data) {
                return error.response.data;
            } else return {
                success: false, 
                message: error.message
            };
        }
    };

    const registerUser = async userForm => {
        try {
            const response = await axios.post(`${apiURL}/auth/register`,userForm);
            if(response.data.success) {
                // console.log(LOCAL_STORAGE_TOKEN_NAME,response.data.payload);
                localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME,response.data.payload);
            }

            await loadUser();

            return response.data;
        } catch (error) {
            if(error.response.data) {
                return error.response.data;
            } else return {
                success: false, 
                message: error.message
            };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
        dispatch({type: SET_AUTH, payload: {
            isAuthenticated: false,
            user: null
        }});
    };

    const authContextData = {
        loginUser, 
        logoutUser, 
        registerUser,
        authState
    };

    return (
        <AuthContext.Provider value={authContextData}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;