import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  BookOpen,
  CalendarCheck,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
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
        icon: <Calendar size={20} />,
        label: "Schedule",
        path: "/student/schedule",
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
        icon: <MessageSquare size={20} />,
        label: "Messages",
        path: "/student/messages",
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
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--primary-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <GraduationCap size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-main)",
            }}
          >
            SchoolERP
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </p>
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
              {item.icon}
              <span>{item.label}</span>
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
