import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Mail,
  Phone,
  UserRound,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import API from "../../services/api";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  const fetchProfile = useCallback(
    async (opts = {}) => {
      const silent = Boolean(opts.silent);
      if (!silent) setLoading(true);
      try {
        const endpoint =
          user.role === "student" ? "/student/profile" : "/teacher/profile";
        const res = await API.get(endpoint, getHeaders());
        if (res.data) setProfile(res.data);
      } catch (error) {
        toast.error("Failed to fetch profile");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user?.token) fetchProfile();
  }, [user?.token, fetchProfile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint =
        user.role === "student" ? "/student/profile" : "/teacher/profile";
      await API.put(endpoint, profile, getHeaders());
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="profile-page">
        <Toaster position="top-right" />
        <div className="premium-card profile-loading">
          <div className="profile-loading__spinner" aria-hidden />
          <p>Loading your profile…</p>
        </div>
      </div>
    );

  const isStudent = user.role === "student";

  const studentClassLabel = () => {
    const c = profile?.class;
    if (!c) return null;
    if (typeof c === "object" && c.className) {
      const sec = c.section ? `-${c.section}` : "";
      return `${c.className}${sec}`;
    }
    return null;
  };

  const getFirstName = () => {
    if (profile?.firstName) return profile.firstName;
    if (profile?.name) return profile.name.split(" ")[0];
    return "";
  };

  const getLastName = () => {
    if (profile?.lastName) return profile.lastName;
    if (profile?.name) {
      const parts = profile.name.split(" ");
      return parts.slice(1).join(" ");
    }
    return "";
  };

  const displayName = () => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName} ${profile.lastName}`;
    return profile?.name || "";
  };

  const getInitial = () => {
    const first = getFirstName()?.charAt(0) || "";
    const last = getLastName()?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  const formatPhone = (p) => {
    if (p && String(p).trim()) return p;
    return "Not set";
  };

  return (
    <div className="profile-page">
      <Toaster position="top-right" />
      <header className="profile-page__header">
        <p className="profile-page__eyebrow">Account</p>
        <h1 className="profile-page__title">My profile</h1>
        <p className="profile-page__subtitle">
          {isStudent
            ? "Update how you appear in class and keep your contact details current."
            : "Manage your teaching profile and contact information in one place."}
        </p>
      </header>

      <div className="profile-layout">
        <aside className="premium-card profile-hero">
          <div className="profile-hero__avatar-wrap">
            <div className="profile-hero__avatar">{getInitial()}</div>
          </div>
          <h2 className="profile-hero__name">{displayName()}</h2>
          {isStudent ? (
            <>
              <p className="profile-hero__line">
                {studentClassLabel() || "Class not assigned"}
              </p>
              <p className="profile-hero__line profile-hero__line--muted">
                Student ID · {profile?.studentId ?? "—"}
              </p>
              <span className="profile-hero__badge">
                <GraduationCap size={14} aria-hidden />
                Student
              </span>
            </>
          ) : (
            <>
              <p className="profile-hero__line">
                {profile?.subject?.trim() || "Subjects not set"}
              </p>
              <p className="profile-hero__line profile-hero__line--muted">
                {profile?.department
                  ? `${profile.department} · Faculty`
                  : "Faculty staff"}
              </p>
              <span className="profile-hero__badge profile-hero__badge--faculty">
                <Briefcase size={14} aria-hidden />
                Teacher
              </span>
            </>
          )}
          <button type="button" className="profile-hero__photo-btn">
            Change photo
          </button>

          <div className="profile-hero__divider">
            <div className="profile-hero__contact">
              <div className="profile-hero__contact-icon">
                <Mail size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="profile-hero__contact-label">Email</p>
                <p className="profile-hero__contact-value">
                  {profile?.email ?? "—"}
                </p>
              </div>
            </div>
            <div className="profile-hero__contact">
              <div className="profile-hero__contact-icon">
                <Phone size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="profile-hero__contact-label">Phone</p>
                <p className="profile-hero__contact-value">
                  {formatPhone(profile?.phone)}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <section className="premium-card profile-section">
            <div className="profile-section__head">
              <div className="profile-section__icon">
                <UserRound size={22} strokeWidth={1.75} />
              </div>
              <div className="profile-section__titles">
                <h3>Personal information</h3>
                <p>
                  Name and phone can be edited. Email is managed by your school
                  administrator.
                </p>
              </div>
            </div>
            <div className="profile-section__grid">
              <div>
                <label className="profile-label" htmlFor="profile-first">
                  First name
                </label>
                <input
                  id="profile-first"
                  className="profile-input"
                  value={getFirstName()}
                  onChange={(e) => {
                    const lastName = getLastName();
                    setProfile({
                      ...profile,
                      firstName: e.target.value,
                      lastName: lastName,
                      name: `${e.target.value} ${lastName}`.trim(),
                    });
                  }}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="profile-label" htmlFor="profile-last">
                  Last name
                </label>
                <input
                  id="profile-last"
                  className="profile-input"
                  value={getLastName()}
                  onChange={(e) => {
                    const firstName = getFirstName();
                    setProfile({
                      ...profile,
                      lastName: e.target.value,
                      firstName: firstName,
                      name: `${firstName} ${e.target.value}`.trim(),
                    });
                  }}
                  autoComplete="family-name"
                />
              </div>
              <div className="profile-field--full">
                <label className="profile-label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  className="profile-input"
                  value={profile?.email || ""}
                  disabled
                  aria-readonly="true"
                />
              </div>
              <div className="profile-field--full">
                <label className="profile-label" htmlFor="profile-phone">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  className="profile-input"
                  value={profile?.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="e.g. 98765 43210"
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          {!isStudent && (
            <section className="premium-card profile-section">
              <div className="profile-section__head">
                <div className="profile-section__icon profile-section__icon--pro">
                  <Briefcase size={22} strokeWidth={1.75} />
                </div>
                <div className="profile-section__titles">
                  <h3>Professional information</h3>
                  <p>Subjects and department shown on your school profile.</p>
                </div>
              </div>
              <div className="profile-section__grid">
                <div>
                  <label className="profile-label" htmlFor="profile-subject">
                    Subject
                  </label>
                  <input
                    id="profile-subject"
                    className="profile-input"
                    value={profile?.subject || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, subject: e.target.value })
                    }
                    placeholder="e.g. Mathematics, Physics"
                  />
                </div>
                <div>
                  <label className="profile-label" htmlFor="profile-dept">
                    Department
                  </label>
                  <input
                    id="profile-dept"
                    className="profile-input"
                    value={profile?.department || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                    placeholder="e.g. Science"
                  />
                </div>
              </div>
            </section>
          )}

          <div className="profile-actions">
            <button
              type="button"
              className="profile-btn profile-btn--secondary"
              onClick={() => fetchProfile({ silent: true })}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProfileUpdate}
              className="profile-btn profile-btn--primary"
              disabled={saving}
            >
              <Save size={18} strokeWidth={2} aria-hidden />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
