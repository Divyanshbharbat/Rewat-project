import React, { useState } from "react";

const Form = ({ fields, onSubmit, initialValues, submitLabel }) => {
  const [values, setValues] = useState(initialValues || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleIdChange = (e, prefix) => {
    const { name, value } = e.target;
    // Ensure the prefix is always at the start
    const numericValue = value.replace(/\D/g, ""); // Only numbers
    const fullValue = prefix + numericValue;
    setValues({ ...values, [name]: fullValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {fields.map((field) => (
          <div
            key={field.name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              ...(field.fullWidth
                ? { gridColumn: "1 / -1" }
                : {}),
            }}
          >
            <label
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-main)",
              }}
            >
              {field.label}{" "}
              {field.required && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={values[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  backgroundColor: "white",
                  color: "var(--text-main)",
                  appearance: "none",
                  outline: "none",
                  transition: "border-color 0.2s",
                  cursor: "pointer",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              >
                <option value="" disabled>
                  Select {field.label}
                </option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={values[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                rows={field.rows || 4}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "96px",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            ) : field.prefix ? (
              // Composite ID field with prefix
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#f3f4f6",
                    color: "var(--text-main)",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    minWidth: "fit-content",
                    userSelect: "none",
                    borderRight: "1px solid var(--border-color)",
                  }}
                >
                  {field.prefix}
                </div>
                <input
                  type="text"
                  name={field.name}
                  value={(values[field.name] || "").replace(field.prefix, "")}
                  onChange={(e) => handleIdChange(e, field.prefix)}
                  required={field.required}
                  placeholder="001"
                  inputMode="numeric"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "none",
                    fontSize: "14px",
                    color: "var(--text-main)",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) =>
                    (e.parentElement.style.borderColor = "var(--primary-color)")
                  }
                  onBlur={(e) =>
                    (e.parentElement.style.borderColor = "var(--border-color)")
                  }
                />
              </div>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={values[field.name] || ""}
                onChange={handleChange}
                required={field.required}
                placeholder={
                  field.placeholder || `Enter ${field.label.toLowerCase()}`
                }
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "14px",
                  color: "var(--text-main)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary-color)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-color)")
                }
              />
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "10px",
        }}
      >
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "var(--primary-color)")
          }
        >
          {submitLabel || "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
