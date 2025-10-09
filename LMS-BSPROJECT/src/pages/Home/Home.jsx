// src/pages/Home/Home.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Section from "../../components/Section/Section";
// import books from "../../data/sampleBooks";
import Navbar from "../../components/Navbar/Navbar";
import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
import NewBookCollections from "../../components/NewBookCollections/NewBookCollections";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Filter,
  X,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import axios from "axios";
export default function Home() {
  const [filter, setFilter] = useState(null);
  const [openFilters, setOpenFilters] = useState(false); // mobile sidebar
  const [openMenuId, setOpenMenuId] = useState(null); // kebab menu per-card
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);


  useEffect(() => {
  const fetchBooks = async () => {
    try {
      // Fetch all books, popular books, and categories
      const [booksRes, popularRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:8000/books"),
        axios.get("http://localhost:8000/books/popular"),
        axios.get("http://localhost:8000/categories")
      ]);

      const categories = categoriesRes.data;
      const allData = booksRes.data;
      const popularData = popularRes.data;

      // Normalize both book lists
      const normalize = (data) =>
        data.map((b) => {
          const category = categories.find(c => c.id === b.category_id)?.name || "Unknown";
          return {
            ...b,
            category,
            coverImage: b.image
              ? `http://localhost:8000/media/${b.image}`
              : "https://via.placeholder.com/150",
          };
        });

      setAllBooks(normalize(allData));

      setPopularBooks(normalize(popularData));

    } catch (err) {
      console.error("Failed to fetch books:", err);
      setAllBooks([]);
      setPopularBooks([]);
    }
  };

  fetchBooks();
}, []);


  const filtered = useMemo(() => {
    if (!filter) return [];

    if (filter.type === "all") return allBooks;

    if (filter.type === "category") {
      return allBooks.filter(
        (b) =>
          (b.category || "").toLowerCase() ===
          (filter.value || "").toLowerCase()
      );
    }

    if (filter.type === "subcategory") {
      return allBooks.filter(
        (b) =>
          (b.category || "").toLowerCase() ===
          (filter.parent || "").toLowerCase()
      );
    }

    return allBooks;
  }, [filter, allBooks]);

  

  const renderStars = (rating = 0) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < (rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));

  // Data
  /*const recommended = books?.recommended || [];
  const popular = books?.popular || [];*/
  const recommended = allBooks.slice(0, 12); // first 6 books as "recommended"
  const popular = popularBooks.slice(0, 12);    // next 6 books as "popular"

  // status helper
  const getStatus = (b) => {
    const raw = b.copies;
    if (typeof raw === "number" && raw < 1) return "Stock Out";
    if (raw === "available") return "Available";
    if (raw === "stock out" || raw === "out of stock" || raw === "out")
      return "Stock Out";
    if (raw === "upcoming" || raw === "coming soon") return "Upcoming";

    if ((b.title || "").toLowerCase().includes("empire")) return "Stock Out";
    return "Available";
  };

  const statusClasses = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "available") return "text-green-600";
    if (s === "stock out") return "text-red-500";
    if (s === "upcoming") return "text-amber-600";
    return "text-gray-600";
  };

  // navigation + kebab
  const goTo = (id) => navigate(`/book/${id}`);
  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };
  const handleReadThisBook = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(null);
    goTo(id);
  };

  // shared card classes
  const cardBase =
    "group cursor-pointer border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-sky-500 relative";
  const imgBase =
    "w-full h-40 object-cover transition-transform duration-300 group-hover:scale-[1.02]";

  // --- Horizontal scroll refs & helpers (left↔right scrolling) ---
  const recRowRef = useRef(null);
  const popRowRef = useRef(null);

  const scrollByAmount = (node, dir = 1) => {
    if (!node?.current) return;
    const container = node.current;
    // Scroll by ~one card (includes gap)
    const step = Math.min(360, container.clientWidth * 0.8);
    container.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  // close any open kebab on scroll
  const handleRowScroll = () => {
    if (openMenuId !== null) setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content (centered container) */}
      <div className="mx-auto max-w-7xl w-full flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 gap-4">
        {/* Desktop/Tablet Sidebar */}
        <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-none md:sticky md:top-20">
          <Sidebar onSelect={setFilter} />
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filters Button */}
          <div className="md:hidden mb-3">
            <button
              type="button"
              onClick={() => setOpenFilters(true)}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 rounded-md"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
            {!filter ? (
              <>
                {/* ======== RECOMMENDED ======== */}
                <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
                  <div className="px-4 py-3 bg-white flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Recommended
                    </h2>
                    <div className="hidden sm:flex gap-2">
                      <button
                        onClick={() => scrollByAmount(recRowRef, -1)}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollByAmount(recRowRef, 1)}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 relative bg-white">
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

                    <div
                      ref={recRowRef}
                      onScroll={handleRowScroll}
                      className="overflow-x-auto no-scrollbar"
                    >
                      <div className="flex gap-5 p-3 sm:p-4 snap-x snap-mandatory">
                        {recommended.map((b) => (
                          <BookCard
                            key={b.id}
                            book={{
                              ...b,
                              coverImage: b.coverImage || b.image ? `http://localhost:8000${b.image}`  : "https://via.placeholder.com/150",
                            }}
                            variant="row"
                            status={getStatus(b)}
                            onClick={() => goTo(b.id)}
                            onReadThisBook={() => goTo(b.id)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sm:hidden absolute inset-y-0 left-1 flex items-center">
                      <button
                        onClick={() => scrollByAmount(recRowRef, -1)}
                        className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="sm:hidden absolute inset-y-0 right-1 flex items-center">
                      <button
                        onClick={() => scrollByAmount(recRowRef, 1)}
                        className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* ======== /RECOMMENDED ======== */}

                {/* ======== POPULAR ======== */}
                <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
                  <div className="px-4 py-3 bg-white flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Popular
                    </h2>

                    <div className="hidden sm:flex gap-2">
                      <button
                        onClick={() => scrollByAmount(popRowRef, -1)}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollByAmount(popRowRef, 1)}
                        className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 relative bg-white">
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

                    <div
                      ref={popRowRef}
                      onScroll={handleRowScroll}
                      className="overflow-x-auto no-scrollbar"
                    >
                      <div className="flex gap-5 p-3 sm:p-4 snap-x snap-mandatory">
                        {popular.map((b) => (
                          <BookCard
                            key={b.id}
                            book={{
                              ...b,
                              coverImage: b.coverImage || b.image ? `http://localhost:8000${b.image}`  : "https://via.placeholder.com/150",
                            }}
                            variant="row"
                            status={getStatus(b)}
                            onClick={() => goTo(b.id)}
                            onReadThisBook={() => goTo(b.id)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sm:hidden absolute inset-y-0 left-1 flex items-center">
                      <button
                        onClick={() => scrollByAmount(popRowRef, -1)}
                        className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="sm:hidden absolute inset-y-0 right-1 flex items-center">
                      <button
                        onClick={() => scrollByAmount(popRowRef, 1)}
                        className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* ======== /POPULAR ======== */}

                {/* Keep rest as-is */}
                <NewBookCollections />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Showing results for:{" "}
                    <span className="text-sky-600">
                      {filter.type === "subcategory"
                        ? `${filter.parent} → ${filter.value}`
                        : filter.value || "All"}
                    </span>
                  </h2>
                  <button
                    onClick={() => setFilter(null)}
                    className="text-sm text-gray-600 hover:text-sky-600"
                  >
                    Clear
                  </button>
                </div>

                {/* Filtered results — fixed-size cards like scrollers */}
                {filtered.length === 0 ? (
                  <div className="text-gray-500 text-sm">No books found.</div>
                ) : (
                  <div className="flex flex-wrap gap-5">
                    {filtered.map((b) => (
                      <BookCard
                        key={b.id}
                        book={{
                          ...b,
                          coverImage: b.coverImage || b.image ? `http://localhost:8000${b.image}`  : "https://via.placeholder.com/150",
                        }}
                        variant="grid"
                        size="scroller"
                        status={getStatus(b)}
                        onClick={() => goTo(b.id)}
                        onReadThisBook={() => goTo(b.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Center the banner to match the content width */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedBanner />
      </div>

      {/* Mobile Sidebar Drawer */}
      {openFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setOpenFilters(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text_base font-semibold text-gray-800">Filters</h3>
              <button
                aria-label="Close filters"
                onClick={() => setOpenFilters(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Sidebar
              onSelect={(v) => {
                setFilter(v);
                setOpenFilters(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
