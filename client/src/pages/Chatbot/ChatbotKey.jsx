import React, { useState, useEffect } from "react";
import { Key, Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import API from "../../services/api";
import { Toaster, toast } from "react-hot-toast";
import "./Chatbot.css";

const ChatbotKey = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await API.get("/settings");
        setApiKey(res.data.geminiApiKey || "");
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings", { geminiApiKey: apiKey });
      toast.success("AI API Key updated successfully");
    } catch (err) {
      toast.error("Failed to update API Key");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="chatbot-settings-loading">
        <div className="admin-settings-loading__spinner" />
        <p>Loading AI configurations...</p>
      </div>
    );
  }

  return (
    <div className="chatbot-settings">
      <Toaster position="top-right" />
      <header className="chatbot-settings__header">
        <p className="chatbot-settings__eyebrow">AI Configuration</p>
        <h1 className="chatbot-settings__title">Chatbot API Key</h1>
        <p className="chatbot-settings__subtitle">
          Manage your Google Gemini API key to keep the AI Chatbot running smoothly.
        </p>
      </header>

      <form className="chatbot-settings__form" onSubmit={handleSave}>
        <div className="premium-card">
          <div className="chatbot-settings-section__head">
            <div className="chatbot-settings-section__icon">
              <Key size={22} strokeWidth={1.75} />
            </div>
            <div className="chatbot-settings-section__titles">
              <h2>Gemini API Key</h2>
              <p>Enter your Google AI Studio API key here.</p>
            </div>
          </div>

          <div className="chatbot-settings-field">
            <label htmlFor="apiKey" className="chatbot-settings-label">
              API Key
            </label>
            <div className="chatbot-settings-input-wrapper">
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                className="chatbot-settings-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                required
                style={{ paddingRight: "45px" }}
              />
              <Key className="input-icon" size={16} />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="eye-button"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="chatbot-settings-help">
              <AlertCircle size={12} />
              After expiring or if you get authentication errors, update the key here.
            </p>
          </div>

          <div className="chatbot-settings-actions">
            <button
              type="submit"
              className="chatbot-settings-btn chatbot-settings-btn--primary"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save API Key"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatbotKey;
