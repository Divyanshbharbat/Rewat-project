import React, { useState, useEffect } from "react";
import { Award, BookOpen, Save, UserRound } from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import "./Grades.css";

const initials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const p = name.trim().split(/\s+/);
  const a = p[0]?.charAt(0) || "";
  const b = p.length > 1 ? p[p.length - 1].charAt(0) : "";
  return (a + b).toUpperCase() || "?";
};

const letterGrade = (marks) => {
  const n = parseFloat(marks);
  if (marks === "" || marks === undefined || marks === null || Number.isNaN(n))
    return "—";
  if (n >= 90) return "A";
  if (n >= 80) return "B";
  if (n >= 70) return "C";
  if (n >= 60) return "D";
  return "F";
};

const passPillClass = (marks) => {
  const n = parseFloat(marks);
  if (Number.isNaN(n)) return "grades-pill grades-pill--warn";
  if (n >= 60) return "grades-pill grades-pill--pass";
  if (n >= 40) return "grades-pill grades-pill--warn";
  return "grades-pill grades-pill--fail";
};

const passPillLabel = (marks) => {
  const n = parseFloat(marks);
  if (Number.isNaN(n)) return "Pending";
  if (n >= 60) return "On track";
  if (n >= 40) return "At risk";
  return "Needs support";
};

const Grades = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [studentData, setStudentData] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      if (isTeacher) {
        fetchTeacherClasses();
      } else {
        fetchStudentGrades();
      }
    }
  }, [user, isTeacher]);

  useEffect(() => {
    if (isTeacher && selectedClass && selectedSubject) {
      fetchClassGrades();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedSubject, isTeacher]);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teacher/classes");
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0]._id);
        setSelectedSubject(res.data[0].subjects?.[0] || "");
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassGrades = async () => {
    try {
      const res = await API.get(
        `/grades/class/${selectedClass}?subject=${encodeURIComponent(selectedSubject)}`,
      );
      setStudents(res.data);
    } catch (error) {
      toast.error("Failed to fetch grades");
    }
  };

  const fetchStudentGrades = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/grades");
      setStudentData(res.data);
    } catch (error) {
      console.error("Failed to fetch student grades:", error);
      toast.error("Could not load your grades");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s._id === studentId) return { ...s, marks: value };
        return s;
      }),
    );
  };

  const handleSaveMarks = async (student) => {
    const m = student.marks;
    if (m === "" || m === undefined || Number.isNaN(parseFloat(m))) {
      toast.error("Enter a valid mark between 0 and 100");
      return;
    }
    const num = parseFloat(m);
    if (num < 0 || num > 100) {
      toast.error("Marks must be between 0 and 100");
      return;
    }
    try {
      setSaving(true);
      await API.post("/grades", {
        studentId: student._id,
        subject: selectedSubject,
        marks: num,
        classId: selectedClass,
      });
      toast.success(`Saved for ${student.name}`);
      fetchClassGrades();
    } catch (error) {
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grades-page">
        <div className="premium-card grades-loading">
          <div className="grades-loading__spinner" aria-hidden />
          <p>Loading grades…</p>
        </div>
      </div>
    );
  }

  if (isTeacher) {
    const activeClass = classes.find((c) => c._id === selectedClass);
    const subjectOptions = activeClass?.subjects || [];

    return (
      <div className="grades-page">
        <Toaster position="top-right" />
        <header className="grades-page__header">
          <p className="grades-page__eyebrow">Assessment</p>
          <h1 className="grades-page__title">Gradebook</h1>
          <p className="grades-page__subtitle">
            Record marks by class and subject. Entries are saved per student and
            appear on the student&apos;s grade report.
          </p>
        </header>

        <div className="premium-card" style={{ marginBottom: "1.25rem" }}>
          <div className="grades-toolbar">
            <div className="grades-toolbar__fields">
              <div className="grades-field">
                <label className="grades-field__label" htmlFor="grades-class">
                  Class
                </label>
                <select
                  id="grades-class"
                  className="grades-select"
                  value={selectedClass}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedClass(id);
                    const cls = classes.find((c) => c._id === id);
                    setSelectedSubject(cls?.subjects?.[0] || "");
                  }}
                >
                  <option value="">Select class…</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className} — {c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grades-field">
                <label
                  className="grades-field__label"
                  htmlFor="grades-subject"
                >
                  Subject
                </label>
                <select
                  id="grades-subject"
                  className="grades-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass || subjectOptions.length === 0}
                >
                  <option value="">Select subject…</option>
                  {subjectOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedClass && selectedSubject ? (
              <div className="grades-meta">
                <UserRound size={16} aria-hidden />
                <span>
                  <strong>{students.length}</strong> students
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grades-table-wrap grades-table-wrap--flush">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Marks</th>
                <th className="grades-text-center">Save</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="grades-empty">
                      <BookOpen
                        size={36}
                        strokeWidth={1.25}
                        style={{ opacity: 0.35 }}
                      />
                      <p>
                        {!selectedClass || !selectedSubject
                          ? "Choose a class and subject to load the roster."
                          : "No students in this class or marks could not be loaded."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="grades-table__student">
                        <span className="grades-table__avatar">
                          {initials(student.name)}
                        </span>
                        <span className="grades-table__name">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="grades-input-wrap">
                        <input
                          type="number"
                          max={100}
                          min={0}
                          step={0.5}
                          className="grades-input"
                          value={
                            student.marks === "" ||
                            student.marks === undefined ||
                            student.marks === null
                              ? ""
                              : String(student.marks)
                          }
                          onChange={(e) =>
                            handleMarkChange(student._id, e.target.value)
                          }
                          placeholder="—"
                          aria-label={`Marks for ${student.name}`}
                        />
                        <span className="grades-input-suffix">%</span>
                      </div>
                    </td>
                    <td className="grades-text-center">
                      <button
                        type="button"
                        className="grades-btn-save"
                        disabled={saving}
                        onClick={() => handleSaveMarks(student)}
                      >
                        <Save size={14} aria-hidden />
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* —— Student —— */
  const calculateAvg = () => {
    if (!studentData || studentData.length === 0) return null;
    const nums = studentData
      .map((g) => parseFloat(g.marks))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  const avg = calculateAvg();
  const gradedCount =
    studentData?.filter((g) => {
      const n = parseFloat(g.marks);
      return g.marks !== "" && g.marks != null && !Number.isNaN(n);
    }).length ?? 0;
  const totalSubjects = studentData?.length ?? 0;

  const stats = [
    {
      label: "Overall average",
      value: avg != null ? `${avg}%` : "—",
      hint: avg != null ? letterGrade(avg) + " equivalent" : "No graded work yet",
      icon: <Award size={22} strokeWidth={1.75} />,
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
    },
    {
      label: "Subjects recorded",
      value: totalSubjects ? `${gradedCount} / ${totalSubjects}` : "0",
      hint: "Courses with at least one mark",
      icon: <BookOpen size={22} strokeWidth={1.75} />,
      iconBg: "#ecfdf5",
      iconColor: "#059669",
    },
  ];

  return (
    <div className="grades-page">
      <Toaster position="top-right" />
      <header className="grades-page__header">
        <p className="grades-page__eyebrow">Academic record</p>
        <h1 className="grades-page__title">My grades</h1>
        <p className="grades-page__subtitle">
          Summary of your marks by subject. Contact your teacher if anything
          looks incorrect.
        </p>
      </header>

      <div className="grades-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="premium-card grades-stat-card">
            <div
              className="grades-stat-card__icon"
              style={{ background: stat.iconBg, color: stat.iconColor }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="grades-stat-card__label">{stat.label}</p>
              <p className="grades-stat-card__value">{stat.value}</p>
              <p className="grades-stat-card__hint">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grades-table-wrap grades-table-wrap--flush">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Teacher</th>
              <th className="grades-text-center">Score</th>
              <th className="grades-text-center">Standing</th>
            </tr>
          </thead>
          <tbody>
            {!studentData || studentData.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="grades-empty">
                    <BookOpen
                      size={36}
                      strokeWidth={1.25}
                      style={{ opacity: 0.35 }}
                    />
                    <p>No grades posted yet.</p>
                    <p className="grades-text-muted">
                      When teachers enter marks, they will show up here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              studentData.map((grade, idx) => {
                const raw = grade.marks;
                const hasMark =
                  raw !== "" && raw !== undefined && raw !== null;
                const pct = hasMark
                  ? Math.min(100, Math.max(0, parseFloat(raw) || 0))
                  : 0;
                return (
                  <tr key={grade._id || idx}>
                    <td>
                      <div className="grades-subject-cell">{grade.subject}</div>
                      <div className="grades-bar-track">
                        <div
                          className="grades-bar-fill"
                          style={{ width: hasMark ? `${pct}%` : "0%" }}
                        />
                      </div>
                    </td>
                    <td className="grades-text-muted">
                      {grade.teacherId?.name || "Instructor"}
                    </td>
                    <td className="grades-text-center">
                      {hasMark ? (
                        <>
                          <span className="grades-marks">{raw}%</span>
                          <span className="grades-letter">
                            ({letterGrade(raw)})
                          </span>
                        </>
                      ) : (
                        <span className="grades-text-muted">—</span>
                      )}
                    </td>
                    <td className="grades-text-center">
                      <span className={passPillClass(hasMark ? raw : "")}>
                        {passPillLabel(hasMark ? raw : "")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Grades;
