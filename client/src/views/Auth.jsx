import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import {AuthContext} from '../contexts/authContext';
import {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import Waiting from '../components/layout/Waiting';
import SingleFunction from '../components/layout/SingleFunction';

function Auth({authRoute}) {
    const {authState: {authLoading, isAuthenticated}} = useContext(AuthContext);
    let body;

    if(authLoading) {
        body = (
            <Waiting />
        );
    } else {
        if(isAuthenticated) {
            return <Navigate to='/' />;
        }

        body = (
            <SingleFunction content={
                (
                    <div className="h-full flex justify-center items-center">
                        {authRoute === 'login' && <LoginForm />}
                        {authRoute === 'register' && <RegisterForm />}
                    </div>
                )
            } isAuthenticated={false}/>
        );
    } 

    return (
        <>
            {body}
        </>
    );
}

export default Auth;