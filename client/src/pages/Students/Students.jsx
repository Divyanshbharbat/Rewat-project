import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import API from "../../services/api";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import Form from "../../components/Form/Form";
import { Toaster, toast } from "react-hot-toast";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
    fetchClasses();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/students");
      setStudents(response.data);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await API.get("/classes");
      setClasses(response.data);
    } catch (error) {
      toast.error("Failed to fetch classes");
    }
  };

  const handleAdd = () => {
    setCurrentStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    // Prepare student data for form - extract class ID if it's a populated object
    const studentData = {
      ...student,
      class: student.class?._id || student.class, // Get the ID from populated object or use as-is
    };
    setCurrentStudent(studentData);
    setIsModalOpen(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await API.delete(`/students/${student._id}`);
        toast.success("Student deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (currentStudent) {
        await API.put(`/students/${currentStudent._id}`, values);
        toast.success("Student updated successfully");
      } else {
        await API.post("/students", values);
        // Show login credentials for new student
        const loginPassword = values.password || values.phone;
        toast.success(
          `Student added! 📧 Email: ${values.email} | 🔑 Password: ${loginPassword}`,
          { duration: 6000 },
        );
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.error("Please select a file");
      return;
    }

    setBulkImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      const response = await API.post("/students/bulk-import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResults(response.data);
      setBulkFile(null);

      // Refresh student list
      await fetchData();

      toast.success(
        `Successfully imported ${response.data.successCount} students!`,
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Bulk import failed";
      toast.error(errorMsg);
      setImportResults(error.response?.data);
    } finally {
      setBulkImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // All fields supported by the Student schema
    const headers = [
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

    const sampleData = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "9876543210",
        dateOfBirth: "2010-01-15",
        gender: "Male",
        class: "Class 10A",
        department: "Science",
        address: "123 Main Street, City",
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
        address: "456 Oak Avenue, Town",
        fatherName: "David Smith",
        fatherPhone: "9876500003",
        motherName: "Linda Smith",
        motherPhone: "9876500004",
      },
    ];

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
    a.download = "student_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    { header: "ID", accessor: "studentId" },
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            {row.firstName?.charAt(0)}
            {row.lastName?.charAt(0)}
          </div>
          <div>
            <p
              style={{
                fontWeight: "500",
                color: "var(--text-main)",
                fontSize: "14px",
              }}
            >
              {row.firstName} {row.lastName}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    { header: "Class", render: (row) => row.class?.className || "N/A" },
    { header: "Gender", accessor: "gender" },
    { header: "Phone", accessor: "phone" },
  ];

  const formFields = [
    { name: "studentId", label: "Student ID", required: true, prefix: "STU" },
    { name: "firstName", label: "First Name", required: true },
    { name: "lastName", label: "Last Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone Number" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "class",
      label: "Class",
      type: "select",
      options: classes.map((c) => ({ value: c._id, label: c.className })),
    },
    { name: "address", label: "Address" },
    {
      name: "password",
      label: "Login Password (leave empty to use phone number)",
      type: "password",
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      (s.firstName &&
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.lastName &&
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.studentId && s.studentId.includes(searchQuery)) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Reset to page 1 when search query changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Navigation handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Students</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage student records, view details, and handle enrollments.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleAdd}
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
              cursor: "pointer",
              transition: "background-color 0.2s",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "var(--primary-color)")
            }
          >
            <Plus size={18} />
            Add Student
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#059669",
              color: "white",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
              boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.2)",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#047857")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#059669")}
          >
            <Upload size={18} />
            Bulk Import
          </button>
        </div>
      </div>

      <div className="premium-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ position: "relative", width: "300px" }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                outline: "none",
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

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Loading...
          </div>
        ) : (
          <Table
            columns={columns}
            data={paginatedStudents}
            totalItems={filteredStudents.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
            onPageChange={goToPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentStudent ? "Edit Student" : "Add New Student"}
      >
        <Form
          fields={formFields}
          initialValues={currentStudent || {}}
          onSubmit={handleSubmit}
          submitLabel={currentStudent ? "Update Details" : "Add Student"}
        />
      </Modal>

      <Modal
        isOpen={isBulkImportOpen}
        onClose={() => {
          setIsBulkImportOpen(false);
          setBulkFile(null);
          setImportResults(null);
        }}
        title="Bulk Import Students"
      >
        <div style={{ padding: "20px 0" }}>
          {!importResults ? (
            <form onSubmit={handleBulkImport}>
              <div
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "40px 20px",
                  textAlign: "center",
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
                  marginBottom: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--primary-color)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(37, 99, 235, 0.1)";
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(37, 99, 235, 0.05)";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files[0]) setBulkFile(files[0]);
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(37, 99, 235, 0.05)";
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".xlsx,.xls,.csv";
                  input.onchange = (e) => setBulkFile(e.target.files[0]);
                  input.click();
                }}
              >
                <Upload
                  size={32}
                  style={{
                    margin: "0 auto 12px",
                    color: "var(--primary-color)",
                  }}
                />
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  {bulkFile
                    ? `Selected: ${bulkFile.name}`
                    : "Drag & drop your Excel or CSV file here"}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  or click to browse (Supported: .xlsx, .xls, .csv)
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "transparent",
                    color: "var(--primary-color)",
                    border: "1px solid var(--primary-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bulkFile || bulkImporting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: bulkFile
                      ? "var(--primary-color)"
                      : "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: bulkFile ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    opacity: bulkImporting ? 0.7 : 1,
                  }}
                >
                  {bulkImporting ? "Importing..." : "Import Students"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <CheckCircle
                    size={20}
                    style={{
                      color: "#059669",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: "600", color: "#047857" }}>
                      Import Summary
                    </p>
                    <p style={{ fontSize: "14px", color: "#047857" }}>
                      ✅ {importResults.successCount} students successfully
                      imported
                    </p>
                    {importResults.failureCount > 0 && (
                      <p style={{ fontSize: "14px", color: "#d97706" }}>
                        ⚠️ {importResults.failureCount} rows had errors
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {importResults.successfulStudents &&
                importResults.successfulStudents.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: "var(--text-main)",
                      }}
                    >
                      Successfully Imported Students
                    </h3>
                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "13px",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Student ID
                            </th>
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Name
                            </th>
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Email
                            </th>
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Password
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResults.successfulStudents.map((student) => (
                            <tr
                              key={student.studentId}
                              style={{
                                borderBottom: "1px solid var(--border-color)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px",
                                  color: "var(--text-main)",
                                }}
                              >
                                {student.studentId}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  color: "var(--text-main)",
                                }}
                              >
                                {student.firstName} {student.lastName}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  color: "var(--text-muted)",
                                  fontSize: "12px",
                                }}
                              >
                                {student.email}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  fontFamily: "monospace",
                                  backgroundColor: "#f0fdf4",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  color: "#047857",
                                  userSelect: "all",
                                }}
                                title="Click to select"
                              >
                                {student.tempPassword}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {importResults.failedRows &&
                importResults.failedRows.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        color: "#dc2626",
                      }}
                    >
                      Failed Imports
                    </h3>
                    <div
                      style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        border: "1px solid #fecaca",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "#fef2f2",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "13px",
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: "#fee2e2",
                              borderBottom: "1px solid #fecaca",
                            }}
                          >
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Row #
                            </th>
                            <th
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontWeight: "600",
                              }}
                            >
                              Error
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResults.failedRows.map((row, idx) => (
                            <tr
                              key={idx}
                              style={{ borderBottom: "1px solid #fecaca" }}
                            >
                              <td
                                style={{ padding: "10px", fontWeight: "600" }}
                              >
                                {row.rowNumber}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  color: "#991b1b",
                                  fontSize: "12px",
                                }}
                              >
                                {row.errors.join("; ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setImportResults(null);
                    setBulkFile(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "transparent",
                    color: "var(--text-main)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  Import Another File
                </button>
                <button
                  onClick={() => {
                    setIsBulkImportOpen(false);
                    setImportResults(null);
                    setBulkFile(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--primary-color)")
                  }
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Students;
