import {Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/authContext'
import Waiting from '../layout/Waiting';

const ProtectedRoute = () => {

    const {authState: {authLoading, isAuthenticated}} = useContext(AuthContext);
    
    if(authLoading) {
        return (
            <Waiting />
        );
    }

    return (
        isAuthenticated?<Outlet />:<Navigate to='/login'/>
    );
}

export default ProtectedRoute;