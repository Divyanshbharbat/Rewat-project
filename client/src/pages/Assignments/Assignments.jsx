import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  Save,
  Plus,
  X,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import Modal from "../../components/Modal/Modal";

const Assignments = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subject: "",
    dueDate: "",
  });

  // Helper to construct PDF URL
  const getPDFUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http")) return fileUrl;
    return `http://localhost:5000${fileUrl}`;
  };

  useEffect(() => {
    if (user && user.token) {
      fetchAssignments();
      if (isTeacher) {
        fetchClasses();
      } else {
        fetchMySubmissions();
      }
    }
  }, [user, isTeacher]);

  // Close menu when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setOpenMenuId(null);
    }
  }, [isModalOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId && !e.target.closest("[data-menu-trigger]")) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openMenuId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const endpoint = isTeacher ? "/assignments" : "/student/dashboard";
      const res = await API.get(endpoint);

      if (res.data) {
        const data = isTeacher ? res.data : res.data.assignments || [];
        if (Array.isArray(data)) {
          setAssignments(data);
        } else {
          console.error("Invalid assignments data format");
          setAssignments([]);
          toast.error("Failed to load assignments - invalid data format");
        }
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      setAssignments([]);
      toast.error("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await API.get("/submissions/my-status");
      if (Array.isArray(res.data)) {
        setMySubmissions(res.data);
      } else {
        setMySubmissions([]);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      setMySubmissions([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await API.get("/teacher/classes");
      if (Array.isArray(res.data)) {
        setClasses(res.data);
      } else {
        setClasses([]);
        toast.error("Invalid classes data received");
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
      toast.error("Failed to fetch classes");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.post("/assignments", formData);
      toast.success("Assignment created successfully");
      setIsModalOpen(false);
      setFormData({
        title: "",
        description: "",
        classId: "",
        subject: "",
        dueDate: "",
      });
      fetchAssignments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create assignment",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    if (!selectedAssignment?._id) return toast.error("Assignment not selected");

    try {
      setSaving(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("assignmentId", selectedAssignment._id);

      const response = await API.post("/submissions/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Assignment submitted successfully");
        setIsModalOpen(false);
        setFile(null);
        setSelectedAssignment(null);
        await fetchMySubmissions();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please try again.";
      console.error("Upload error:", error);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      if (!assignmentId) {
        toast.error("Invalid assignment ID");
        return;
      }
      const res = await API.get(`/submissions/assignment/${assignmentId}`);
      if (Array.isArray(res.data)) {
        console.log("Submissions received:", res.data);
        if (res.data.length === 0) {
          toast.info("No submissions yet for this assignment");
        }
        setSubmissions(res.data);
        setIsSubmissionsModalOpen(true);
      } else {
        toast.error("Invalid submissions data received");
        console.error("Invalid data format:", res.data);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch submissions",
      );
    }
  };

  const isSubmitted = (assignmentId) => {
    return mySubmissions.some((s) => s.assignmentId === assignmentId);
  };

  const handleEditAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      classId: assignment.classId?._id || assignment.classId,
      subject: assignment.subject,
      dueDate: assignment.dueDate ? assignment.dueDate.split("T")[0] : "",
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment?._id) {
      toast.error("Assignment not selected");
      return;
    }

    try {
      setSaving(true);
      await API.put(`/assignments/${selectedAssignment._id}`, formData);
      toast.success("Assignment updated successfully");
      setIsModalOpen(false);
      setSelectedAssignment(null);
      setFormData({
        title: "",
        description: "",
        classId: "",
        subject: "",
        dueDate: "",
      });
      fetchAssignments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update assignment",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await API.delete(`/assignments/${id}`);
      toast.success("Assignment deleted successfully");
      fetchAssignments();
      setOpenMenuId(null);
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading assignments...
      </div>
    );

  return (
    <div>
      <Toaster position="top-right" />
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
            style={{ fontSize: "28px", marginBottom: "8px", fontWeight: "700" }}
          >
            {isTeacher ? "Manage Assignments" : "My Assignments"}
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            {isTeacher
              ? "Create and track assignments for your classes"
              : "View and submit your assignments"}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => {
              setSelectedAssignment(null);
              setIsModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-lg)",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1d4ed8";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(37, 99, 235, 0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-color)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(37, 99, 235, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={20} /> Create Assignment
          </button>
        )}
      </div>

      {/* Assignments List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {assignments.map((a, idx) => {
          const submitted = !isTeacher && isSubmitted(a._id);
          const dueDate = new Date(a.dueDate);
          const today = new Date();
          const daysUntilDue = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24),
          );
          const isOverdue = daysUntilDue < 0;
          const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 2;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: "white",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-md)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 12px 24px -2px rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Status Bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  height: "100%",
                  backgroundColor: submitted
                    ? "#10b981"
                    : isOverdue
                      ? "#ef4444"
                      : isUrgent
                        ? "#f59e0b"
                        : "#3b82f6",
                }}
              />

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: submitted ? "#ecfdf5" : "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {submitted ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <FileText size={24} color="#3b82f6" />
                  )}
                </div>
                {isTeacher && (
                  <div style={{ position: "relative" }}>
                    <button
                      data-menu-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === a._id ? null : a._id);
                      }}
                      title="Options"
                      style={{
                        color: "#6b7280",
                        background: "transparent",
                        border: "1.5px solid #e5e7eb",
                        cursor: "pointer",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        borderRadius: "var(--radius-md)",
                        width: "36px",
                        height: "36px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.color = "#374151";
                      }}
                      onMouseLeave={(e) => {
                        if (openMenuId !== a._id) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.color = "#6b7280";
                        }
                      }}
                    >
                      <MoreVertical size={18} strokeWidth={2} />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === a._id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "0",
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "var(--radius-md)",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          zIndex: 1000,
                          minWidth: "160px",
                          overflow: "hidden",
                          animation: "slideDown 0.2s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Edit Option */}
                        <button
                          onClick={() => handleEditAssignment(a)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#374151",
                            transition: "all 0.2s ease",
                            textAlign: "left",
                            fontWeight: "500",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#374151";
                          }}
                        >
                          <Edit2 size={16} />
                          Edit Assignment
                        </button>

                        {/* Divider */}
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#e5e7eb",
                            margin: "0",
                          }}
                        />

                        {/* Delete Option */}
                        <button
                          onClick={() => handleDeleteAssignment(a._id)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#ef4444",
                            transition: "all 0.2s ease",
                            textAlign: "left",
                            fontWeight: "500",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fef2f2";
                            e.currentTarget.style.color = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                        >
                          <Trash2 size={16} />
                          Delete Assignment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "var(--text-main)",
                  lineHeight: "1.4",
                }}
              >
                {a.title}
              </h4>

              {/* Subject Info */}
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                  fontWeight: "500",
                }}
              >
                {a.subject}{" "}
                {isTeacher &&
                  ` • ${a.classId?.className} - ${a.classId?.section}`}
              </p>

              {/* Due Date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  padding: "8px 12px",
                  backgroundColor: isOverdue
                    ? "#fef2f2"
                    : isUrgent
                      ? "#fffbeb"
                      : "#eff6ff",
                  borderRadius: "var(--radius-md)",
                  borderLeft: `3px solid ${isOverdue ? "#ef4444" : isUrgent ? "#f59e0b" : "#3b82f6"}`,
                }}
              >
                <Clock
                  size={16}
                  color={
                    isOverdue ? "#ef4444" : isUrgent ? "#f59e0b" : "#3b82f6"
                  }
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: isOverdue
                      ? "#ef4444"
                      : isUrgent
                        ? "#d97706"
                        : "var(--text-muted)",
                  }}
                >
                  {isOverdue
                    ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? "s" : ""}`
                    : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Action Button */}
              {isTeacher ? (
                <button
                  onClick={() => handleViewSubmissions(a._id)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    fontWeight: "600",
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(37, 99, 235, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--primary-color)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(37, 99, 235, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  View Submissions
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedAssignment(a);
                    setIsModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: submitted
                      ? "#ecfdf5"
                      : "var(--primary-color)",
                    color: submitted ? "#10b981" : "white",
                    border: submitted
                      ? "1.5px solid #10b981"
                      : "1.5px solid var(--primary-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitted) {
                      e.currentTarget.style.backgroundColor = "#1d4ed8";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(37, 99, 235, 0.3)";
                    } else {
                      e.currentTarget.style.backgroundColor = "#d1fae5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = submitted
                      ? "#ecfdf5"
                      : "var(--primary-color)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {submitted ? "✓ Submitted" : "Submit Assignment"}
                </button>
              )}
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div
            style={{
              gridColumn: "span 3",
              padding: "60px 40px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <BookOpen
              size={48}
              style={{ marginBottom: "16px", opacity: 0.3 }}
            />
            <p style={{ fontSize: "16px", fontWeight: "600" }}>
              No assignments found.
            </p>
          </div>
        )}
      </div>

      {/* Create/Submit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
          setFormData({
            title: "",
            description: "",
            classId: "",
            subject: "",
            dueDate: "",
          });
        }}
        title={
          isTeacher
            ? selectedAssignment
              ? "Edit Assignment"
              : "Create New Assignment"
            : "Submit Assignment"
        }
      >
        {isTeacher ? (
          <form
            onSubmit={
              selectedAssignment
                ? handleUpdateAssignment
                : handleCreateAssignment
            }
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Title *
              </label>
              <input
                type="text"
                required
                placeholder="Enter assignment title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Class *
              </label>
              <select
                required
                value={formData.classId}
                onChange={(e) => {
                  const cls = classes.find((c) => c._id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    subject: cls?.subjects?.[0] || "",
                  });
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232563eb' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.className} - {c.section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232563eb' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              >
                <option value="">Select Subject...</option>
                {classes
                  .find((c) => c._id === formData.classId)
                  ?.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                }}
              >
                Description
              </label>
              <textarea
                rows="3"
                placeholder="Enter assignment description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  resize: "none",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor: saving ? "#cbd5e1" : "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)",
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
              {selectedAssignment
                ? saving
                  ? "Updating..."
                  : "Update Assignment"
                : saving
                  ? "Creating..."
                  : "Create Assignment"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleFileUpload}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {selectedAssignment ? (
              <div
                style={{
                  backgroundColor: "var(--primary-light)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--text-main)",
                  }}
                >
                  {selectedAssignment.title || "Untitled Assignment"}
                </h4>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedAssignment.description || "No description provided."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                Error: Assignment not loaded. Please try again.
              </div>
            )}
            <div
              style={{
                padding: "28px",
                border: "2px dashed var(--primary-color)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
                backgroundColor: "var(--primary-light)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor =
                  "rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.borderColor = "var(--primary-color)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-light)";
              }}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    if (selectedFile.type !== "application/pdf") {
                      toast.error("Please upload a PDF file only");
                      setFile(null);
                    } else if (selectedFile.size > 5 * 1024 * 1024) {
                      toast.error("File size must be less than 5MB");
                      setFile(null);
                    } else {
                      setFile(selectedFile);
                    }
                  }
                }}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                style={{ cursor: "pointer", display: "block" }}
              >
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={48} color="var(--primary-color)" />
                </div>
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "var(--text-main)",
                    marginBottom: "4px",
                  }}
                >
                  {file ? file.name : "Click to select PDF or drag and drop"}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Only PDF files (max 5MB)
                </p>
              </label>
            </div>
            <button
              type="submit"
              disabled={saving || !file}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 24px",
                backgroundColor:
                  saving || !file ? "#cbd5e1" : "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: saving || !file ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)",
                opacity: saving || !file ? 0.7 : 1,
              }}
              onMouseEnter={(e) =>
                !(saving || !file) &&
                (e.target.style.backgroundColor = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                !(saving || !file) &&
                (e.target.style.backgroundColor = "var(--primary-color)")
              }
            >
              <Save size={18} /> {saving ? "Uploading..." : "Submit PDF"}
            </button>
          </form>
        )}
      </Modal>

      {/* View Submissions Modal */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title="Student Submissions"
      >
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <th style={{ padding: "12px", fontSize: "13px" }}>Student</th>
                <th style={{ padding: "12px", fontSize: "13px" }}>Submitted</th>
                <th
                  style={{
                    padding: "12px",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions && submissions.length > 0
                ? submissions.map((s, idx) => {
                    const student = s.studentId || {};
                    return (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px" }}>
                          <p style={{ fontWeight: "600", fontSize: "14px" }}>
                            {student.firstName && student.lastName
                              ? `${student.firstName} ${student.lastName}`
                              : student.name || "Unknown Student"}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            ID: {student.studentId || "N/A"}
                          </p>
                        </td>
                        <td style={{ padding: "12px", fontSize: "13px" }}>
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {s.fileUrl ? (
                            <a
                              href={getPDFUrl(s.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                textDecoration: "none",
                                backgroundColor: "var(--primary-color)",
                                color: "white",
                                borderRadius: "4px",
                                display: "inline-block",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#1d4ed8";
                                e.target.style.boxShadow =
                                  "0 4px 8px rgba(37, 99, 235, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor =
                                  "var(--primary-color)";
                                e.target.style.boxShadow = "none";
                              }}
                              onClick={(e) => {
                                const url = getPDFUrl(s.fileUrl);
                                if (!url) {
                                  e.preventDefault();
                                  toast.error("PDF file is not available");
                                }
                              }}
                            >
                              📄 View PDF
                            </a>
                          ) : (
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "12px",
                              }}
                            >
                              ⚠️ Not available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : null}
              {(!submissions || submissions.length === 0) && (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default Assignments;
