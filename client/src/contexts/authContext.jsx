import { createContext,useEffect, useMemo} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    apiURL,
    LOCAL_STORAGE_TOKEN_NAME
} from '../utils/VariableName';
import SetAuthToken from '../utils/SetAuthToken';

export const AuthContext = createContext();

const AuthContextProvider = ({children}) => {
    const queryClient = useQueryClient();
    
    const loadUser = async () => {
        const token = localStorage[LOCAL_STORAGE_TOKEN_NAME];
        
        if(!token) {
            return null;
        }
        
        SetAuthToken(token);
        const response = await axios.get(`${apiURL}/auth`);
        return response.data.payload;        
    };
    
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['authUser'],
        queryFn: loadUser,
        retry: false,
        staleTime: Infinity
    });
    
    useEffect(() => {
        if(isError) {
            localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
            SetAuthToken(null);
            queryClient.setQueryData(['authUser'], null);
        }
    }, [isError]);

    const loginMutation = useMutation({
        mutationFn: (userForm) => axios.post(`${apiURL}/auth/login`, userForm),
        onSuccess: (response) => {
            if(response.data.success) {
                localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME, response.data.payload);
                queryClient.invalidateQueries({ queryKey: ['authUser'] });
            }
        }
    });
    
    const loginUser = async userForm => {
        try {
            const response = await loginMutation.mutateAsync(userForm);
            return response.data;
        } catch (error) {
            return error.response?.data || {
                success: false, 
                message: error.message
            };
        }
    };

    const registerMutation = useMutation({
        mutationFn: (userForm) => axios.post(`${apiURL}/auth/register`, userForm),
        onSuccess: (response) => {
            if(response.data.success) {
                localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME, response.data.payload);
                queryClient.invalidateQueries({ queryKey: ['authUser'] });
            }
        }
    });

    const registerUser = async userForm => {
        try {
            const response = await registerMutation.mutateAsync(userForm);
            return response.data;
        } catch (error) {
            return error.response?.data || {
                success: false,
                message: error.message
            };
        }
    };

    const logoutUser = () => {
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_NAME);
        SetAuthToken(null);
        queryClient.setQueryData(['authUser'], null);
    };

    const authState = useMemo(() =>  ({
        authLoading: isLoading,
        isAuthenticated: !!user,
        user: user || null
    }), [user, isLoading]);

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