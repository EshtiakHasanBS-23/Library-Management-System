function getMonthMatrix(monthDate) {
  // Build a 6x7 (weeks x days) matrix starting from Monday
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstDay = firstOfMonth.getDay(); // 0=Sun..6=Sat
  // Convert to Monday-based index: Mon=0..Sun=6
  const mondayIndex = (firstDay + 6) % 7;

  // Start date is the Monday of the first grid week
  const gridStart = new Date(year, month, 1 - mondayIndex);

  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + (w * 7 + d)
      );
      days.push(date);
    }
    weeks.push(days);
  }
  return weeks;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarGrid({ monthDate, today }) {
  const matrix = getMonthMatrix(monthDate);
  const month = monthDate.getMonth();

  return (
    <div className="w-full">
      {/* Month name row above grid like in the screenshot */}
      <div className="flex items-center justify-between px-3 py-2 border-b text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">&lt;</span>
          <span className="text-gray-700">
            {
              new Intl.DateTimeFormat(undefined, { month: "long" })
                .format(new Date(monthDate.getFullYear(), month - 1, 1))
            }
          </span>
        </div>

        <div className="font-medium">
          {
            new Intl.DateTimeFormat(undefined, {
              month: "long",
              year: "numeric",
            }).format(monthDate)
          }
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-700">
            {new Intl.DateTimeFormat(undefined, { month: "long" })
              .format(new Date(monthDate.getFullYear(), month + 1, 1))}
          </span>
          <span className="text-gray-500">&gt;</span>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 text-xs text-gray-600">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-3 py-2 border-b bg-gray-50">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-sm">
        {matrix.flatMap((week, wi) =>
          week.map((date, di) => {
            const inMonth = date.getMonth() === month;
            const isToday = isSameDate(date, today);

            return (
              <div
                key={`${wi}-${di}`}
                className={[
                  "h-16 sm:h-20 border-t border-r first:border-l px-3 py-2 relative",
                  !inMonth ? "bg-gray-50/50 text-gray-400" : "bg-white text-gray-800",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-2 left-3 inline-flex items-center justify-center w-6 h-6 text-xs",
                    "rounded-full",
                    isToday ? "bg-sky-500 text-white font-semibold" : "",
                  ].join(" ")}
                  title={date.toDateString()}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
