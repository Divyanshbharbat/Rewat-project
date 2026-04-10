import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize from sessionStorage synchronously to prevent flash of login page
  // sessionStorage is tab-specific, allowing multiple tabs with different logins
  const [user, setUser] = useState(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const response = await fetch(
            "http://localhost:5000/api/auth/verify",
            {
              method: "GET",
              headers: { Authorization: `Bearer ${parsedUser.token}` },
            },
          );

          if (response.ok) {
            const data = await response.json();
            setUser(data);
            sessionStorage.setItem("user", JSON.stringify(data));
          } else {
            // Token is invalid, clear storage
            sessionStorage.removeItem("user");
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification error:", error);
          sessionStorage.removeItem("user");
          setUser(null);
        }
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password, role) => {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data);
      sessionStorage.setItem("user", JSON.stringify(data));
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
