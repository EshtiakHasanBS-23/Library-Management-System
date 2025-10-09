// src/components/NewBookCollections/NewBookCollections.jsx
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import axios from "axios";
export default function NewBookCollections() {
  const popRowRef = useRef(null);
  const navigate = useNavigate();


const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewBooks = async () => {
      try {
        const res = await axios.get("http://localhost:8000/books/new");
        setBooks(res.data);
      } catch (err) {
        console.error("Failed to load new books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewBooks();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading new books...</div>;
  }

  const goTo = (b) =>
    navigate(`/book/${b.id}`, {
      state: { fromSlider: b },
    });

  const scrollByAmount = (ref, dir = 1) => {
    const el = ref?.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const handleRowScroll = () => {};

  return (
    <section className="mt-12">
      <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
        <div className="px-4 py-3 bg-white flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            NEW BOOK COLLECTIONS
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
              {books.map((b) => (
                <BookCard
                  key={b.id}
                  book={{ ...b, coverImage: b.image ?  `http://localhost:8000${b.image}` 
                         : "https://via.placeholder.com/150", }} // map to the shared card shape
                  variant="row"
                  status={b.copies > 1 ? "available" : "unavailable"}
                  onClick={() => goTo(b)}
                  onReadThisBook={() => goTo(b)}
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
    </section>
  );
}
