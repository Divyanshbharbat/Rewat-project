import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import API from "../../services/api";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `/applications/filter?status=${filterStatus}`
        : "/applications/all";
      const response = await API.get(url);
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

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      setMessage({
        type: "error",
        text: "Please select a status",
      });
      return;
    }

    try {
      await API.put(`/applications/${selectedApp._id}/status`, {
        status: statusUpdate,
        adminNotes: adminNotes || null,
      });

      setMessage({
        type: "success",
        text: "Application status updated successfully",
      });

      setSelectedApp(null);
      setStatusUpdate("");
      setAdminNotes("");
      fetchApplications();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update application",
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

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      label: "Pending",
      value: applications.filter((a) => a.status === "Pending").length,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      label: "Approved",
      value: applications.filter((a) => a.status === "Approved").length,
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      label: "Rejected",
      value: applications.filter((a) => a.status === "Rejected").length,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "var(--text-main)",
            marginBottom: "4px",
          }}
        >
          Student Applications
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Manage document requests from students
        </p>
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

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "30px",
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="premium-card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: stat.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: stat.color,
                }}
              >
                {stat.value}
              </span>
            </div>
            <div>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "2px",
                }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            fontFamily: "inherit",
            backgroundColor: "white",
          }}
        >
          <option value="">All Applications</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
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
          <p>No applications found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {applications.map((app) => (
            <div
              key={app._id}
              className="premium-card"
              style={{
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
                border:
                  selectedApp?._id === app._id
                    ? "2px solid var(--primary-color)"
                    : "1px solid transparent",
              }}
              onClick={() => setSelectedApp(app)}
            >
              <div
                style={{
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
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>Student:</strong> {app.studentId?.firstName}{" "}
                    {app.studentId?.lastName} ({app.studentId?.email})
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {app.description}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                    Submitted:{" "}
                    {new Date(app.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for updating status */}
      {selectedApp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="premium-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "700" }}>
                Update Application Status
              </h2>
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <strong>Student:</strong> {selectedApp.studentId?.firstName}{" "}
                {selectedApp.studentId?.lastName}
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <strong>Application:</strong> {selectedApp.applicationTitle}
              </p>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <strong>Request:</strong> {selectedApp.description}
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Status
              </label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
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
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes for the student..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  minHeight: "100px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleStatusUpdate}
                style={{
                  flex: 1,
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
                Update Status
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  flex: 1,
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
