import React, { useState, useEffect } from "react";
import { Save, School, MapPin, Mail, Phone } from "lucide-react";
import API from "../../services/api";
import { Toaster, toast } from "react-hot-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    schoolName: "",
    schoolLogo: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await API.get("/settings");
      if (response.data) {
        setSettings({
          schoolName: response.data.schoolName || "",
          schoolLogo: response.data.schoolLogo || "",
          address: response.data.address || "",
          contactEmail: response.data.contactEmail || "",
          contactPhone: response.data.contactPhone || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put("/settings", settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
          System Settings
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage your school's global information and configuration.
        </p>
      </div>

      <div className="premium-card" style={{ maxWidth: "800px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          School Information
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <School size={14} /> School Name
              </label>
              <input
                type="text"
                name="schoolName"
                value={settings.schoolName}
                onChange={handleChange}
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                School Logo URL
              </label>
              <input
                type="text"
                name="schoolLogo"
                value={settings.schoolLogo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <MapPin size={14} /> Full Address
            </label>
            <textarea
              name="address"
              value={settings.address}
              onChange={handleChange}
              rows={3}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                resize: "vertical",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--primary-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-color)")
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Mail size={14} /> Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Phone size={14} /> Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleChange}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) =>
                !saving && (e.target.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                !saving &&
                (e.target.style.backgroundColor = "var(--primary-color)")
              }
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
