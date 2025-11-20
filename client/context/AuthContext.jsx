import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  
  const connectSocket = (user) => {
    if (!user) return;

   
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(backendUrl, { query: { userId: user._id } });
    newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
    setSocket(newSocket);
  };

  const checkAuth = async () => {
    try {
      if (!token) return;

      const { data } = await axios.get("/api/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch {
      logout();
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (!data.success) return toast.error(data.message);

      setAuthUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);

      connectSocket(data.user);

      toast.success("Logged in successfully ");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed ");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    socket?.disconnect();
    navigate("/login");
  };

  //  Profile Update 
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (!data.success) return false;

      setAuthUser(data.user);
      return true; 
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  
  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <AuthContext.Provider
      value={{ authUser, login, logout, onlineUsers, updateProfile, socket }}
    >
      {children}
    </AuthContext.Provider>
  );
};
