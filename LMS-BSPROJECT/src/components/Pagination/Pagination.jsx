// src/components/Pagination/Pagination.jsx
import React from "react";

/**
 * Same-to-same design as ManageFeature.jsx pagination.
 * Props:
 *  - page: number (1-based)
 *  - setPage: fn(nextPage)
 *  - totalItems: number
 *  - pageSize: number
 *  - className?: string
 */
export default function Pagination({
  page,
  setPage,
  totalItems,
  pageSize,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (pageSize || 1)));
  if (totalPages <= 1) return null;

  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);

  return (
    <div className={`mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{totalItems === 0 ? 0 : startIdx + 1}</span>–
        <span className="font-medium">{endIdx}</span> of{" "}
        <span className="font-semibold">{totalItems}</span>
      </div>

      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          « Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const n = i + 1;
          const active = n === page;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                active
                  ? "bg-gray-100 border-gray-300 text-gray-900 font-medium"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next »
        </button>
      </div>
    </div>
  );
}
