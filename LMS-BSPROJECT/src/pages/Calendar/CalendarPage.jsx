import { useEffect, useMemo, useState } from "react";
import CalendarToolbar from "../../components/Calendar/CalendarToolbar";
import CalendarGrid from "../../components/Calendar/CalendarGrid";
import EventLegend from "../../components/Calendar/EventLegend";
import SideNavigation from "../../components/Calendar/SideNavigation";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function CalendarPage() {
  // "today" updates automatically at midnight (so the highlight moves day-by-day)
  const [today, setToday] = useState(startOfDay(new Date()));
  const [monthDate, setMonthDate] = useState(startOfDay(new Date())); // which month we’re viewing

  // tick at the next midnight to refresh "today"
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const ms = nextMidnight.getTime() - now.getTime();
    const t = setTimeout(() => setToday(startOfDay(new Date())), ms);
    return () => clearTimeout(t);
  }, [today]);

  const title = useMemo(() => {
    const f = new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    });
    return f.format(monthDate);
  }, [monthDate]);

  const goPrevMonth = () =>
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="min-h-screen bg-white">
      {/* Top blue banner / page header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-400 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
        </div>
      </div>

      {/* Breadcrumb (light grey) */}
      <div className="bg-gray-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm text-gray-600">
          <span className="text-gray-500">Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left content (calendar) */}
        <div className="lg:col-span-8">
          <CalendarToolbar
            monthDate={monthDate}
            onPrev={goPrevMonth}
            onNext={goNextMonth}
          />

          <div className="mt-3 border border-gray-200 rounded-md overflow-hidden bg-white">
            <CalendarGrid monthDate={monthDate} today={today} />
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="text-sky-600 text-sm hover:underline"
              onClick={() => alert("Import/Export coming soon")}
            >
              Import or export calendars
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          <EventLegend />
          <SideNavigation />
        </div>
      </div>
    </div>
  );
}
