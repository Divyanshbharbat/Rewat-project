import React, { useState, useEffect } from "react";
import { Mail, Send } from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, admin, teacher, student

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  // Get all sender roles that the current user can receive from
  const getAllowedSenderRoles = (userRole) => {
    const roleMap = {
      student: ["teacher", "admin"],
      teacher: ["admin", "student"],
      admin: ["teacher", "student"],
    };
    return roleMap[userRole] || [];
  };

  // Filter messages by sender role
  const getFilteredMessages = () => {
    if (activeTab === "all") return messages;
    return messages.filter(
      (msg) =>
        msg.senderId?.role === activeTab &&
        (msg.senderId?._id === user?._id || msg.receiverId?._id === user?._id),
    );
  };

  useEffect(() => {
    if (user && user.token) {
      fetchMessages();
      fetchRecipients();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/messages", getHeaders());
      setMessages(res.data);
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await API.get("/messages/recipients", getHeaders());
      setRecipients(res.data);
    } catch (error) {
      console.error("Failed to fetch recipients");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!receiverId || !newMessage.trim()) {
      toast.error("Please select a recipient and type a message");
      return;
    }

    try {
      await API.post(
        "/messages",
        { receiverId, message: newMessage },
        getHeaders(),
      );
      toast.success("Message sent successfully!");
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to send message";
      toast.error(errorMsg);
    }
  };

  const filteredMessages = getFilteredMessages();
  const allowedRoles = getAllowedSenderRoles(user?.role);

  return (
    <div>
      <Toaster position="top-right" />
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{ fontSize: "28px", marginBottom: "8px", fontWeight: "700" }}
        >
          Messages
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {user?.role === "student" && "You can message teachers and admins"}
          {user?.role === "teacher" && "You can message admins and students"}
          {user?.role === "admin" && "You can message teachers and students"}
        </p>
      </div>

      <div
        style={{ display: "flex", gap: "30px", height: "calc(100vh - 220px)" }}
      >
        {/* Inbox Left Side */}
        <div
          className="premium-card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "0",
            overflow: "hidden",
          }}
        >
          {/* Tabs Header */}
          <div
            style={{
              padding: "0",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-color)",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Mail size={20} color="var(--primary-color)" />
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                Messages by Category
              </h2>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0",
                padding: "0 20px",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <button
                onClick={() => setActiveTab("all")}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  backgroundColor:
                    activeTab === "all"
                      ? "var(--primary-color)"
                      : "transparent",
                  color: activeTab === "all" ? "white" : "var(--text-muted)",
                  fontWeight: "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderBottom:
                    activeTab === "all"
                      ? "3px solid var(--primary-color)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                All Messages
              </button>
              {allowedRoles.includes("admin") && (
                <button
                  onClick={() => setActiveTab("admin")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor:
                      activeTab === "admin"
                        ? "var(--primary-color)"
                        : "transparent",
                    color:
                      activeTab === "admin" ? "white" : "var(--text-muted)",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "admin"
                        ? "3px solid var(--primary-color)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  From Admins
                </button>
              )}
              {allowedRoles.includes("teacher") && (
                <button
                  onClick={() => setActiveTab("teacher")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor:
                      activeTab === "teacher"
                        ? "var(--primary-color)"
                        : "transparent",
                    color:
                      activeTab === "teacher" ? "white" : "var(--text-muted)",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "teacher"
                        ? "3px solid var(--primary-color)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  From Teachers
                </button>
              )}
              {allowedRoles.includes("student") && (
                <button
                  onClick={() => setActiveTab("student")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor:
                      activeTab === "student"
                        ? "var(--primary-color)"
                        : "transparent",
                    color:
                      activeTab === "student" ? "white" : "var(--text-muted)",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom:
                      activeTab === "student"
                        ? "3px solid var(--primary-color)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  From Students
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              padding: "20px",
            }}
          >
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  paddingTop: "40px",
                }}
              >
                Loading conversation...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  paddingTop: "40px",
                }}
              >
                No messages in this category. Start a conversation!
              </div>
            ) : (
              [...filteredMessages].reverse().map((msg) => {
                const isMe =
                  msg.senderId?._id === user?._id || msg.senderId === user?._id;
                return (
                  <div
                    key={msg._id}
                    style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: isMe
                          ? "var(--primary-color)"
                          : "#f1f5f9",
                        color: isMe ? "white" : "var(--text-main)",
                        padding: "12px 16px",
                        borderRadius: isMe
                          ? "18px 18px 2px 18px"
                          : "18px 18px 18px 2px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        position: "relative",
                      }}
                    >
                      {!isMe && (
                        <p
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                            marginBottom: "4px",
                            fontWeight: "600",
                          }}
                        >
                          {msg.senderId?.name || "User"}
                        </p>
                      )}
                      <p style={{ fontSize: "14px", lineHeight: "1.4" }}>
                        {msg.message}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                        padding: "0 4px",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Send Message Right Side */}
        <div
          className="premium-card"
          style={{ width: "380px", height: "fit-content" }}
        >
          <div style={{ marginBottom: "25px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Compose Message
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Send a direct message to staff.
            </p>
          </div>

          <form
            onSubmit={handleSendMessage}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Recipient
              </label>
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
                required
              >
                <option value="">Select a person...</option>
                {recipients.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                    )
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Your Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={6}
                placeholder="Type your message here..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  outline: "none",
                  resize: "none",
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "14px",
                backgroundColor: "var(--primary-color)",
                color: "white",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
              }}
              onMouseOver={(e) => (e.target.style.opacity = "0.9")}
              onMouseOut={(e) => (e.target.style.opacity = "1")}
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
