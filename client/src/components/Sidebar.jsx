import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  BookOpen,
  CalendarCheck,
  Calendar,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  MessageSquare,
  UserCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchoolSettings } from "../context/SchoolSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import "./Sidebar.css";

/* Inject badge pulse animation once */
if (!document.getElementById("sidebar-badge-style")) {
  const style = document.createElement("style");
  style.id = "sidebar-badge-style";
  style.textContent = `
    @keyframes badgePulse {
      0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
      70%  { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
  `;
  document.head.appendChild(style);
}

const logoUrlLooksValid = (url) =>
  /^https?:\/\//i.test(String(url || "").trim());

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
  const { schoolName, schoolLogo } = useSchoolSettings();
  const { unreadCount } = useNotifications();
  const [logoBroken, setLogoBroken] = useState(false);

  useEffect(() => {
    setLogoBroken(false);
  }, [schoolLogo]);

  const showImageLogo = logoUrlLooksValid(schoolLogo) && !logoBroken;
  const displaySchoolName = schoolName?.trim() || "SchoolERP";
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    admin: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
        path: "/admin/dashboard",
      },
      { icon: <Users size={20} />, label: "Students", path: "/admin/students" },
      {
        icon: <UserRound size={20} />,
        label: "Teachers",
        path: "/admin/teachers",
      },
      {
        icon: <BookOpen size={20} />,
        label: "Classes",
        path: "/admin/classes",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Reports",
        path: "/admin/reports",
      },
      {
        icon: <Calendar size={20} />,
        label: "Events",
        path: "/admin/events",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Messages",
        path: "/admin/messages",
      },
      {
        icon: <FileText size={20} />,
        label: "Applications",
        path: "/admin/applications",
      },
      {
        icon: <Settings size={20} />,
        label: "Settings",
        path: "/admin/settings",
      },
    ],
    teacher: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
        path: "/teacher/dashboard",
      },
      {
        icon: <BookOpen size={20} />,
        label: "My Classes",
        path: "/teacher/classes",
      },
      {
        icon: <CalendarCheck size={20} />,
        label: "Attendance",
        path: "/teacher/attendance",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Grades",
        path: "/teacher/grades",
      },
      {
        icon: <BookOpen size={20} />,
        label: "Assignments",
        path: "/teacher/assignments",
      },
      {
        icon: <Calendar size={20} />,
        label: "Events",
        path: "/teacher/events",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Messages",
        path: "/teacher/messages",
      },
      {
        icon: <UserCircle size={20} />,
        label: "Profile",
        path: "/teacher/profile",
      },
    ],
    student: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Dashboard",
        path: "/student/dashboard",
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Grades",
        path: "/student/grades",
      },
      {
        icon: <UserRound size={20} />,
        label: "Attendance",
        path: "/student/attendance",
      },
      {
        icon: <BookOpen size={20} />,
        label: "Assignments",
        path: "/student/assignments",
      },
      {
        icon: <CalendarDays size={20} />,
        label: "Events",
        path: "/student/events",
      },
      {
        icon: <MessageSquare size={20} />,
        label: "Messages",
        path: "/student/messages",
      },
      {
        icon: <FileText size={20} />,
        label: "Applications",
        path: "/student/applications",
      },
      {
        icon: <UserCircle size={20} />,
        label: "Profile",
        path: "/student/profile",
      },
    ],
  };

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
      }}
    >
      {/* School branding (logo + name from Settings) */}
      <div className="sidebar-brand">
        <div
          className={
            showImageLogo
              ? "sidebar-brand__mark"
              : "sidebar-brand__mark sidebar-brand__mark--fallback"
          }
        >
          {showImageLogo ? (
            <img
              className="sidebar-brand__img"
              src={schoolLogo.trim()}
              alt={`${displaySchoolName} logo`}
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <GraduationCap size={24} strokeWidth={1.5} />
          )}
        </div>
        <div className="sidebar-brand__text">
          <h2>{displaySchoolName}</h2>
          <p>{role.charAt(0).toUpperCase() + role.slice(1)} Portal</p>
        </div>
      </div>

      {/* Profile Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
          padding: "12px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "#f8fafc",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--primary-color)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "16px",
            flexShrink: 0,
          }}
        >
          {user?.name?.substring(0, 2).toUpperCase() || "AU"}
        </div>
        <div>
          <p
            style={{
              fontWeight: "600",
              fontSize: "14px",
              color: "var(--text-main)",
            }}
          >
            {user?.name || "User"}
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {user?.email || "email@school.com"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {menuItems[role]?.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const isMessages = item.path.includes("/messages");
          const showBadge = isMessages && unreadCount > 0;
          return (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 12px",
                borderRadius: "var(--radius-lg)",
                marginBottom: "6px",
                cursor: "pointer",
                color: isActive ? "var(--primary-color)" : "var(--text-muted)",
                backgroundColor: isActive
                  ? "var(--primary-light)"
                  : "transparent",
                fontWeight: isActive ? "600" : "500",
                fontSize: "14px",
                transition: "all 0.2s ease",
                border: isActive
                  ? "1px solid #dbeafe"
                  : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {/* Icon wrapper — badge lives here */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {item.icon}
                {showBadge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      background: "#ef4444",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "17px",
                      height: "17px",
                      fontSize: "10px",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      lineHeight: 1,
                      animation: "badgePulse 2s infinite",
                      border: "2px solid var(--sidebar-bg, white)",
                      zIndex: 10,
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span style={{ flex: 1 }}>{item.label}</span>
              {/* Compact count next to label */}
              {showBadge && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "10px",
                    padding: "1px 7px",
                    fontSize: "11px",
                    fontWeight: "700",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        onClick={logout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 12px",
          cursor: "pointer",
          color: "#ef4444",
          fontWeight: "600",
          fontSize: "14px",
          borderRadius: "var(--radius-lg)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#fee2e2";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;
