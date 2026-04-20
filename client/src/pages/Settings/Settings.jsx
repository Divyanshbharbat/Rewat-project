import React, { useState, useEffect, useCallback } from "react";
import { Save, School, MapPin, Mail, Phone } from "lucide-react";
import API from "../../services/api";
import { Toaster, toast } from "react-hot-toast";
import { useSchoolSettings } from "../../context/SchoolSettingsContext";
import "./Settings.css";

const Settings = () => {
  const { refreshSchoolSettings } = useSchoolSettings();
  const [settings, setSettings] = useState({
    schoolName: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async (opts = {}) => {
    const silent = Boolean(opts.silent);
    if (!silent) setLoading(true);
    try {
      const response = await API.get("/settings");
      if (response.data) {
        setSettings({
          schoolName: response.data.schoolName || "",
          address: response.data.address || "",
          contactEmail: response.data.contactEmail || "",
          contactPhone: response.data.contactPhone || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put("/settings", {
        schoolName: settings.schoolName,
        address: settings.address,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
      });
      await refreshSchoolSettings();
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings">
        <Toaster position="top-right" />
        <div className="premium-card admin-settings-loading">
          <div className="admin-settings-loading__spinner" aria-hidden />
          <p>Loading system settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <Toaster position="top-right" />
      <header className="admin-settings__header">
        <p className="admin-settings__eyebrow">Administration</p>
        <h1 className="admin-settings__title">System settings</h1>
        <p className="admin-settings__subtitle">
          School-wide details used across reports, headers, and contact
          information. Changes apply after you save.
        </p>
      </header>

      <form className="admin-settings__stack" onSubmit={handleSubmit}>
        <section className="admin-settings-section">
          <div className="premium-card">
            <div className="admin-settings-section__head">
              <div className="admin-settings-section__icon">
                <School size={22} strokeWidth={1.75} />
              </div>
              <div className="admin-settings-section__titles">
                <h2>School identity</h2>
                <p>Official name shown in the app sidebar and reports.</p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-settings-field--full">
                <label className="admin-settings-label" htmlFor="schoolName">
                  <School size={14} aria-hidden />
                  School name
                </label>
                <input
                  id="schoolName"
                  type="text"
                  name="schoolName"
                  className="admin-settings-input"
                  value={settings.schoolName}
                  onChange={handleChange}
                  required
                  autoComplete="organization"
                  placeholder="e.g. Riverside High School"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="admin-settings-section">
          <div className="premium-card">
            <div className="admin-settings-section__head">
              <div className="admin-settings-section__icon admin-settings-section__icon--contact">
                <MapPin size={22} strokeWidth={1.75} />
              </div>
              <div className="admin-settings-section__titles">
                <h2>Location &amp; contact</h2>
                <p>Address and how parents or staff can reach the office.</p>
              </div>
            </div>

            <div className="admin-settings-grid">
              <div className="admin-settings-field--full">
                <label className="admin-settings-label" htmlFor="address">
                  <MapPin size={14} aria-hidden />
                  Full address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="admin-settings-input admin-settings-textarea"
                  value={settings.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Street, city, state / region, postal code"
                />
              </div>
              <div>
                <label
                  className="admin-settings-label"
                  htmlFor="contactEmail"
                >
                  <Mail size={14} aria-hidden />
                  Contact email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  name="contactEmail"
                  className="admin-settings-input"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="office@school.edu"
                />
              </div>
              <div>
                <label
                  className="admin-settings-label"
                  htmlFor="contactPhone"
                >
                  <Phone size={14} aria-hidden />
                  Contact phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  name="contactPhone"
                  className="admin-settings-input"
                  value={settings.contactPhone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="Main office line"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="admin-settings-actions">
          <button
            type="button"
            className="admin-settings-btn admin-settings-btn--secondary"
            disabled={saving}
            onClick={() => fetchSettings({ silent: true })}
          >
            Reset
          </button>
          <button
            type="submit"
            className="admin-settings-btn admin-settings-btn--primary"
            disabled={saving}
          >
            <Save size={18} strokeWidth={2} aria-hidden />
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
