import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, RefreshCcw, X, MessageSquare } from "lucide-react";
import API from "../services/api";
import { Toaster, toast } from "react-hot-toast";
import "../pages/Chatbot/Chatbot.css";
import { useAuth } from "../context/AuthContext";

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hello! I am your school's AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Only show for admin
  if (user?.role !== 'admin') return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await API.post("/chatbot/ask", { message: input });
      const botMessage = {
        role: "bot",
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error. Please check your API key in settings or try again later.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget-container">
      <Toaster position="top-right" />
      
      {/* Floating Button */}
      <button 
        className={`chatbot-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && <span className="chatbot-fab-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <header className="chatbot-window-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__icon small">
                <Sparkles size={18} />
              </div>
              <div>
                <h2>AI Assistant</h2>
                <p>Online</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="chatbot-action-btn"
                onClick={() => setMessages([{
                    role: "bot",
                    content: "History cleared. How else can I help?",
                    timestamp: new Date(),
                  }])}
                title="Clear Chat"
              >
                <RefreshCcw size={14} />
              </button>
              <button className="chatbot-action-btn" onClick={() => setIsOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </header>

          <div className="chatbot-messages-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role} compact`}>
                <div className={`message-bubble ${msg.role} compact ${msg.isError ? "error" : ""}`}>
                  <div className="message-content">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper bot compact">
                <div className="message-bubble bot loading compact">
                  <Loader2 className="animate-spin" size={16} />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area compact" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
