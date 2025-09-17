export default function EventLegend() {
  const items = [
    { color: "bg-sky-500", text: "Hide site events" },
    { color: "bg-green-500", text: "Hide category events" },
    { color: "bg-red-500", text: "Hide course events" },
    { color: "bg-yellow-500", text: "Hide group events" },
    { color: "bg-orange-500", text: "Hide user events" },
    { color: "bg-gray-400", text: "Hide other events" },
  ];

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <div className="px-4 py-3 border-b font-semibold text-gray-800">
        Events key
      </div>
      <ul className="p-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.text} className="flex items-center gap-3">
            <span className={`inline-flex w-5 h-5 rounded-full border border-gray-200 ${it.color}`} />
            <span className="text-gray-700">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
