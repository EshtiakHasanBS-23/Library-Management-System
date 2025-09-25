// src/pages/AllGenres/AllGenres.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import books from "../../data/sampleBooks";
import Sidebar from "../../components/Sidebar/Sidebar";
import BookCard from "../../components/BookCard/BookCard";
import api from "../../api";  
import axios from "axios";
const getStockStatus = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("out")) return "Stock Out";
  if (t.includes("upcoming")) return "Upcoming";
  return "Available";
};

// tiny helper to format countdowns like "2d 4h", "3h 12m", "12m"
const formatCountdown = (targetMs, nowMs) => {
  const diff = Math.max(0, new Date(targetMs).getTime() - nowMs);
  const mins = Math.floor(diff / 60000);
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const minutes = mins % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const isToday = (dt) => {
  const d = new Date(dt);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
};

export default function AllGenres() {
  const navigate = useNavigate();
  const location = useLocation();

  // const allBooks = [
  //   ...(books?.recommended || []),
  //   ...(books?.popular || []),
  //   ...(books?.featuredBooks || []), // safe if missing
  // ];

  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

// useEffect(() => {
//   const fetchBooks = async () => {
//     try {
//       const res = await api.get("/books"); // <-- Your FastAPI endpoint
//       setAllBooks(res.data); // set data from API
//     } catch (err) {
//       console.error("Failed to fetch books:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchBooks();
// }, []);

useEffect(() => {
  const fetchBooks = async () => {
    try {
      const [booksRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:8000/books"),
        axios.get("http://localhost:8000/categories")
      ]);

      const categories = categoriesRes.data;
      const data = booksRes.data;

      const normalized = data.map((b) => {
        const category = categories.find(c => c.id === b.category_id)?.name || "Unknown";
        return {
          ...b,
          category,
          coverImage: b.image ? `http://localhost:8000/media/${b.image}` : "https://via.placeholder.com/150",
        };
      });

      setAllBooks(normalized);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      setAllBooks([]);
    }
  };

  fetchBooks();
}, []);




  const [filter, setFilter] = useState(location.state?.filter || null);

  // pagination
  const PAGE_SIZE = 9; // keep your paging logic
  const [page, setPage] = useState(1);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (location.state?.filter !== undefined) setFilter(location.state.filter);
  }, [location.state]);

  const filtered = useMemo(() => {
    if (!filter) return allBooks;
    console.log("Filtering books with", filter);
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

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (id) => navigate(`/book/${id}`);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar onSelect={setFilter} />

      {/* Book Grid */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">All Genres</h1>

        <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
          <div className="px-4 py-3 bg-white">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Browse Books
            </h2>
          </div>

          <div className="border-t border-gray-200">
            {pageItems.length ? (
              <div className="p-4">
                {/* EXACT 3-COLUMN GRID ON DESKTOP, SAME CARD SIZE AS SCROLLER */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
                  {pageItems.map((b) => (
                    <BookCard
                      key={b.id}
                      book={{
                        ...b,
                        // coverImage: b.coverImage || b.image, // map to shared card field
                        coverImage: b.image ? `http://localhost:8000${b.image}` : "",
                        status: b.status || getStockStatus(b.title),
                      }}
                      variant="grid"
                      size="scroller"
                      status={b.status || getStockStatus(b.title)}
                      onClick={() => goTo(b.id)}
                      onReadThisBook={() => goTo(b.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500">No books found.</div>
            )}

            {/* Pagination (unchanged) */}
            {filtered.length > 0 && totalPages > 1 && (
              <div className="px-4 pb-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 bg_white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 text-sm rounded-md border ${
                          n === page
                            ? "bg-sky-600 text-white border-sky-600"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
