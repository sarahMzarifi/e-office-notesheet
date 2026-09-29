import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/router";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("users/me/");

      setUser(response.data);

      return response.data;
    } catch (error) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);

    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}