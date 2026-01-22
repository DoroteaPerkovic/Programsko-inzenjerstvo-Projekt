import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("access");
    const tokenRef = localStorage.getItem("refresh");

    console.log(token);
    console.log(tokenRef);


    if (!token || !tokenRef) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
