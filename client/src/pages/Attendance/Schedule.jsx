import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  User,
  Users,
  BookOpen,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import html2pdf from "html2pdf.js";
import "./Schedule.css";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const normalizeScheduleResponse = (data) => {
  if (!data) return { slots: [], context: {} };
  if (Array.isArray(data)) {
    return {
      slots: data.map((row, i) => ({
        id: row.id || row._id || `row-${i}`,
        title: row.title || row.subject || "Class",
        subtitle: row.subtitle || "",
        classLabel: row.classLabel || row.class || "",
        time: row.time || "",
        room: row.room || "TBD",
        weekdays: row.weekdays || row.days || [...WEEK_DAYS],
        teacherName: row.teacherName || row.teacher,
        studentCount:
          typeof row.studentCount === "number"
            ? row.studentCount
            : undefined,
      })),
      context: {},
    };
  }
  return {
    slots: Array.isArray(data.slots) ? data.slots : [],
    context: data.context || {},
  };
};

const slotOccursOnDay = (slot, day) => {
  const days = slot.weekdays || WEEK_DAYS;
  return days.some((d) => String(d).toLowerCase() === day.toLowerCase());
};

const Schedule = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [payload, setPayload] = useState({ slots: [], context: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;

    const run = async () => {
      setLoading(true);
      try {
        const url = isTeacher ? "/teacher/schedule" : "/student/schedule";
        const res = await API.get(url);
        setPayload(normalizeScheduleResponse(res.data));
      } catch (e) {
        console.error(e);
        toast.error("Could not load your schedule");
        setPayload({ slots: [], context: {} });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user?.token, isTeacher]);

  const { slots, context } = payload;

  const slotsByDay = useMemo(() => {
    const map = {};
    WEEK_DAYS.forEach((d) => {
      map[d] = slots.filter((s) => slotOccursOnDay(s, d));
    });
    return map;
  }, [slots]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("schedule-report");
    if (!element) return;
    const opt = {
      margin: [0.5, 0.5],
      filename: `${(user?.name || "Schedule").replace(/\s+/g, "_")}_Weekly_Schedule.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    const hidden = element.querySelectorAll(".schedule-no-print");
    hidden.forEach((el) => {
      el.dataset._display = el.style.display;
      el.style.display = "none";
    });

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .finally(() => {
        hidden.forEach((el) => {
          el.style.display = el.dataset._display || "";
        });
      });
  };

  if (loading) {
    return (
      <div className="schedule-page">
        <div className="premium-card schedule-loading">
          <div className="schedule-loading__spinner" aria-hidden />
          <p>Loading schedule…</p>
        </div>
      </div>
    );
  }

  const headline = isTeacher
    ? context.headline || "Teaching schedule"
    : context.homeroom || "Weekly timetable";
  const subline = context.subline || "";

  return (
    <div className="schedule-page" id="schedule-report">
      <Toaster position="top-right" />

      <div className="schedule-page__top">
        <header>
          <p className="schedule-page__eyebrow">
            {isTeacher ? "Teaching" : "Academic"}
          </p>
          <h1 className="schedule-page__title">
            {isTeacher ? "Class schedule" : "My schedule"}
          </h1>
          <p className="schedule-page__subtitle">
            {isTeacher
              ? "Weekly overview of every class you teach, organized by weekday."
              : "When your classes meet, where they are held, and who teaches them."}
          </p>
        </header>
        <div className="schedule-actions schedule-no-print">
          <button
            type="button"
            className="schedule-btn-pdf"
            onClick={handleDownloadPDF}
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="premium-card schedule-summary">
        <div className="schedule-summary__icon">
          <Calendar size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="schedule-summary__title">{headline}</h2>
          <p className="schedule-summary__meta">
            {subline}
            {!isTeacher && slots.length > 0 && (
              <>
                {" "}
                · Academic year{" "}
                <strong>
                  {new Date().getMonth() >= 6
                    ? `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`
                    : `${new Date().getFullYear() - 1}–${new Date().getFullYear()}`}
                </strong>
              </>
            )}
          </p>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="premium-card schedule-empty-page">
          <BookOpen
            size={40}
            strokeWidth={1.25}
            style={{ opacity: 0.35 }}
            aria-hidden
          />
          <p>
            {isTeacher
              ? "No classes are assigned to you yet."
              : "You are not linked to a homeroom class yet."}
          </p>
          <p style={{ fontSize: "0.875rem", maxWidth: "28rem", margin: "0.75rem auto 0" }}>
            {isTeacher
              ? "Ask an administrator to assign you as the teacher on your class records."
              : "Once your class is assigned, your weekly timetable will appear here."}
          </p>
        </div>
      ) : (
        WEEK_DAYS.map((day) => (
          <section key={day} className="schedule-day">
            <h3 className="schedule-day__title">{day}</h3>
            {slotsByDay[day].length === 0 ? (
              <p className="schedule-empty-day">No sessions this day.</p>
            ) : (
              <div className="schedule-day__grid">
                {slotsByDay[day].map((item, idx) => (
                  <article key={`${item.id}-${day}-${idx}`} className="schedule-slot">
                    <div className="schedule-slot__badge">{idx + 1}</div>
                    <h4 className="schedule-slot__title">{item.title}</h4>
                    {(item.classLabel || item.subtitle) && (
                      <p className="schedule-slot__subtitle">
                        {[item.classLabel, item.subtitle].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="schedule-slot__row">
                      <Clock size={14} />
                      <span>{item.time}</span>
                    </div>
                    <div className="schedule-slot__row">
                      <MapPin size={14} />
                      <span>{item.room}</span>
                    </div>
                    {!isTeacher && item.teacherName && (
                      <div className="schedule-slot__row">
                        <User size={14} />
                        <span>{item.teacherName}</span>
                      </div>
                    )}
                    {isTeacher && item.studentCount !== undefined && (
                      <div className="schedule-slot__row">
                        <Users size={14} />
                        <span>
                          {item.studentCount} student
                          {item.studentCount === 1 ? "" : "s"} enrolled
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
};

export default Schedule;
