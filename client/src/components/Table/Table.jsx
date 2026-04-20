import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Table = ({
  columns,
  data,
  onEdit,
  onDelete,
  onRowClick,
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onNextPage,
  onPreviousPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              backgroundColor: "var(--primary-light)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "15px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--secondary-color)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th
                  style={{
                    padding: "15px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--secondary-color)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--bg-color)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: "15px 20px",
                        fontSize: "14px",
                        color: "var(--text-main)",
                        verticalAlign: "middle",
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td
                      style={{
                        padding: "15px 20px",
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "var(--primary-light)",
                              color: "var(--primary-color)",
                              fontSize: "13px",
                              fontWeight: "500",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--primary-color)";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--primary-light)";
                              e.currentTarget.style.color =
                                "var(--primary-color)";
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "#fee2e2",
                              color: "#ef4444",
                              fontSize: "13px",
                              fontWeight: "500",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#ef4444";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div
          style={{
            padding: "18px 20px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "rgba(37, 99, 235, 0.02)",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: "var(--text-muted)",
            }}
          >
            Showing{" "}
            <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              {startIndex}
            </span>{" "}
            to{" "}
            <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              {endIndex}
            </span>{" "}
            of{" "}
            <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>
              {totalItems}
            </span>{" "}
            entries
          </span>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor:
                  currentPage === 1 ? "#f3f4f6" : "var(--primary-light)",
                border:
                  currentPage === 1
                    ? "1px solid #e5e7eb"
                    : "1.5px solid var(--primary-color)",
                color: currentPage === 1 ? "#9ca3af" : "var(--primary-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow:
                  currentPage === 1
                    ? "none"
                    : "0 2px 4px rgba(37, 99, 235, 0.15)",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-color)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(37, 99, 235, 0.3)";
                  e.currentTarget.style.transform = "translateX(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-light)";
                  e.currentTarget.style.color = "var(--primary-color)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(37, 99, 235, 0.15)";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
              title="Previous page"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}
            >
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      backgroundColor:
                        pageNum === currentPage
                          ? "var(--primary-color)"
                          : "transparent",
                      color:
                        pageNum === currentPage ? "white" : "var(--text-main)",
                      border:
                        pageNum === currentPage
                          ? "none"
                          : "1px solid var(--border-color)",
                      fontSize: "13px",
                      fontWeight: pageNum === currentPage ? "600" : "500",
                      cursor: "pointer",
                      minWidth: "32px",
                      textAlign: "center",
                      transition: "all 0.2s",
                      boxShadow:
                        pageNum === currentPage
                          ? "0 2px 6px rgba(37, 99, 235, 0.2)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (pageNum !== currentPage) {
                        e.currentTarget.style.backgroundColor =
                          "var(--primary-light)";
                        e.currentTarget.style.color = "var(--primary-color)";
                        e.currentTarget.style.borderColor =
                          "var(--primary-color)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pageNum !== currentPage) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-main)";
                        e.currentTarget.style.borderColor =
                          "var(--border-color)";
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor:
                  currentPage === totalPages
                    ? "#f3f4f6"
                    : "var(--primary-light)",
                border:
                  currentPage === totalPages
                    ? "1px solid #e5e7eb"
                    : "1.5px solid var(--primary-color)",
                color:
                  currentPage === totalPages
                    ? "#9ca3af"
                    : "var(--primary-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow:
                  currentPage === totalPages
                    ? "none"
                    : "0 2px 4px rgba(37, 99, 235, 0.15)",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-color)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(37, 99, 235, 0.3)";
                  e.currentTarget.style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-light)";
                  e.currentTarget.style.color = "var(--primary-color)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(37, 99, 235, 0.15)";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
              title="Next page"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
