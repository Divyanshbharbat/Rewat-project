import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";
import { MessageSquare } from "lucide-react";

const NotificationContext = createContext();

// ── Plays a WhatsApp-style double-beep via Web Audio API ──────────────────────
const playNotificationSound = () => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();

    const playBeep = (startTime, freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.setValueAtTime(0.22, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
      osc.start(startTime);
      osc.stop(startTime + 0.22);
    };

    // Two quick beeps like WhatsApp
    playBeep(ctx.currentTime, 880);
    playBeep(ctx.currentTime + 0.28, 1050);
  } catch (_) {
    // Silent fail — audio permissions/support vary
  }
};

// ── WhatsApp-style toast notification ─────────────────────────────────────────
const showMessageToast = (senderName, newCount) => {
  toast.custom(
    (t) => (
      <div
        onClick={() => toast.dismiss(t.id)}
        style={{
          background: "linear-gradient(135deg, #075e54 0%, #128c7e 100%)",
          color: "white",
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 8px 32px rgba(7,94,84,0.45)",
          minWidth: "260px",
          maxWidth: "340px",
          cursor: "pointer",
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateX(0)" : "translateX(110%)",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          userSelect: "none",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MessageSquare size={19} color="white" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "2px",
              letterSpacing: "0.2px",
            }}
          >
            {senderName}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.82 }}>
            {newCount} new message{newCount > 1 ? "s" : ""}
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            background: "#25d366",
            borderRadius: "50%",
            width: "22px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "800",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(37,211,102,0.5)",
          }}
        >
          {newCount > 9 ? "9+" : newCount}
        </div>
      </div>
    ),
    { duration: 5000, position: "bottom-right" }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadPerSender, setUnreadPerSender] = useState({}); // { senderId: { count, name } }

  const isFirstFetch = useRef(true);
  const prevPerSender = useRef({}); // { senderId: count } — used to diff

  // ── Request browser notification permission once ──────────────────────────
  const requestPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  // ── Show native browser notification ─────────────────────────────────────
  const showBrowserNotif = useCallback((senderName, count) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(`💬 ${senderName}`, {
          body: `${count} new message${count > 1 ? "s" : ""}`,
          icon: "/favicon.ico",
          tag: `msg-${senderName}`,
          requireInteraction: false,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
        setTimeout(() => n.close(), 5000);
      } catch (_) {}
    }
  }, []);

  // ── Mark a contact's messages as read (call server + optimistic update) ──
  const markContactAsRead = useCallback(
    async (senderId) => {
      if (!user?.token || !senderId) return;
      try {
        await fetch(`http://localhost:5000/api/messages/read/${senderId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}` },
        });
      } catch (_) {}

      // Optimistic local update
      setUnreadPerSender((prev) => {
        const removedCount = prev[senderId]?.count || 0;
        const updated = { ...prev };
        delete updated[senderId];
        setUnreadCount((c) => Math.max(0, c - removedCount));
        // Sync ref so next poll doesn't re-trigger notification
        delete prevPerSender.current[senderId];
        return updated;
      });
    },
    [user]
  );

  // ── Main polling loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token) {
      setUnreadCount(0);
      setUnreadPerSender({});
      prevPerSender.current = {};
      isFirstFetch.current = true;
      document.title = "SchoolERP";
      return;
    }

    requestPermission();
    isFirstFetch.current = true;

    const poll = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/messages/unread-count",
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();

        const newTotal = data.total || 0;
        const newPerSender = {};
        (data.perSender || []).forEach((s) => {
          newPerSender[s._id] = { count: s.count, name: s.senderName || "Someone" };
        });

        // ── Detect new messages (skip on very first fetch) ───────────────
        if (!isFirstFetch.current) {
          (data.perSender || []).forEach((sender) => {
            const prev = prevPerSender.current[sender._id] || 0;
            const diff = sender.count - prev;
            if (diff > 0) {
              playNotificationSound();
              showMessageToast(sender.senderName || "New Message", diff);
              showBrowserNotif(sender.senderName || "New Message", diff);
            }
          });
        }

        isFirstFetch.current = false;

        // Update ref for next diff
        prevPerSender.current = {};
        (data.perSender || []).forEach((s) => {
          prevPerSender.current[s._id] = s.count;
        });

        setUnreadCount(newTotal);
        setUnreadPerSender(newPerSender);

        // ── Animate browser tab title ────────────────────────────────────
        document.title = newTotal > 0 ? `(${newTotal}) SchoolERP` : "SchoolERP";
      } catch (_) {
        // Network error — silently ignore
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [user?.token, requestPermission, showBrowserNotif]);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, unreadPerSender, markContactAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
