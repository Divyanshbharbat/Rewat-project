import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar as CalendarIcon } from "lucide-react";
import API from "../../services/api";
import Table from "../../components/Table/Table";
import Modal from "../../components/Modal/Modal";
import Form from "../../components/Form/Form";
import { Toaster, toast } from "react-hot-toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/events");
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (event) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await API.delete(`/admin/events/${event._id}`);
        toast.success("Event deleted successfully");
        fetchEvents();
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        title: (values.title || "").trim(),
        location: (values.location || "").trim(),
        description: (values.description || "").trim(),
        date: values.date ? new Date(values.date).toISOString() : undefined,
      };
      if (!payload.title || !payload.date) {
        toast.error("Title and date are required");
        return;
      }
      if (currentEvent) {
        await API.put(`/admin/events/${currentEvent._id}`, payload);
        toast.success("Event updated successfully");
      } else {
        await API.post("/admin/events", payload);
        toast.success("Event added successfully");
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    {
      header: "Date",
      render: (row) =>
        new Date(row.date).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "Time",
      render: (row) =>
        new Date(row.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    { header: "Location", accessor: "location" },
  ];

  const formFields = [
    { name: "title", label: "Event Title", required: true },
    {
      name: "date",
      label: "Event Date & Time",
      type: "datetime-local",
      required: true,
    },
    { name: "location", label: "Location", required: false },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: false,
      fullWidth: true,
    },
  ];

  const filteredEvents = events.filter(
    (e) =>
      (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location &&
        e.location.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
            School Events
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage and schedule school-wide events and activities.
          </p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "var(--primary-color)")
          }
        >
          <Plus size={18} />
          Create Event
        </button>
      </div>

      <div className="premium-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ position: "relative", width: "300px" }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--primary-color)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-color)")
              }
            />
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            Loading...
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEvent ? "Edit Event" : "Create New Event"}
      >
        <Form
          key={currentEvent?._id || "new-event"}
          fields={formFields}
          initialValues={
            currentEvent
              ? {
                  title: currentEvent.title || "",
                  location: currentEvent.location || "",
                  description: currentEvent.description || "",
                  date: new Date(currentEvent.date)
                    .toISOString()
                    .slice(0, 16),
                }
              : {}
          }
          onSubmit={handleSubmit}
          submitLabel={currentEvent ? "Update Event" : "Create Event"}
        />
      </Modal>
    </div>
  );
};

export default Events;
