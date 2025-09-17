// Sidebar.jsx
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Star } from "lucide-react"; // use ChevronDown (rotates), keep Star for commented Ratings
import { Link, useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Development",
    subcategories: [
      "Web Development",
      "Data Science",
      "Mobile Development",
      "Software Testing",
      "Software Engineering",
      "Software Development Tools",
    ],
  },
  {
    name: "Business",
    subcategories: [
      "Entrepreneurship",
      "Business Analytics",
      "Management & Leadership",
      "Project Management",
    ],
  },
  {
    name: "Finance & Accounting",
    subcategories: [
      "Financial Analysis",
      "Financial Modeling",
      "Investing & Trading",
      "Banking & Insurance",
      "Cryptocurrency & Blockchain",
    ],
  },
  {
    name: "IT & Software",
    subcategories: [
      "Network & Security",
      "Hardware & Operating Systems",
      "Cloud Computing",
      "Database Management (SQL, NoSQL)",
    ],
  },
  {
    name: "Design",
    subcategories: [
      "UI/UX Design",
      "Graphic Design",
      "Branding & Identity",
      "Canva/Adobe Tools",
    ],
  },
  {
    name: "Marketing",
    subcategories: [
      "Digital Marketing",
      "Social Media Marketing",
      "SEO & SEM",
      "Content Strategy",
      "Email & Automation",
    ],
  },
];

const tools = [
  { name: "HTML 5", users: 1200 },
  { name: "CSS 3", users: 980 },
  { name: "React", users: 2200 },
  { name: "Webflow", users: 540 },
  { name: "Node.js", users: 870 },
  { name: "Laravel", users: 640 },
  { name: "SaaS", users: 400 },
  { name: "WordPress", users: 1250 },
];

const ratings = [
  { label: "5 Star" },
  { label: "4 Star & up" },
  { label: "3 Star & up" },
  { label: "2 Star & up" },
  { label: "1 Star & up" },
];

const durations = ["6-12 Months", "3-6 Months", "1-3 Months", "1-4 Weeks", "1-7 Days"];

// fixed window heights for the scroll areas
const CAT_MAX_H = "max-h-72";             // whole category list (mini scroll)
const SUB_MAX_H = "max-h-44 md:max-h-52"; // inner subcategory list (mini scroll)

export default function Sidebar({ onSelect }) {
  const navigate = useNavigate();

  const [expandedKey, setExpandedKey] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  // === Popup (toast) state — now includes `to` (link target)
  const [toast, setToast] = useState({ open: false, text: "", to: "" });

  useEffect(() => {
    let isMounted = true;
    fetch("/books.json")
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        setAllBooks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setAllBooks([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const setFilter = (payload) => {
    if (onSelect) {
      onSelect(payload);
    } else {
      if (payload) {
        navigate("/all-genres", { state: { filter: payload } });
      }
    }
  };

  const toggleExpand = (category) => {
    if (expandedKey === category) {
      setExpandedKey(null);
      setActiveCategory(null);
      setActiveSubcategory(null);
      if (onSelect) setFilter(null);
    } else {
      setExpandedKey(category);
      setActiveCategory(null);
      setActiveSubcategory(null);
      if (onSelect) setFilter(null);
    }
  };

  const categoryToSubs = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.name] = c.subcategories || [];
    });
    return map;
  }, []);

  const handleCategory = (name) => {
    setActiveCategory(name);
    setActiveSubcategory(null);
    const subs = categoryToSubs[name] || [];
    setFilter({
      type: "category",
      value: name,
      subcategories: subs, // lets Category page show all subcategory books
    });
  };

  // You call this in your JSX; keep behavior as-is
  const handleSubcategory = (sub, parent) => {
    setActiveCategory(parent);
    setActiveSubcategory(sub);
    setFilter({ type: "subcategory", value: sub, parent });
  };

  // counts (visual hint only — number of subitems)
  const catCounts = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c.name] = (c.subcategories || []).length));
    return m;
  }, []);

  // Reverse lookup (sub -> parent) to build link text/URL safely
  const subToParent = useMemo(() => {
    const m = {};
    categories.forEach((c) => (c.subcategories || []).forEach((s) => (m[s] = c.name)));
    return m;
  }, []);

  // checkbox UX helpers (don’t change your filter model)
  const toggleCategoryCheckbox = (catName) => {
    if (activeCategory === catName && !activeSubcategory) {
      setActiveCategory(null);
      setExpandedKey(null);
      setFilter(null);
    } else {
      handleCategory(catName);
      setExpandedKey(catName);
    }
  };
  const toggleSubcategoryCheckbox = (sub, parent) => {
    if (activeSubcategory === sub) {
      setActiveSubcategory(null);
      const subs = categoryToSubs[parent] || [];
      setFilter({ type: "category", value: parent, subcategories: subs });
    } else {
      handleSubcategory(sub, parent);
    }
  };

  const parseRatingValue = (label) => {
    const m = label.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };

  const ratingCountsReal = useMemo(() => {
    const counts = {};
    const ratingsOnly = (allBooks || []).map((b) => Number(b?.rating ?? 0));
    ratings.forEach(({ label }) => {
      const th = parseRatingValue(label) ?? 0;
      if (/^5\s*Star$/i.test(label)) {
        counts[label] = ratingsOnly.filter((r) => r >= 5).length;
      } else {
        counts[label] = ratingsOnly.filter((r) => r >= th).length;
      }
    });
    return counts;
  }, [allBooks]);

  const handleRatingClick = (label) => {
    const same = selectedRating === label;
    if (same) {
      setSelectedRating(null);
      setFilter(null);
    } else {
      setSelectedRating(label);
      const value = parseRatingValue(label);
      setFilter({ type: "rating", value });
    }
  };

  const handleDurationClick = (duration) => {
    const same = selectedDuration === duration;
    if (same) {
      setSelectedDuration(null);
      setFilter(null);
    } else {
      setSelectedDuration(duration);
      setFilter({ type: "duration", value: duration });
    }
  };

  // ===== Selection -> popup text and link ===================================
  const selectionText = () => {
    if (activeSubcategory) {
      const parent = activeCategory || subToParent[activeSubcategory] || "";
      return parent ? `${parent} • ${activeSubcategory}` : activeSubcategory;
    }
    if (activeCategory) return activeCategory;
    return "";
  };

  const selectionLink = () => {
    // Build a stable link to /all-genres with query params for the selection
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeSubcategory) {
      params.set("subcategory", activeSubcategory);
      // ensure parent category present even if state not set yet
      const parent = activeCategory || subToParent[activeSubcategory];
      if (parent) params.set("category", parent);
    }
    const qs = params.toString();
    return `/all-genres${qs ? `?${qs}` : ""}`;
  };

  const showToast = (text, to) => {
    if (!text) return;           // no popup if nothing selected
    setToast({ open: true, text, to });
  };

  return (
    <aside className="hidden md:block w-64 bg-white p-4 border-r border-gray-200 sticky top-28 overflow-y-hidden space-y-6">
      {/* Popup (center) with text + working × + View results link */}
      {toast.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="relative bg-white rounded-md shadow-lg px-6 py-4 text-gray-800">
            <button
              aria-label="Close"
              onClick={() => setToast({ open: false, text: "", to: "" })}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full w-6 h-6 leading-none grid place-items-center shadow"
            >
              ×
            </button>
            <div className="text-sm font-medium">{toast.text}</div>
            {toast.to ? (
              <div className="mt-2 text-xs">
                <Link to={toast.to} className="text-sky-600 hover:text-sky-700 underline">
                  View results
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Course categories */}
      <div>
        <h3 className="text-base font-semibold mb-2">Categories</h3>

        {/* OUTER CATEGORY LIST — mini, almost-hidden scrollbar (NO arrow buttons) */}
        <div
          className={`overflow-y-auto ${CAT_MAX_H} pr-1
            [scrollbar-gutter:stable]
            [scrollbar-width:thin]
            [-ms-overflow-style:none]
            [scrollbar-color:rgba(209,213,219,.25)_transparent]
            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-gray-300/30
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/60
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-button]:hidden
            [&::-webkit-scrollbar-button:single-button]:hidden
            [&::-webkit-scrollbar-button:vertical:decrement]:hidden
            [&::-webkit-scrollbar-button:vertical:increment]:hidden
            [&::-webkit-scrollbar-corner]:bg-transparent
          `}
        >
          {/* "All Genre" stays at top */}
          <ul className="space-y-1 mb-2">
            <li>
              <Link
                to="/all-genres"
                className="w-full text-left text-sm text-gray-700 px-2 py-2 rounded block hover:bg-sky-100 transition-all duration-200 font-medium"
              >
                All Genre
              </Link>
            </li>
          </ul>

          <ul className="space-y-1">
            {categories.map((cat) => {
              const open = expandedKey === cat.name;
              const catChecked = activeCategory === cat.name && !activeSubcategory;

              return (
                <li key={cat.name}>
                  {/* row: checkbox + label + (count) + chevron */}
                  <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-sky-50">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catChecked}
                        onChange={() => toggleCategoryCheckbox(cat.name)}
                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className={`text-sm ${catChecked ? "text-sky-700 font-medium" : "text-gray-700"}`}>
                        {cat.name}
                      </span>
                    </label>

                    <span className="text-xs text-gray-400 mr-2">({catCounts[cat.name] ?? 0})</span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(cat.name);
                      }}
                      aria-label={open ? "Collapse" : "Expand"}
                      className="p-1 rounded hover:bg-white/60"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${open ? "rotate-180" : ""} text-gray-500`}
                      />
                    </button>
                  </div>

                  {/* INNER SUBCATEGORY LIST — mini, almost-hidden scrollbar (NO arrow buttons) */}
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="min-h-0">
                      {open && (
                        <ul
                          className={`ml-6 mt-1 pr-1 space-y-1 overflow-y-auto ${SUB_MAX_H}
                            [scrollbar-gutter:stable]
                            [scrollbar-width:thin]
                            [-ms-overflow-style:none]
                            [scrollbar-color:rgba(209,213,219,.25)_transparent]
                            [&::-webkit-scrollbar]:w-[3px]
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-gray-300/30
                            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/60
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-button]:hidden
                            [&::-webkit-scrollbar-button:single-button]:hidden
                            [&::-webkit-scrollbar-button:vertical:decrement]:hidden
                            [&::-webkit-scrollbar-button:vertical:increment]:hidden
                            [&::-webkit-scrollbar-corner]:bg-transparent
                          `}
                          aria-label={`${cat.name} subcategories`}
                        >
                          {cat.subcategories.map((sub) => {
                            const subChecked = activeSubcategory === sub;
                            return (
                              <li key={sub}>
                                <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sky-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={subChecked}
                                    onChange={() => toggleSubcategoryCheckbox(sub, cat.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                  />
                                  <span className={`text-sm ${subChecked ? "text-sky-700 font-medium" : "text-gray-600"}`}>
                                    {sub}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ===== Tools Section temporarily commented out ===== */}
      {/* <div>
        <h3 className="text-sm font-bold mb-2">TOOLS</h3>
        <ul className="space-y-1">
          {tools.map((tool) => (
            <li
              key={tool.name}
              className="flex justify-between items-center px-2 py-2 rounded hover:bg-sky-100 transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setFilter({ type: "tool", value: tool.name })}
                className="text-sm text-gray-700 hover:text-sky-600 flex-1 text-left"
              >
                {tool.name}
              </button>
              <span className="text-xs text-gray-500">{tool.users}</span>
            </li>
          ))}
        </ul>
      </div> */}

      {/* ===== Rating Section temporarily commented out ===== */}
      {/* <div>
        <h3 className="text-sm font-bold mb-2">RATING</h3>
        <ul className="space-y-1">
          {ratings.map((rating) => {
            const label = rating.label;
            const checked = selectedRating === label;
            const count = ratingCountsReal[label] ?? 0;
            return (
              <li key={label}>
                <label className="flex items-center justify-between gap-2 text-sm px-2 py-2 cursor-pointer hover:bg-sky-100 rounded transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={checked}
                      onChange={() => handleRatingClick(label)}
                    />
                    <Star size={14} className="text-yellow-400" />
                    <span>{label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div> */}

      {/* ===== Duration Section temporarily commented out ===== */}
      {/* <div>
        <h3 className="text-sm font-bold mb-2">DURATION</h3>
        <ul className="space-y-1">
          {durations.map((duration) => {
            const checked = selectedDuration === duration;
            return (
              <li key={duration}>
                <label className="flex items-center gap-2 text-sm px-2 py-2 cursor-pointer hover:bg-sky-100 rounded transition-all duration-200">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={checked}
                    onChange={() => handleDurationClick(duration)}
                  />
                  {duration}
                </label>
              </li>
            );
          })}
        </ul>
      </div> */}

      {/* Footer Filter button (kept enabled as you asked) */}
      <div className="pt-1">
        <button
          // type="button"
          // onClick={() => {
            // do your original behavior
            // if (activeSubcategory) {
            //   setFilter({ type: "subcategory", value: activeSubcategory, parent: activeCategory });
            // } else if (activeCategory) {
            //   const subs = categoryToSubs[activeCategory] || [];
            //   setFilter({ type: "category", value: activeCategory, subcategories: subs });
            // }
            // show popup with safe text + link (only if something was selected)
          //   const text = selectionText();
          //   if (text) {
          //     const to = selectionLink();
          //     showToast(text, to);
          //   }
          // }}
          className="block mx-auto bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded px-5 py-2"
        >
          Filter
        </button>
      </div>
    </aside>
  );
}
