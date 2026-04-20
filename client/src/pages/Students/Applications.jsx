import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    applicationTitle: "",
    description: "",
  });
  const [message, setMessage] = useState(null);

  const applicationTypes = ["Bonafied", "Marksheet", "TC"];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await API.get("/applications/my-applications");
      setApplications(response.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage({
        type: "error",
        text: "Failed to fetch applications",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.applicationTitle || !formData.description.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in all fields",
      });
      return;
    }

    try {
      const response = await API.post("/applications/submit", {
        applicationTitle: formData.applicationTitle,
        description: formData.description,
      });

      setMessage({
        type: "success",
        text: response.data.message,
      });

      setFormData({
        applicationTitle: "",
        description: "",
      });
      setShowForm(false);
      fetchApplications();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit application",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={18} color="#10b981" />;
      case "Rejected":
        return <AlertCircle size={18} color="#ef4444" />;
      default:
        return <Clock size={18} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#d1fae5";
      case "Rejected":
        return "#fee2e2";
      default:
        return "#fef3c7";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Approved":
        return "#065f46";
      case "Rejected":
        return "#7f1d1d";
      default:
        return "#92400e";
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: "var(--text-main)",
              marginBottom: "4px",
            }}
          >
            Applications
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            Manage your document requests
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FileText size={18} /> New Application
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#7f1d1d",
            fontSize: "14px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Application Form */}
      {showForm && (
        <div
          className="premium-card"
          style={{
            padding: "24px",
            marginBottom: "30px",
            borderTop: "4px solid var(--primary-color)",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Submit New Application
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Application Type
              </label>
              <select
                value={formData.applicationTitle}
                onChange={(e) =>
                  setFormData({ ...formData, applicationTitle: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  backgroundColor: "white",
                }}
              >
                <option value="">Select Application Type</option>
                {applicationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Description/Reason
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Please describe why you need this application..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minHeight: "120px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "var(--text-main)",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div
          className="premium-card"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <FileText size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
          <p>No applications yet. Submit your first application!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {applications.map((app) => (
            <div
              key={app._id}
              className="premium-card"
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: "20px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--text-main)",
                    }}
                  >
                    {app.applicationTitle}
                  </h3>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: getStatusColor(app.status),
                      color: getStatusTextColor(app.status),
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  {app.description}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  Submitted on{" "}
                  {new Date(app.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {app.adminNotes && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "#f9fafb",
                      borderLeft: "3px solid var(--primary-color)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Admin Notes:
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {app.adminNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
