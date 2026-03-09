import { Navigate } from "react-router-dom";
import { LOCAL_STORAGE_TOKEN_NAME } from "../../utils/VariableName";

function Logout() {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_NAME,null);
    return <Navigate to='/login' replace={true}/>;
}

export default Logout;