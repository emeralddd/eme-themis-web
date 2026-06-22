import { Navigate } from "react-router-dom";
import { LOCAL_STORAGE_TOKEN_NAME } from "../../utils/VariableName";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

function Logout() {
    const {logoutUser} = useContext(AuthContext);

    logoutUser();

    return <Navigate to='/login' replace={true}/>;
}

export default Logout;