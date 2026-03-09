import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AuthContextProvider from './contexts/authContext';
import Auth from './views/Auth';
import Logout from './components/auth/Logout';
import Ranking from './views/Ranking';
import Submit from './views/Submit';
import Attachments from './views/Attachments';

function App() {
    return (
        <AuthContextProvider>
            <Router>
                <Routes>
                    <Route path='/' element={<ProtectedRoute />}>
                        <Route path='/' element={<Submit />} />
                        <Route path='/attachments' element={<Attachments />} />
                        {/* <Route path='/testcases' element={<Submit />} /> */}
                        {/* <Route path='/settings' element={<Submit />} /> */}
                        <Route path='/ranking' element={<Ranking />} />
                    </Route>

                    <Route path='/login' element={<Auth authRoute='login' />} />
                    <Route path='/register' element={<Auth authRoute='register' />} />
                    <Route path='/logout' element={<Logout />} />
                </Routes>
            </Router>
        </AuthContextProvider>
    );
}

export default App;
