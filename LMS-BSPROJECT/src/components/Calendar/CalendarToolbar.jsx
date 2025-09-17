import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarToolbar({ monthDate, onPrev, onNext }) {
  const [view, setView] = useState("Month"); // placeholder (Month only)
  const [course, setCourse] = useState("All courses");

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* View dropdown (disabled states for now, like the screenshot) */}
        <div className="relative inline-block">
          <button
            className="px-3 py-2 text-sm font-medium bg-gray-600 text-white rounded shadow-sm"
            onClick={() => null}
          >
            {view}
          </button>
        </div>

        {/* Course filter (visual only / demo) */}
        <div className="relative inline-block">
          <button
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded"
            onClick={() => null}
          >
            {course}
            <span className="ml-2 text-gray-400">•</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-50"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          className="ml-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded"
          onClick={() => alert("New event modal")}
        >
          New event
        </button>
      </div>
    </div>
  );
}
