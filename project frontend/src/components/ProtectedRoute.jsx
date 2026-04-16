import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/user/profile");
        setIsAuth(true);
      } catch(err) {
        if (err?.response?.status !== 401) {
          console.error(err);
        }
        setIsAuth(false);
        navigate("/login");
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }


  if (!isAuth) {
    return null;
  }

  return children;
};

export default ProtectedRoute;