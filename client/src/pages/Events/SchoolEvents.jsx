import React, { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import API from "../../services/api";
import { Toaster, toast } from "react-hot-toast";
import "./SchoolEvents.css";

const SchoolEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/events/upcoming");
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Could not load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <div className="school-events">
      <Toaster position="top-right" />
      <header className="school-events__header">
        <p className="school-events__eyebrow">School calendar</p>
        <h1 className="school-events__title">Upcoming events</h1>
        <p className="school-events__subtitle">
          Events published by your school administration. Times are shown in
          your browser&apos;s local timezone.
        </p>
      </header>

      {loading ? (
        <div className="premium-card school-events__loading">
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div className="premium-card school-events__empty">
          <Calendar size={40} strokeWidth={1.25} style={{ opacity: 0.35 }} />
          <p>No upcoming events right now.</p>
          <p style={{ fontSize: "0.875rem" }}>
            Check back later — new dates will appear here when admin adds them.
          </p>
        </div>
      ) : (
        <div className="school-events__list">
          {events.map((ev) => {
            const d = new Date(ev.date);
            const month = d.toLocaleString(undefined, { month: "short" });
            const day = d.getDate();
            return (
              <article key={ev._id} className="premium-card school-events__card">
                <div className="school-events__datebox" aria-hidden>
                  <div className="school-events__datebox-month">{month}</div>
                  <div className="school-events__datebox-day">{day}</div>
                </div>
                <div className="school-events__body">
                  <h3>{ev.title}</h3>
                  <div className="school-events__meta">
                    <span>
                      <Clock size={14} />
                      {d.toLocaleString(undefined, {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {ev.location ? (
                      <span>
                        <MapPin size={14} />
                        {ev.location}
                      </span>
                    ) : null}
                  </div>
                  {ev.description ? (
                    <p className="school-events__desc">{ev.description}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchoolEvents;
