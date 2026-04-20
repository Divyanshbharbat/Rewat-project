import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import API from "../../services/api";
import Modal from "../../components/Modal/Modal";
import Form from "../../components/Form/Form";
import { Toaster, toast } from "react-hot-toast";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
    fetchTeachers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/classes");
      setClasses(response.data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await API.get("/teachers");
      setTeachers(response.data);
    } catch (error) {
      toast.error("Failed to fetch teachers");
    }
  };

  const handleAdd = () => {
    setCurrentClass(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cls) => {
    setCurrentClass({
      ...cls,
      classTeacher: cls.classTeacher?._id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (cls) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await API.delete(`/classes/${cls._id}`);
        toast.success("Class deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete class");
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      // handle array format for subjects
      const submitValues = { ...values };
      if (typeof submitValues.subjects === "string") {
        submitValues.subjects = submitValues.subjects
          .split(",")
          .map((s) => s.trim());
      }

      if (currentClass) {
        await API.put(`/classes/${currentClass._id}`, submitValues);
        toast.success("Class updated successfully");
      } else {
        await API.post("/classes", submitValues);
        toast.success("Class created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const formFields = [
    { name: "className", label: "Class/Grade (e.g., 10)", required: true },
    { name: "section", label: "Section (e.g., A)", required: true },
    {
      name: "classTeacher",
      label: "Class Teacher",
      type: "select",
      options: teachers.map((t) => ({ value: t._id, label: t.name })),
    },
    { name: "roomNumber", label: "Room Number" },
    { name: "capacity", label: "Capacity", type: "number" },
    {
      name: "subjects",
      label: "Subjects (comma-separated)",
      placeholder: "Math, Science, English",
    },
  ];

  const filteredClasses = classes.filter(
    (c) =>
      (c.className &&
        c.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.section &&
        c.section.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.classTeacher &&
        c.classTeacher.name &&
        c.classTeacher.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  // Color palette for class avatars
  const classColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
  ];
  const getClassColor = (index) => classColors[index % classColors.length];

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--bg-color)",
        minHeight: "100vh",
      }}
    >
      <Toaster position="top-right" />

      {/* Header Section */}
      <div
        style={{
          paddingBottom: "32px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "var(--text-main)",
                marginBottom: "8px",
              }}
            >
              Classes
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--text-muted)",
                fontWeight: "400",
              }}
            >
              Manage classes, sections, and assign class teachers.
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
              transition: "all 0.2s ease",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1d4ed8";
              e.target.style.boxShadow = "0 8px 16px rgba(37, 99, 235, 0.35)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--primary-color)";
              e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            Create Class
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div
        style={{
          marginTop: "32px",
          backgroundColor: "var(--card-bg)",
          borderRadius: "var(--radius-xl)",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search by class name, section, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
                fontSize: "15px",
                backgroundColor: "#f8fafc",
                color: "var(--text-main)",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-color)";
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.backgroundColor = "#f8fafc";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              Loading classes...
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <BookOpen
              size={40}
              color="var(--text-muted)"
              style={{
                opacity: 0.5,
                marginBottom: "12px",
                margin: "0 auto 12px",
              }}
            />
            <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              No classes found
            </div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Class & Section
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Class Teacher
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Room
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Capacity
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Subjects
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClasses.map((cls, idx) => (
                    <tr
                      key={cls._id}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                        transition: "background-color 0.2s ease",
                        hover: { backgroundColor: "#f0f4f8" },
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f4f8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          idx % 2 === 0 ? "#ffffff" : "#f9fafb")
                      }
                    >
                      {/* Class & Section */}
                      <td style={{ padding: "16px 24px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "var(--radius-lg)",
                              backgroundColor: getClassColor(idx),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "16px",
                              flexShrink: 0,
                            }}
                          >
                            {cls.className?.charAt(0)}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "15px",
                                fontWeight: "600",
                                color: "var(--text-main)",
                              }}
                            >
                              Class {cls.className}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "var(--text-muted)",
                                marginTop: "2px",
                              }}
                            >
                              Section {cls.section || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class Teacher */}
                      <td style={{ padding: "16px 24px" }}>
                        {cls.classTeacher ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundColor: "#dbeafe",
                                color: "#0284c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "600",
                                fontSize: "11px",
                                flexShrink: 0,
                              }}
                            >
                              {cls.classTeacher.name?.charAt(0)}
                            </div>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "var(--text-main)",
                                fontWeight: "500",
                              }}
                            >
                              {cls.classTeacher.name}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: "14px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Room */}
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            fontWeight: "500",
                          }}
                        >
                          {cls.roomNumber || "N/A"}
                        </span>
                      </td>

                      {/* Capacity */}
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            fontWeight: "500",
                          }}
                        >
                          {cls.capacity || "—"}
                        </span>
                      </td>

                      {/* Subjects */}
                      <td style={{ padding: "16px 24px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {cls.subjects && cls.subjects.length > 0 ? (
                            <>
                              {cls.subjects.slice(0, 2).map((sub, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: "12px",
                                    padding: "4px 10px",
                                    backgroundColor: "#f0f4f8",
                                    color: "#0284c7",
                                    borderRadius: "var(--radius-lg)",
                                    border: "1px solid #bfdbfe",
                                    fontWeight: "500",
                                  }}
                                >
                                  {sub}
                                </span>
                              ))}
                              {cls.subjects.length > 2 && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    padding: "4px 10px",
                                    color: "var(--text-muted)",
                                    fontWeight: "500",
                                  }}
                                >
                                  +{cls.subjects.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: "14px",
                                color: "var(--text-muted)",
                              }}
                            >
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 24px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(cls)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "transparent",
                              color: "var(--primary-color)",
                              border: "1px solid #bfdbfe",
                              borderRadius: "var(--radius-md)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#eff6ff";
                              e.currentTarget.style.borderColor =
                                "var(--primary-color)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor = "#bfdbfe";
                            }}
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cls)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "transparent",
                              color: "#ef4444",
                              border: "1px solid #fecaca",
                              borderRadius: "var(--radius-md)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              fontWeight: "600",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                              e.currentTarget.style.borderColor = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor = "#fecaca";
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                padding: "20px 24px",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  fontWeight: "500",
                }}
              >
                Showing{" "}
                {paginatedClasses.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}{" "}
                to{" "}
                {Math.min(currentPage * itemsPerPage, filteredClasses.length)}{" "}
                of {filteredClasses.length} entries
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: currentPage === 1 ? "#f3f4f6" : "#ffffff",
                    color: currentPage === 1 ? "#9ca3af" : "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor:
                          currentPage === page
                            ? "var(--primary-color)"
                            : "#ffffff",
                        color:
                          currentPage === page ? "#ffffff" : "var(--text-main)",
                        border:
                          currentPage === page
                            ? "none"
                            : "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        minWidth: "36px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 12px",
                    backgroundColor:
                      currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                    color:
                      currentPage === totalPages
                        ? "#9ca3af"
                        : "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentClass ? "Edit Class" : "Create New Class"}
      >
        <Form
          fields={formFields}
          initialValues={
            currentClass
              ? {
                  ...currentClass,
                  subjects: currentClass.subjects?.join(", ") || "",
                }
              : {}
          }
          onSubmit={handleSubmit}
          submitLabel={currentClass ? "Update Class" : "Create Class"}
        />
      </Modal>
    </div>
  );
};

export default Classes;
