import { SET_AUTH } from "../utils/VariableName";

export const AuthReducer = (state,action) => {
    const {type,payload: {isAuthenticated,user}} = action;
    switch (type) {
        case SET_AUTH: {
            return {
                ...state,
                authLoading: false,
                isAuthenticated,
                user 
            };
        }
        
        default: 
            return state;
    };
}