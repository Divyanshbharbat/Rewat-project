import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  History,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  UserCheck,
  TrendingUp,
  FileText,
  Loader,
  FileDown,
} from "lucide-react";
import API from "../../services/api";
import Modal from "../../components/Modal/Modal";
import { Toaster, toast } from "react-hot-toast";

const BulkImport = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // **NEW: Progress tracking state**
  const [currentImportId, setCurrentImportId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);
  const [exportingErrors, setExportingErrors] = useState(false);
  const [exportingCredentials, setExportingCredentials] = useState(false);

  useEffect(() => {
    fetchImportHistory();
    fetchStatistics();

    // Cleanup progress polling on unmount
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, []);

  // **NEW: Poll import progress in real-time**
  useEffect(() => {
    if (!currentImportId) return;

    const interval = setInterval(async () => {
      try {
        const response = await API.get(
          `/bulk-import/${currentImportId}/status`,
        );
        setProgress(response.data);

        // Stop polling when completed
        if (
          response.data.status === "completed" ||
          response.data.status === "failed"
        ) {
          clearInterval(interval);
          setProgressInterval(null);
          setCurrentImportId(null);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    }, 1000); // Poll every second

    setProgressInterval(interval);

    return () => clearInterval(interval);
  }, [currentImportId, progressInterval]);

  const fetchImportHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await API.get("/bulk-import/history", {
        params: { limit: 10 },
      });
      setImportHistory(response.data.imports);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await API.get("/bulk-import/stats/summary");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
      ];

      if (
        validTypes.includes(selectedFile.type) ||
        /\.(xlsx|xls|csv)$/i.test(selectedFile.name)
      ) {
        // Check file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
          toast.error("File size exceeds 10MB limit");
          return;
        }
        setFile(selectedFile);
      } else {
        toast.error("Please upload a valid Excel or CSV file");
      }
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setImporting(true);
    setProgress({ progressPercentage: 0 });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint =
        activeTab === "students"
          ? "/bulk-import/students"
          : "/bulk-import/teachers";

      const response = await API.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Start polling progress
      if (response.data.importId) {
        setCurrentImportId(response.data.importId);
      }

      setImportResults(response.data);
      setFile(null);

      toast.success("Import started. Processing your file...");

      // Refresh history after delay
      setTimeout(() => {
        fetchImportHistory();
        fetchStatistics();
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Bulk import failed";
      toast.error(errorMsg);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err));
      }
      setImportResults(error.response?.data);
      setImporting(false);
    }
  };

  // **NEW: Export error report**
  const handleExportErrors = async (importId) => {
    setExportingErrors(true);
    try {
      const response = await API.get(`/bulk-import/${importId}/errors`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `error_report_${importId}.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Error report downloaded!");
    } catch (error) {
      toast.error("Failed to download error report");
      console.error(error);
    } finally {
      setExportingErrors(false);
    }
  };

  // **NEW: Export credentials**
  const handleExportCredentials = async (importId) => {
    setExportingCredentials(true);
    try {
      const response = await API.get(`/bulk-import/${importId}/credentials`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `credentials_${importId}.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Credentials exported!");
    } catch (error) {
      toast.error("Failed to export credentials");
      console.error(error);
    } finally {
      setExportingCredentials(false);
    }
  };

  const handleDownloadTemplate = () => {
    let headers, sampleData;

    if (activeTab === "students") {
      headers = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "gender",
        "class",
        "department",
        "address",
        "fatherName",
        "fatherPhone",
        "motherName",
        "motherPhone",
      ];

      sampleData = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "9876543210",
          dateOfBirth: "2010-01-15",
          gender: "Male",
          class: "Class 10A",
          department: "Science",
          address: "123 Main Street",
          fatherName: "Robert Doe",
          fatherPhone: "9876500001",
          motherName: "Mary Doe",
          motherPhone: "9876500002",
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "9876543211",
          dateOfBirth: "2010-03-20",
          gender: "Female",
          class: "Class 10A",
          department: "Science",
          address: "456 Oak Avenue",
          fatherName: "David Smith",
          fatherPhone: "9876500003",
          motherName: "Linda Smith",
          motherPhone: "9876500004",
        },
      ];
    } else {
      headers = ["name", "email", "phone", "subject", "department", "address"];

      sampleData = [
        {
          name: "Dr. Arun Kumar",
          email: "arun.kumar@example.com",
          phone: "9876543210",
          subject: "Mathematics",
          department: "Science",
          address: "123 School Lane",
        },
        {
          name: "Ms. Priya Singh",
          email: "priya.singh@example.com",
          phone: "9876543211",
          subject: "English",
          department: "Languages",
          address: "456 Education Road",
        },
      ];
    }

    const csvContent =
      headers.join(",") +
      "\n" +
      sampleData
        .map((row) => headers.map((h) => `"${row[h] || ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_import_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div
      style={{
        flex: "1",
        padding: "20px",
        borderRadius: "var(--radius-lg)",
        backgroundColor: color || "#f8f9fa",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Icon size={32} color="var(--primary-color)" />
      <div>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "12px",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "var(--text-main)",
          }}
        >
          {value || "..."}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "0" }}>
      <Toaster position="top-right" />

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Bulk Import</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Import multiple students or teachers at once using Excel or CSV files
        </p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Import Statistics
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard
              icon={TrendingUp}
              label="Total Imports"
              value={stats.totalImports}
            />
            <StatCard
              icon={CheckCircle}
              label="Successful"
              value={stats.successfulImports}
            />
            <StatCard
              icon={Users}
              label="Students Imported"
              value={stats.totalStudentsImported}
            />
            <StatCard
              icon={UserCheck}
              label="Teachers Imported"
              value={stats.totalTeachersImported}
            />
          </div>
        </div>
      )}

      {/* Import Tabs */}
      <div className="premium-card" style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid var(--border-color)",
            marginBottom: "30px",
          }}
        >
          {["students", "teachers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab ? "600" : "500",
                color:
                  activeTab === tab
                    ? "var(--primary-color)"
                    : "var(--text-muted)",
                borderBottom:
                  activeTab === tab ? "3px solid var(--primary-color)" : "none",
                marginBottom: "-2px",
                transition: "all 0.2s",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleImport}>
          {/* File Upload Area */}
          <div
            style={{
              border: "2px dashed var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "40px",
              textAlign: "center",
              marginBottom: "20px",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.backgroundColor = "#f0f9ff";
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) {
                const event = {
                  target: { files: [droppedFile] },
                };
                handleFileSelect(event);
              }
            }}
          >
            <Upload
              size={40}
              color="var(--primary-color)"
              style={{ marginBottom: "12px" }}
            />
            <h3 style={{ marginBottom: "8px" }}>Drop your file here</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
              or
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="file-input"
            />
            <label
              htmlFor="file-input"
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                display: "inline-block",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Select File
            </label>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                marginTop: "12px",
              }}
            >
              Supported formats: Excel (.xlsx, .xls) and CSV files (Max 5MB)
            </p>
          </div>

          {file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#f0f9ff",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                border: "1px solid var(--primary-color)",
              }}
            >
              <div>
                <p style={{ fontWeight: "500" }}>{file.name}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              style={{
                flex: 1,
                padding: "12px 24px",
                backgroundColor: "#f3f4f6",
                color: "var(--text-main)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e5e7eb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            >
              <Download size={18} />
              Download Template
            </button>
            <button
              type="submit"
              disabled={!file || importing}
              style={{
                flex: 1,
                padding: "12px 24px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: file ? "pointer" : "not-allowed",
                opacity: file && !importing ? 1 : 0.7,
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                file &&
                !importing &&
                (e.target.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                file &&
                !importing &&
                (e.target.style.backgroundColor = "var(--primary-color)")
              }
            >
              <Upload size={18} />
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>

      {/* Import History */}
      {importHistory.length > 0 && (
        <div className="premium-card">
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <History size={20} />
            Recent Imports
          </h2>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    File Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Success
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Failed
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((imp) => (
                  <tr
                    key={imp._id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      hover: { backgroundColor: "#f9fafb" },
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FileText size={16} color="var(--primary-color)" />
                        {imp.fileName}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ textTransform: "capitalize" }}>
                        {imp.importType}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            imp.status === "completed" ? "#dcfce7" : "#fee2e2",
                          color:
                            imp.status === "completed" ? "#166534" : "#991b1b",
                        }}
                      >
                        {imp.status.charAt(0).toUpperCase() +
                          imp.status.slice(1)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#059669",
                        fontWeight: "600",
                      }}
                    >
                      {imp.successCount}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      {imp.failureCount}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "var(--text-muted)",
                        fontSize: "12px",
                      }}
                    >
                      {new Date(imp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Results Modal with Progress & Exports */}
      <Modal
        isOpen={isResultsOpen}
        onClose={() => {
          setIsResultsOpen(false);
          setImportResults(null);
          setProgress(null);
        }}
        title={
          progress && progress.status === "processing"
            ? "Import in Progress..."
            : "Import Results"
        }
      >
        {progress && (
          <div style={{ marginBottom: "24px" }}>
            {/* **NEW: Progress Bar */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  Progress
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--primary-color)",
                    fontWeight: "600",
                  }}
                >
                  {progress.progressPercentage}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "var(--primary-color)",
                    width: `${progress.progressPercentage}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto auto",
                gap: "16px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <div>
                <span style={{ fontWeight: "600" }}>Processed:</span>{" "}
                {progress.processedRows} / {progress.totalRows}
              </div>
              <div>
                <span style={{ fontWeight: "600", color: "#059669" }}>
                  Success:
                </span>{" "}
                {progress.successCount}
              </div>
              <div>
                <span style={{ fontWeight: "600", color: "#dc2626" }}>
                  Failed:
                </span>{" "}
                {progress.failureCount}
              </div>
            </div>

            {progress.status === "processing" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <Loader size={14} className="animate-spin" />
                <span style={{ fontSize: "12px" }}>
                  Processing your file...
                </span>
              </div>
            )}
          </div>
        )}

        {importResults && (
          <div>
            {/* Summary Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <CheckCircle size={18} color="#059669" />
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "12px" }}
                  >
                    Successful
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#059669",
                  }}
                >
                  {importResults.successCount || 0}
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #fecaca",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <AlertCircle size={18} color="#dc2626" />
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "12px" }}
                  >
                    Failed
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#dc2626",
                  }}
                >
                  {importResults.failureCount || 0}
                </p>
              </div>
            </div>

            {/* **NEW: Export Buttons */}
            {importResults.importId && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                {importResults.failureCount > 0 && (
                  <button
                    onClick={() => handleExportErrors(importResults.importId)}
                    disabled={exportingErrors}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "var(--radius-md)",
                      cursor: exportingErrors ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      opacity: exportingErrors ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!exportingErrors)
                        e.target.style.backgroundColor = "#fee2e2";
                    }}
                    onMouseLeave={(e) => {
                      if (!exportingErrors)
                        e.target.style.backgroundColor = "#fef2f2";
                    }}
                  >
                    <FileDown size={14} />
                    {exportingErrors ? "Downloading..." : "Error Report"}
                  </button>
                )}

                {importResults.successCount > 0 && (
                  <button
                    onClick={() =>
                      handleExportCredentials(importResults.importId)
                    }
                    disabled={exportingCredentials}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#f0fdf4",
                      color: "#059669",
                      border: "1px solid #bbf7d0",
                      borderRadius: "var(--radius-md)",
                      cursor: exportingCredentials ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      opacity: exportingCredentials ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!exportingCredentials)
                        e.target.style.backgroundColor = "#dcfce7";
                    }}
                    onMouseLeave={(e) => {
                      if (!exportingCredentials)
                        e.target.style.backgroundColor = "#f0fdf4";
                    }}
                  >
                    <FileDown size={14} />
                    {exportingCredentials ? "Downloading..." : "Credentials"}
                  </button>
                )}
              </div>
            )}

            {/* Failed Records */}
            {importResults.failedRows &&
              importResults.failedRows.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}
                  >
                    Failed Records ({importResults.failedRows.length})
                  </h3>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {importResults.failedRows.map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "12px",
                          backgroundColor: "#fef2f2",
                          borderLeft: "4px solid #dc2626",
                          marginBottom: "8px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          Row {row.rowNumber}:{" "}
                          {Object.values(row.data)[0] || "N/A"}
                        </p>
                        <ul
                          style={{
                            margin: "0",
                            paddingLeft: "16px",
                            fontSize: "12px",
                          }}
                        >
                          {row.errors.map((error, errIdx) => (
                            <li key={errIdx} style={{ color: "#991b1b" }}>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setIsResultsOpen(false);
                  setImportResults(null);
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BulkImport;
