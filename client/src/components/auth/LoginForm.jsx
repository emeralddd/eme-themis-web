import {Link} from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';

const LoginForm = () => {
    const {loginUser} = useContext(AuthContext);

    const [loginForm,setLoginForm] = useState({
        username: '',
        password: ''
    });

    const [error,setError] = useState("");

    const {username,password} = loginForm;

    const onChangeLoginForm = event => {
        setLoginForm({...loginForm, [event.target.name]:event.target.value});
        if(event.target.value === '') setError("");
    }

    const login = async event => {
        event.preventDefault();

        try {
            const loginData = await loginUser(loginForm);
            if(!loginData.success) {
                setError(loginData.message);
            }
        } catch (error) {
            setError(error);
        } 
    }

    return (
        <>
            <div className="w-[30vw]">
                <div className="flex flex-col content-around justify-center gap-10">
                    <div className="text-3xl font-bold flex justify-center font-mont">
                        Login to your account
                    </div>

                    <div className='flex flex-col gap-5'>
                        <input className="font-light border-0 border-b-2 border-b-[#B2ABAA] focus:border-b-black ease-out w-full text-lg my-2 duration-150 outline-none" name='username' value={username} onChange={onChangeLoginForm} placeholder="Username" />

                        <input type='password' className="font-light border-0 border-b-2 border-b-[#B2ABAA] focus:border-b-black ease-out w-full text-lg my-2 duration-150 outline-none" value={password} name='password' placeholder="Password" onChange={onChangeLoginForm} />
                    </div>

                    <div className='flex flex-col gap-5'>
                        <div className='flex justify-center'>
                            <button type='submit' className="bg-[#180600] p-2 text-xl w-full text-center text-white font-mont rounded-md" onClick={login}>
                                Continue
                            </button>
                        </div>

                        <div className={`${error?'block':'hidden'} text-center text-base text-red-500`}>
                            {error}
                        </div>

                        <Link to='/register'>
                            <div className="text-[#180600] text-lg text-center">
                                Don't have account? <u><b>Register</b></u>!
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginForm;
