import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  X,
  Search,
  Clock,
  ChevronDown,
  MessageCircle,
  Trash2,
} from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNotifications } from "../../context/NotificationContext";

const Messages = () => {
  const { user } = useAuth();
  const { unreadPerSender, markContactAsRead } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    teachers: false,
    students: false,
    admins: false,
  });
  const messagesEndRef = React.useRef(null);
  // Ref so the polling interval can access selectedContact without stale closures
  const selectedContactRef = React.useRef(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  // Group messages by contact
  const getConversations = () => {
    const conversationMap = {};

    // Add all messages
    messages.forEach((msg) => {
      const otherUserId =
        msg.senderId?._id === user?._id
          ? msg.receiverId?._id
          : msg.senderId?._id;
      const otherUser =
        msg.senderId?._id === user?._id ? msg.receiverId : msg.senderId;

      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = {
          contact: otherUser,
          messages: [],
          lastMessage: null,
          lastTime: null,
        };
      }

      conversationMap[otherUserId].messages.push(msg);

      if (
        !conversationMap[otherUserId].lastTime ||
        new Date(msg.timestamp) >
          new Date(conversationMap[otherUserId].lastTime)
      ) {
        conversationMap[otherUserId].lastMessage = msg.message;
        conversationMap[otherUserId].lastTime = msg.timestamp;
      }
    });

    // Add all recipients that don't have conversations yet
    recipients.forEach((recipient) => {
      if (!conversationMap[recipient._id]) {
        conversationMap[recipient._id] = {
          contact: recipient,
          messages: [],
          lastMessage: null,
          lastTime: null,
        };
      }
    });

    return Object.values(conversationMap).sort((a, b) => {
      // Sort by last message time (newer first)
      if (a.lastTime && b.lastTime) {
        return new Date(b.lastTime) - new Date(a.lastTime);
      }
      if (a.lastTime) return -1;
      if (b.lastTime) return 1;
      // Then sort by name
      return a.contact?.name?.localeCompare(b.contact?.name || "");
    });
  };

  const getFilteredConversations = () => {
    const convs = getConversations();
    if (!searchTerm.trim()) return convs;

    return convs.filter((conv) =>
      conv.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // Group recipients by role
  const getGroupedRecipients = () => {
    const grouped = {
      teachers: [],
      students: [],
      admins: [],
    };

    recipients.forEach((recipient) => {
      if (
        searchTerm.trim() &&
        !recipient.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return;
      }

      if (recipient.role === "teacher") {
        grouped.teachers.push(recipient);
      } else if (recipient.role === "student") {
        grouped.students.push(recipient);
      } else if (recipient.role === "admin") {
        grouped.admins.push(recipient);
      }
    });

    return grouped;
  };

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Unread count per contact — sourced from server-side NotificationContext
  const getUnreadCount = (contactId) => {
    return unreadPerSender[contactId]?.count || 0;
  };

  // Calculate total unread message count for a group
  const getGroupUnreadCount = (group) => {
    return group.reduce((total, contact) => {
      return total + getUnreadCount(contact._id);
    }, 0);
  };

  // Select a contact and immediately mark their messages as read on the server
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    markContactAsRead(contact._id);
  };

  const getConversationMessages = () => {
    if (!selectedContact) return [];

    return messages
      .filter(
        (msg) =>
          (msg.senderId?._id === selectedContact._id &&
            msg.receiverId?._id === user?._id) ||
          (msg.senderId?._id === user?._id &&
            msg.receiverId?._id === selectedContact._id),
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  useEffect(() => {
    if (user && user.token) {
      fetchMessages();
      fetchRecipients();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedContact, messages]);

  // Keep selectedContactRef in sync so the interval below can read it
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && user.token) {
        fetchMessages();
        // While a conversation is open, keep marking incoming msgs as read
        if (selectedContactRef.current) {
          markContactAsRead(selectedContactRef.current._id);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get("/messages", getHeaders());
      setMessages(res.data || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await API.get("/messages/recipients", getHeaders());
      setRecipients(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!selectedContact || !newMessage.trim()) {
      toast.error("Please select a contact and type a message");
      return;
    }

    setSendingMessage(true);

    try {
      await API.post(
        "/messages",
        { receiverId: selectedContact._id, message: newMessage },
        getHeaders(),
      );

      setNewMessage("");
      await fetchMessages();
      toast.success("Message sent!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to send message";
      toast.error(errorMsg);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedContact) return;
    setClearingChat(true);
    try {
      await API.delete(`/messages/clear/${selectedContact._id}`, getHeaders());
      await fetchMessages();
      setShowClearConfirm(false);
      toast.success(`Chat with ${selectedContact.name} cleared!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear chat");
    } finally {
      setClearingChat(false);
    }
  };

  const conversations = getFilteredConversations();
  const conversationMessages = getConversationMessages();

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{ fontSize: "28px", marginBottom: "8px", fontWeight: "700" }}
        >
          Messages
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Chat with your teachers, admins, and students
        </p>
      </div>

      {/* CLEAR CHAT CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "380px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Trash2 size={26} color="#ef4444" />
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Clear Chat?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "28px",
                lineHeight: "1.6",
              }}
            >
              All messages with{" "}
              <strong style={{ color: "#111827" }}>
                {selectedContact?.name}
              </strong>{" "}
              will be permanently deleted for both sides.
            </p>

            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearingChat}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                disabled={clearingChat}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: clearingChat ? "#fca5a5" : "#ef4444",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: clearingChat ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!clearingChat)
                    e.currentTarget.style.background = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  if (!clearingChat)
                    e.currentTarget.style.background = "#ef4444";
                }}
              >
                <Trash2 size={14} />
                {clearingChat ? "Clearing..." : "Clear Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "0",
          height: "calc(100vh - 180px)",
          backgroundColor: "white",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}
      >
        {/* LEFT SIDEBAR - CONVERSATIONS */}
        <div
          style={{
            width: "360px",
            borderRight: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f8fafc",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
                color: "var(--text-main)",
              }}
            >
              Chats
            </h2>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                }}
              />
            </div>
          </div>

          {/* CONVERSATIONS LIST */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Clock
                  size={32}
                  style={{ margin: "0 auto 16px", opacity: 0.3 }}
                />
                <p>Loading contacts...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <Mail
                  size={32}
                  style={{ margin: "0 auto 16px", opacity: 0.3 }}
                />
                <p>No contacts available</p>
              </div>
            ) : (
              <>
                {(() => {
                  const grouped = getGroupedRecipients();
                  const hasAnyContacts =
                    grouped.teachers.length > 0 ||
                    grouped.students.length > 0 ||
                    grouped.admins.length > 0;

                  if (!hasAnyContacts) {
                    return (
                      <div
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Mail
                          size={32}
                          style={{ margin: "0 auto 16px", opacity: 0.3 }}
                        />
                        <p>No contacts available</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* TEACHERS GROUP */}
                      {grouped.teachers.length > 0 && (
                        <div>
                          <div
                            onClick={() => toggleGroup("teachers")}
                            style={{
                              padding: "12px 16px",
                              backgroundColor: "#f1f5f9",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderBottom: "1px solid var(--border-color)",
                              userSelect: "none",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e2e8f0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ChevronDown
                                size={16}
                                style={{
                                  transition: "transform 0.2s ease",
                                  transform: expandedGroups.teachers
                                    ? "rotate(0)"
                                    : "rotate(-90deg)",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "var(--text-main)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Teachers
                              </span>
                            </div>
                            {getGroupUnreadCount(grouped.teachers) > 0 && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {String(
                                  getGroupUnreadCount(grouped.teachers),
                                ).padStart(2, "0")}
                              </span>
                            )}
                          </div>

                          {expandedGroups.teachers &&
                            grouped.teachers.map((teacher) => (
                              <div
                                key={teacher._id}
                                onClick={() => handleSelectContact(teacher)}
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                  backgroundColor:
                                    selectedContact?._id === teacher._id
                                      ? "#eff6ff"
                                      : "transparent",
                                  borderLeft:
                                    selectedContact?._id === teacher._id
                                      ? "4px solid var(--primary-color)"
                                      : "4px solid transparent",
                                  transition: "all 0.2s ease",
                                  marginLeft: "12px",
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedContact?._id !== teacher._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "#f1f5f9";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedContact?._id !== teacher._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <h4
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "var(--text-main)",
                                      flex: 1,
                                    }}
                                  >
                                    {teacher.name}
                                  </h4>
                                  {getUnreadCount(teacher._id) > 0 && (
                                    <span
                                      style={{
                                        backgroundColor: "var(--primary-color)",
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        minWidth: "20px",
                                        textAlign: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {String(
                                        getUnreadCount(teacher._id),
                                      ).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* STUDENTS GROUP */}
                      {grouped.students.length > 0 && (
                        <div>
                          <div
                            onClick={() => toggleGroup("students")}
                            style={{
                              padding: "12px 16px",
                              backgroundColor: "#f1f5f9",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderBottom: "1px solid var(--border-color)",
                              userSelect: "none",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e2e8f0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ChevronDown
                                size={16}
                                style={{
                                  transition: "transform 0.2s ease",
                                  transform: expandedGroups.students
                                    ? "rotate(0)"
                                    : "rotate(-90deg)",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "var(--text-main)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Students
                              </span>
                            </div>
                            {getGroupUnreadCount(grouped.students) > 0 && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  backgroundColor: "#10b981",
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {String(
                                  getGroupUnreadCount(grouped.students),
                                ).padStart(2, "0")}
                              </span>
                            )}
                          </div>

                          {expandedGroups.students &&
                            grouped.students.map((student) => (
                              <div
                                key={student._id}
                                onClick={() => handleSelectContact(student)}
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                  backgroundColor:
                                    selectedContact?._id === student._id
                                      ? "#f0fdf4"
                                      : "transparent",
                                  borderLeft:
                                    selectedContact?._id === student._id
                                      ? "4px solid #10b981"
                                      : "4px solid transparent",
                                  transition: "all 0.2s ease",
                                  marginLeft: "12px",
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedContact?._id !== student._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "#f1f5f9";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedContact?._id !== student._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <h4
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "var(--text-main)",
                                      flex: 1,
                                    }}
                                  >
                                    {student.name}
                                  </h4>
                                  {getUnreadCount(student._id) > 0 && (
                                    <span
                                      style={{
                                        backgroundColor: "#10b981",
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        minWidth: "20px",
                                        textAlign: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {String(
                                        getUnreadCount(student._id),
                                      ).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* ADMINS GROUP */}
                      {grouped.admins.length > 0 && (
                        <div>
                          <div
                            onClick={() => toggleGroup("admins")}
                            style={{
                              padding: "12px 16px",
                              backgroundColor: "#f1f5f9",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderBottom: "1px solid var(--border-color)",
                              userSelect: "none",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#e2e8f0";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ChevronDown
                                size={16}
                                style={{
                                  transition: "transform 0.2s ease",
                                  transform: expandedGroups.admins
                                    ? "rotate(0)"
                                    : "rotate(-90deg)",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "700",
                                  color: "var(--text-main)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Admins
                              </span>
                            </div>
                            {getGroupUnreadCount(grouped.admins) > 0 && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  backgroundColor: "#f59e0b",
                                  color: "white",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {String(
                                  getGroupUnreadCount(grouped.admins),
                                ).padStart(2, "0")}
                              </span>
                            )}
                          </div>

                          {expandedGroups.admins &&
                            grouped.admins.map((admin) => (
                              <div
                                key={admin._id}
                                onClick={() => handleSelectContact(admin)}
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #e2e8f0",
                                  cursor: "pointer",
                                  backgroundColor:
                                    selectedContact?._id === admin._id
                                      ? "#fffbeb"
                                      : "transparent",
                                  borderLeft:
                                    selectedContact?._id === admin._id
                                      ? "4px solid #f59e0b"
                                      : "4px solid transparent",
                                  transition: "all 0.2s ease",
                                  marginLeft: "12px",
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedContact?._id !== admin._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "#f1f5f9";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedContact?._id !== admin._id) {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <h4
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "500",
                                      color: "var(--text-main)",
                                      flex: 1,
                                    }}
                                  >
                                    {admin.name}
                                  </h4>
                                  {getUnreadCount(admin._id) > 0 && (
                                    <span
                                      style={{
                                        backgroundColor: "#f59e0b",
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        minWidth: "20px",
                                        textAlign: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {String(
                                        getUnreadCount(admin._id),
                                      ).padStart(2, "0")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - CHAT AREA */}
        {selectedContact ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* CHAT HEADER */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "var(--primary-light)",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--text-main)",
                  }}
                >
                  {selectedContact.name}
                </h2>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {selectedContact.role.charAt(0).toUpperCase() +
                    selectedContact.role.slice(1)}
                </p>
              </div>

              {/* Header action buttons */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                {/* Clear chat button */}
                <button
                  onClick={() => setShowClearConfirm(true)}
                  title="Clear chat"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Trash2 size={18} />
                </button>

                {/* Close button */}
                <button
                  onClick={() => setSelectedContact(null)}
                  title="Close chat"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                backgroundColor: "#fcfcfc",
              }}
            >
              {conversationMessages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    paddingTop: "60px",
                  }}
                >
                  <Mail
                    size={48}
                    style={{ margin: "0 auto 16px", opacity: 0.3 }}
                  />
                  <p style={{ fontSize: "16px", fontWeight: "500" }}>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id;
                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        justifyContent: isMe ? "flex-end" : "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "55%",
                          backgroundColor: isMe
                            ? "var(--primary-color)"
                            : "#e2e8f0",
                          color: isMe ? "white" : "var(--text-main)",
                          padding: "10px 14px",
                          borderRadius: isMe
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          boxShadow: isMe
                            ? "0 2px 8px rgba(37, 99, 235, 0.2)"
                            : "0 2px 4px rgba(0,0,0,0.05)",
                          wordWrap: "break-word",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.5",
                            margin: "0",
                          }}
                        >
                          {msg.message}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            opacity: 0.7,
                            marginTop: "6px",
                            display: "block",
                            textAlign: "right",
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-color)",
                backgroundColor: "white",
                display: "flex",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sendingMessage}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "#f8fafc",
                  transition: "all 0.3s ease",
                  opacity: sendingMessage ? 0.6 : 1,
                  cursor: sendingMessage ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-color)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                style={{
                  padding: "12px 18px",
                  backgroundColor:
                    sendingMessage || !newMessage.trim()
                      ? "#cbd5e1"
                      : "var(--primary-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  cursor:
                    sendingMessage || !newMessage.trim()
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  opacity: sendingMessage || !newMessage.trim() ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!sendingMessage && newMessage.trim()) {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(37, 99, 235, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sendingMessage && newMessage.trim()) {
                    e.currentTarget.style.backgroundColor =
                      "var(--primary-color)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(37, 99, 235, 0.3)";
                  }
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Mail size={64} style={{ marginBottom: "24px", opacity: 0.2 }} />
              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
