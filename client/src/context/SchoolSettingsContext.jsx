import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const SchoolSettingsContext = createContext({
  schoolName: "",
  schoolLogo: "",
  loading: false,
  refreshSchoolSettings: async () => {},
});

export function SchoolSettingsProvider({ children }) {
  const { user } = useAuth();
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshSchoolSettings = useCallback(async () => {
    if (!user?.token) {
      setSchoolName("");
      setSchoolLogo("");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.get("/settings");
      setSchoolName(data?.schoolName || "");
      setSchoolLogo((data?.schoolLogo || "").trim());
    } catch {
      /* keep previous or empty */
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    refreshSchoolSettings();
  }, [refreshSchoolSettings]);

  return (
    <SchoolSettingsContext.Provider
      value={{
        schoolName,
        schoolLogo,
        loading,
        refreshSchoolSettings,
      }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  );
}

export function useSchoolSettings() {
  return useContext(SchoolSettingsContext);
}
