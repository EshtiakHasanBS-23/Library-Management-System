
// src/pages/BookDetails/BookDetails.jsx
import React, { use, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Star,
  PlayCircle,
  PauseCircle,
  Download,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";
import axios from "axios";  
/** Demo reviews DB (unchanged) */
const REVIEWS_DB = {
  "5": {
    heading: "Employee Review",
    overall: 4.7,
    total: 2713,
    breakdown: { 5: 82, 4: 12, 3: 4, 2: 1, 1: 1 },
    images: [
      "https://images.unsplash.com/photo-1544937950-fa07a98d237f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
    ],
    reviews: [
      { id: "r1", name: "Humayun Kabir", title: "An absolute masterpiece even in 2025", stars: 5, country: "Bangladesh", date: "July 2, 2025", verified: true, body: "Moves you from low-level to high-level architectural thinking. Evergreen patterns and trade-offs. Senior engineers loved it.", helpful: 56 },
      { id: "r2", name: "Lubaba Jahan", title: "Must Read", stars: 5, country: "Bangladesh", date: "May 26, 2025", verified: false, body: "Seminal work. Not a quick read, but worth the effort. Clear patterns and timeless insights.", helpful: 14 },
      { id: "r3", name: "Rashedul Zaman", title: "Great print, good quality cover", stars: 4, country: "Bangladesh", date: "April 22, 2025", verified: true, body: "Well packaged, arrived flat. Solid examples and commentary.", helpful: 9 },
      { id: "r4", name: "Tasmania Rosa .", title: "Practical patterns", stars: 5, country: "Bangladesh", date: "March 02, 2025", verified: true, body: "Explains trade-offs clearly. Helped our team refactor services.", helpful: 11 },
      { id: "r5", name: "Shuvo Rahman", title: "Dense but rewarding", stars: 4, country: "Bangladesh", date: "Feb 18, 2025", verified: false, body: "Take it slow. Examples are timeless.", helpful: 7 },
      { id: "r6", name: "Maruf Islam", title: "Go-to reference", stars: 5, country: "Bangladesh", date: "January 11, 2025", verified: true, body: "Keep it on my desk. Patterns map to modern stacks easily.", helpful: 18 },
      { id: "r7", name: "Sazal Uddin.", title: "Bridges theory and practice", stars: 5, country: "Bangladesh", date: "Nov 3, 2024", verified: true, body: "Rare book that improves code quality quickly.", helpful: 6 },
      { id: "r8", name: "Naimur Hasan", title: "A classic", stars: 5, country: "Bangladesh", date: "Sep 1, 2024", verified: false, body: "Still relevant, even with new frameworks.", helpful: 4 },
    ],
  },
  "2": {
    heading: "Employee Review",
    overall: 4.9,
    total: 1045,
    breakdown: { 5: 88, 4: 9, 3: 2, 2: 1, 1: 0 },
    images: [],
    reviews: [
      { id: "r9", name: "Nadia Zahan.", title: "Clear cloud strategy playbook", stars: 5, country: "Bangladesh", date: "May 10, 2024", verified: true, body: "Vendor-neutral frameworks. Helped us choose a service model and avoid re-architecture.", helpful: 22 },
      { id: "r10", name: "Vitul Shohan", title: "Strong patterns", stars: 4, country: "Bangladesh", date: "Aug 8, 2024", verified: false, body: "Good balance of business & tech requirements.", helpful: 5 },
      { id: "r11", name: "Purification Meril", title: "Great case studies", stars: 5, country: "Bangladesh", date: "Jan 20, 2025", verified: true, body: "Real migrations and pitfalls. Very useful.", helpful: 9 },
    ],
  },
  "1": {
    heading: "Employee Review",
    overall: 4.0,
    total: 1,
    breakdown: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
    images: [],
    reviews: [
      { id: "r12", name: "Alisha Rahman", title: "Inspiring for founders", stars: 5, country: "Bangladesh", date: "March 5, 2023", verified: true, body: "Concise, motivating, and practical.", helpful: 3 },
    ],
  },
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookData, setBookData] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [stats, setStats] = useState({ available: 0, upcoming: 0, unavailable: 0 });

  // Spec & Summary state
  const [pdTab, setPdTab] = useState("summary");
  const [pdExpanded, setPdExpanded] = useState(false);

  // ===== Refs =====
  const specRef = useRef(null);
  const readBoxRef = useRef(null);
  const audioRef = useRef(null);
  const relRowRef = useRef(null);

  // Author follow modal/state
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [authorFollowers, setAuthorFollowers] = useState(0);
  const [rolePicked, setRolePicked] = useState("");

  // “Want to read” dropdown + toast
  const [showReadBox, setShowReadBox] = useState(false);
  const [readStatus, setReadStatus] = useState("");
  const [toast, setToast] = useState({ open: false, msg: "" });

  // Reviews UI
  const [pack, setPack] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [expanded, setExpanded] = useState({});
  const [votes, setVotes] = useState({});
  const [bump, setBump] = useState({});
  const [feedbackToast, setFeedbackToast] = useState({ open: false, type: "", msg: "" });
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ---------- utils ----------
  const splitSentences = (txt = "") =>
    (txt || "")
      .replace(/\n+/g, " ")
      .trim()
      .split(/(?<=[.!?\u0964\u0965])\s+/)
      .filter(Boolean);

  const makeIntroTail = (txt = "", introCount = 6, tailCount = 4) => {
    const parts = splitSentences(txt);
    if (!parts.length) return { intro: "", tail: "" };
    const intro = parts.slice(0, introCount).join(" ");
    const tail = parts.slice(Math.max(parts.length - tailCount, 0)).join(" ");
    return { intro, tail };
  };

  const pickAudio = (b) =>
  {
     const audioPath =
    b.audio || b.audioSrc || b.audioLink || b.audio_clip || b.audioURL || null;

  if (!audioPath) return null;

  // If the path starts with "/", prepend your backend base URL
  return audioPath.startsWith("http")
    ? audioPath
    : `http://localhost:8000${b.audio}`;
  }

  const normalize = (b) =>
    !b
      ? null
      : {
          id: b.id,
          title: b.title,
          authors: b.authors || b.author || "Unknown Author",
          coverImage: b.coverImage || b.image   ? `http://localhost:8000${b.image}` // <-- prepend backend media path
          : "https://via.placeholder.com/150",
          rating: b.rating ?? 0,
          ratingCount: b.ratingCount ?? 0,
          publisher: b.author ?? "—",
          publishDate: b.created_at ?? "",
          category: b.category ?? "General",
          pdfLink: b.pdfLink || b.pdf   ? `http://localhost:8000${b.pdf}` // <-- prepend backend media path
          : "https://via.placeholder.com/150",
          status: b.status,
          image: b.image,
          summary: b.longSummary || b.summary || b.description || "",
          summaryIntro: b.summaryIntro || b.summary_intro || null,
          summaryTail: b.summaryTail || b.summary_tail || null,
          authorPhoto:
            b.authorPhoto ||
            b.author_image ||
            b.authorImage ||
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&h=240&fit=crop",
          authorFollowers: Number(b.authorFollowers || b.followers || 16),
          authorBio: b.authorBio || b.author_bio || b.authorStory || "",
          audioSrc: pickAudio(b),
          copies:b.copies,
        };

  const bucket = (s) => {
    const v = String(s || "Available").toLowerCase();
    if (v.includes("upcoming") || v.includes("coming")) return "upcoming";
    if (v.includes("out") || v.includes("not available") || v.includes("stock"))
      return "unavailable";
    return "available";
  };


const token = localStorage.getItem("token");

const handlePdfClick = async (bookId, pdfLink) => {
  try {
    if (!token) {
      alert("Please login first!");
      return;
    }

    await axios.post(
      `http://localhost:8000/borrows/pdf-view/${bookId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ Open the PDF in a new tab
    window.open(pdfLink, "_blank");
  } catch (err) {
    console.error("Failed to record PDF view:", err);
    // still open PDF even if record fails
    window.open(pdfLink, "_blank");
  }
};
useEffect(() => {
    const fetchBook = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You must log in to view book details");
          navigate("/login");
          return;
        }

        const res = await axios.get(`http://localhost:8000/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ token required
          },
        });

        const b = res.data;
        setBookData({
          ...b,
          coverImage: b.image
            ? `http://localhost:8000${b.image}`
            : "https://via.placeholder.com/150",
        });
        setBookData(normalize(b));
        const resAll = await axios.get(`http://localhost:8000/books/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const others = (resAll.data || [])
        .filter((book) => String(book.id) !== String(id))
        .filter((book) => book.category_id === b.category_id) 
        .slice(0, 3)
        .map(normalize)
        .filter(Boolean);

      setRelatedBooks(others);


      } catch (err) {
        console.error("Failed to fetch book details:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("You are not authorized to view this book.");
          navigate("/login");
        }
      }
    };
    
    fetchBook();
  }, [id, navigate]);



  // init votes when book changes
  useEffect(() => {
    if (!bookData?.id) return;
    fetchRatingBreakdown();
    fetchReviews(); 
  }, [bookData?.id]);

  // close the read box when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showReadBox && readBoxRef.current && !readBoxRef.current.contains(e.target)) {
        setShowReadBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showReadBox]);

  // ====== Audio DOM event listeners ======
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      setDuration(el.duration || 0);
    };
    const onTime = () => {
      setCurTime(el.currentTime || 0);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurTime(0);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [bookData?.audioSrc]);

  // Reset when audio src changes
  useEffect(() => {
    setIsPlaying(false);
    setCurTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = bookData?.audioSrc || "";
      if (bookData?.audioSrc) audioRef.current.load();
    }
  }, [bookData?.audioSrc]);

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el || !bookData?.audioSrc) return;

    const want = new URL(bookData.audioSrc, window.location.href).href;
    if (el.src !== want) {
      el.src = bookData.audioSrc;
    }

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      if (Number.isNaN(el.duration) || !el.duration) {
        el.load();
      }
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const format = (sec = 0) => {
    if (!isFinite(sec)) return "0:00";
    const s = Math.floor(sec % 60);
    const m = Math.floor(sec / 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progress = duration ? Math.min(1, Math.max(0, curTime / duration)) : 0;

  const onSeekClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurTime(pct * duration);
  };

  const onSeekKeyDown = (e) => {
    if (!audioRef.current) return;
    if (e.key === "ArrowRight") {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < (rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));

  const renderStarsLarge = (val) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.round(val || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
      />
    ));

  if (!bookData) {
    return (
      <div className="text-center text-gray-600 py-20">
        Loading book details...
      </div>
    );
  }
  
  const fetchRatingBreakdown = async () => {
  if (!bookData?.id) return;

  try {
    const res = await axios.get(`http://localhost:8000/reviews/book/${bookData.id}/rating-breakdown`);
    const data = res.data;
    setPack({
      heading: "Employee Review",
      total: data.total,
      overall: data.overall,
      breakdown: data.breakdown,
      reviews: data.reviews
    });
  } catch (err) {
    console.error("Failed to fetch rating breakdown:", err);
  }
};


const fetchReviews = async () => {
  if (!bookData?.id) return;

  try {
    const res = await axios.get(`http://localhost:8000/reviews/book/${bookData.id}`, {
      headers: { Authorization: `Bearer ${token}` } // make sure token exists
    });

    const data = res.data;

    // Calculate overall rating, total, breakdown
    const total = data.length;
    const overall = total > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

    setPack({
      heading: "Employee Review",
      total,
      overall: Math.round(overall * 10) / 10,
      breakdown,
      reviews: data
    });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    alert("Failed to load reviews");
  }
};

  const submitReview = async () => {
  if (!rating || !comment) {
    alert("Please provide a rating and comment");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:8000/reviews/",
      {
        book_id: bookData.id,
        rating,
        comment
      },
      {
        headers: { Authorization: `Bearer ${token}` } // make sure token exists
      }
    );

    // After submission, refresh reviews + rating breakdown
    fetchReviews();
    fetchRatingBreakdown();
    setRating(0);
    setComment("");
    alert("Review submitted successfully!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.detail || "Failed to submit review");
  }
};

  // const pack = REVIEWS_DB[String(bookData.id)] || null;
  const localReviewCount = pack?.reviews?.length ?? 0;
  const ratingCountDisplay = pack ? localReviewCount : 0;
  const reviewsTextDisplay = pack
    ? localReviewCount > 0
      ? `${localReviewCount} Reviews`
      : "No Reviews"
    : "No Reviews";

  const baseSummary = bookData.summary  || "No summary available.";
  const introTail = makeIntroTail(baseSummary);
  const summaryIntro = bookData.summaryIntro ?? introTail.intro;
  const summaryTail = bookData.summaryTail ?? introTail.tail;

  const shelfOptions = [
    { key: "want", label: "Want to read" },
    { key: "current", label: "Currently reading" },
    { key: "read", label: "Read" },
  ];
  const onPickShelf = (opt) => {
    setReadStatus(opt.key);
    setShowReadBox(false);
    setToast({ open: true, msg: `Successfully added: ${opt.label}` });
    setTimeout(() => setToast({ open: false, msg: "" }), 1400);
  };

  const countFor = (stars) =>
    Math.round(((pack?.total || 0) * ((pack?.breakdown?.[stars] || 0) / 100)));

  const vote = (id, dir) => {
    const cur = votes[id] || { up: 0, down: 0, my: null };
    let { up, down, my } = cur;

    if (dir === "up") {
      if (my === "up") {
        up -= 1;
        my = null;
      } else {
        if (my === "down") down -= 1;
        up += 1;
        my = "up";
      }
    } else {
      if (my === "down") {
        down -= 1;
        my = null;
      } else {
        if (my === "up") up -= 1;
        down += 1;
        my = "down";
      }
    }

    const next = { up: Math.max(0, up), down: Math.max(0, down), my };
    setVotes((prev) => ({ ...prev, [id]: next }));

    setBump((p) => ({ ...p, [id]: { ...(p[id] || {}), [dir]: true } }));
    setTimeout(() => {
      setBump((p) => ({ ...p, [id]: { ...(p[id] || {}), [dir]: false } }));
    }, 220);

    const type = my === "up" ? "up" : my === "down" ? "down" : "clear";
    const msg =
      type === "up"
        ? "Marked as Helpful"
        : type === "down"
        ? "Marked as Not Helpful"
        : "Feedback removed";

    setFeedbackToast({ open: true, type, msg });
    clearTimeout(vote._t);
    vote._t = setTimeout(() => setFeedbackToast({ open: false, type: "", msg: "" }), 1700);
  };

  const scrollRel = (dir = 1) => {
    const node = relRowRef.current;
    if (!node) return;
    const step = Math.min(360, node.clientWidth * 0.8);
    node.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <div className="bg-white py-8 sm:py-10 px-3 sm:px-6 lg:px-8">
      {/* Page grid */}
      <div className="mx-auto max-w-7xl grid gap-8 sm:gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* LEFT COLUMN (cover) */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <div className="w-full max-w-[340px] border border-gray-300 rounded-md p-3 sm:p-4 bg-white">
            <img
              src={bookData.coverImage}
              alt={bookData.title}
              loading="lazy"
              className="w-full h-auto max-h-[460px] object-contain"
            />
          </div>
          {/* Want to read control (kept commented exactly as you had) */}
          {/* <div className="mt-3 w-[340px] max-w-full" ref={readBoxRef}> ... </div> */}
        </div>

        {/* RIGHT COLUMN (book info) */}
        <div className="lg:col-span-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {bookData.title}
          </h1>
          <p className="text-gray-600 mt-1 text-base">
            by <span className="text-sky-600 font-medium">{bookData.authors}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {bookData.publisher}, {bookData.publishDate.split("T")[0]} —{" "}
            <Link
              to="/all-genres"
              state={{ filter: { type: "category", value: bookData.category } }}
              className="text-sky-600 hover:underline"
            >
              {bookData.category}
            </Link>
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {renderStars(bookData.rating)}
            <span className="text-sm text-gray-600 font-semibold shrink-0">
              {ratingCountDisplay} Ratings
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="text-sm text-gray-500">{reviewsTextDisplay}</span>
          </div>

          {/* Short summary teaser */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-800">Summary of the Book</h3>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
              {baseSummary.split(".")[0] + (baseSummary ? "..." : "")}
              {baseSummary.split(".").length > 1 && (
                <button
                  onClick={() => {
                    setPdTab("summary");
                    setPdExpanded(true); // auto-expand
                    specRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="ml-2 font-semibold hover:underline text-sky-600"
                >
                  Read More
                </button>
              )}
            </p>
          </div>

          {/* Availability + Audio + PDF */}
          <div className="mt-6">
            <span className="text-green-600 font-medium text-sm inline-flex items-center">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-ping mr-2"></span>
              {bookData.copies > 0 ? "Available" : "Stock Out"}
            </span>

            {/* Audio row */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                disabled={!bookData.audioSrc}
                className={`flex items-center gap-2 text-sm ${
                  bookData.audioSrc
                    ? "text-gray-700 hover:text-sky-600"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <PauseCircle className="w-5 h-5" />
                ) : (
                  <PlayCircle className="w-5 h-5" />
                )}
                <span>Audio Clip</span>
              </button>

              {/* Progress bar */}
              <div
                className="w-40 sm:w-56 h-1 bg-gray-200 rounded-full mx-2 sm:mx-3 relative cursor-pointer select-none"
                onClick={onSeekClick}
                onKeyDown={onSeekKeyDown}
                role="slider"
                tabIndex={0}
                aria-valuemin={0}
                aria-valuemax={Math.max(1, Math.floor(duration))}
                aria-valuenow={Math.floor(curTime)}
                aria-label="Seek audio"
              >
                <div
                  className="absolute left-0 top-0 h-full bg-sky-500 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {/* Timing */}
              <div className="text-xs text-gray-600 min-w-[84px]">
                {format(curTime)} / {format(duration)}
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={bookData.audioSrc || undefined}
                preload="auto"
                crossOrigin="anonymous"
              />

              <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePdfClick(bookData.id, bookData.pdfLink);
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-sm text-gray-700 font-semibold border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </a>
            </div>

            {!bookData.audioSrc && (
              <div className="mt-2 text-xs text-gray-500">
                No audio clip provided for this book.
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                // Ensure the exact clicked book is what the form sees
                const current = { ...bookData, quantity: 1 };

                // 1) Put it at the FRONT of borrowedBooks (dedupe by id)
                const list = JSON.parse(localStorage.getItem("borrowedBooks") || "[]")
                  .filter((b) => String(b.id) !== String(current.id));
                const next = [current, ...list];
                localStorage.setItem("borrowedBooks", JSON.stringify(next));

                // 2) Save a dedicated pointer for the form
                localStorage.setItem("borrowNow", JSON.stringify(current));

                // 3) Also pass via router state
                navigate("/fill-up-form", { state: { borrowNow: current } });
              }}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-md w-full sm:w-auto block text-center"
            >
              Borrowed
            </button>
          </div>
        </div>

        {/* ============== SPECIFICATION & SUMMARY ============== */}
        <div ref={specRef} className="lg:col-span-2">
          <div className="mt-10 rounded-lg border border-gray-300 overflow-hidden bg-white">
            <div className="px-4 sm:px-5 py-3">
              <h3 className="text-lg font-bold text-gray-800">Specification &amp; Summary</h3>
            </div>

            <div className="border-t border-gray-300">
              <div className="px-4 sm:px-5 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["summary", "spec", "author"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPdTab(t)}
                      className={`px-3 py-1.5 text-sm rounded-md border ${
                        pdTab === t
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t === "summary" ? "Summary" : t === "spec" ? "Specification" : "Author"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {pdTab === "summary" && (
                  <>
                    {!pdExpanded ? (
                      <>
                        <div className="text-gray-800 text-[15px] leading-7 space-y-4">
                          <div className="relative">
                            <p className="line-clamp-3">{summaryIntro}</p>
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                          </div>

                          <div className="border-t border-gray-200" />

                          <p className="italic text-gray-700">{summaryTail}</p>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setPdExpanded(true)}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Show More
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-gray-800 text-[15px] leading-7 whitespace-pre-line">
                          {baseSummary}
                        </div>
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setPdExpanded(false)}
                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Show Less
                          </button>
                        </div>
                      </>
                    )}

                    <div className="mt-4 border-t border-b border-gray-300 py-3">
                      <div className="text-center">
                        <button className="inline-flex items-center gap-2 text-red-500 hover:text-sky-600 text-sm">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current">
                            <span className="text-[10px] font-bold">i</span>
                          </span>
                          Report incorrect information
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {pdTab === "spec" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Title</span>
                      <div className="font-medium text-gray-800">{bookData.title}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Author</span>
                      <div className="font-medium text-gray-800">{bookData.authors}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Category</span>
                      <div className="font-medium text-gray-800">{bookData.category}</div>
                    </div>
                    <div className="flex justify_between sm:block">
                      <span className="text-gray-500">Publisher</span>
                      <div className="font-medium text-gray-800">{bookData.publisher}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Publish Date</span>
                      <div className="font-medium text-gray-800">{bookData.publishDate.split("T")[0] || "—"}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Rating</span>
                      <div className="font-medium text-gray-800">
                        {(bookData.rating || 0).toFixed ? bookData.rating.toFixed(1) : bookData.rating}
                      </div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-gray-500">Status</span>
                      <div className="font-medium text-gray-800">{bookData.copies < 1 ? "Stock Out" : "Available"}</div>
                    </div>
                  </div>
                )}

                {pdTab === "author" && (
                  <div className="flex items-start gap-5">
                    <div className="w-32 sm:w-36 shrink-0 text-center mx-auto sm:mx-0">
                      <img
                        src={bookData.authorPhoto}
                        alt={bookData.authors}
                        loading="lazy"
                        className="w-24 h-24 rounded-full object-cover border mx-auto"
                      />
                      <div className="mt-2 text-xs text-gray-600">{authorFollowers} followers</div>
                      <button
                        onClick={() => setShowFollowModal(true)}
                        className={`mt-2 w-24 text-sm font-semibold rounded-full px-3 py-1.5 transition ${
                          isFollowing ? "bg-gray-200 text-gray-700 cursor-default" : "bg-sky-500 text-white hover:bg-sky-600"
                        }`}
                        disabled={isFollowing}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{bookData.authors}</h4>
                      <p className="mt-2 text-[15px] leading-7 text-gray-800 whitespace-pre-line">
                        {bookData.authorBio || "No additional author story provided."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== REVIEWS & RATINGS ===== */}
        <div className="lg:col-span-2 mt-10">
          <h3 className="text-2xl font-semibold text-gray-900">Reviews and Ratings</h3>
        </div>

        {/* LEFT SIDE: rate + reviews list */}
        <div className="lg:col-span-1">
          <div className="">
            <div className="text-sm text-gray-700 font-semibold">Rate this product</div>
           <div className="mt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded p-2 mt-2"
            placeholder="Write your review..."
          />
          <button
            className="mt-3 inline-flex items-center border border-gray-300 text-sky-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-sky-50"
            onClick={submitReview}
          >
            Review Write
          </button>
          </div>

          {!pack || pack.total === 0 ? (
            console.log("No reviews available"),
            <div className="text-sm text-gray-500 mt-6">No reviews yet for this book.</div>
          ) : (
            <div className="space-y-6 mt-10 sm:mt-20">
              {pack.reviews.map((r) => {
                const isLong = (r.body || "").length > 220;
                const open = !!expanded[r.id];
                const body = !isLong || open ? r.body : r.body.slice(0, 220) + "…";
                const firstLetter = r.username?.trim()?.[0]?.toUpperCase() || "?";
                const v = votes[r.id] || { up: r.helpful || 0, down: 0, my: null };
                return (
                  <article key={r.id} className="border-b border-gray-300 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                        {firstLetter}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{r.username}</span>
                          <span className="text-gray-500 ml-1.5">{r.country}</span>
                        </div>

                         <div className="text-sm">
                          <span>{r.comment}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5 text-gray-500">
                          {renderStars(r.rating)}
                          <span className="ml-1 font-medium">{r.rating.toFixed(1)}</span>
                          <span className="text-gray-300 mx-1">|</span>
                          <time dateTime={r.created_at}>{r.created_at}</time>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mt-2">{r.title}</h4>
                    {r.verified && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Purchase
                      </div>
                    )}
                    <p className="text-[15px] leading-7 text-gray-800 mt-2 whitespace-pre-line">
                      {body}
                      {isLong && (
                        <button
                          onClick={() => setExpanded((p) => ({ ...p, [r.id]: !p[r.id] }))}
                          className="text-sky-600 hover:underline font-semibold ml-1 text-sm"
                        >
                          {open ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span className="text-xs">
                        Was this helpful? <span className="text-gray-800 font-semibold">{v.up}</span>
                      </span>
                      <button
                        onClick={() => vote(r.id, "up")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${v.my === "up" ? "text-sky-600 bg-sky-100" : "hover:bg-gray-100"}`}
                      >
                        <ThumbsUp className={`w-4 h-4 transition-transform ${bump[r.id]?.up ? 'scale-125' : ''}`} />
                      </button>
                      <button
                        onClick={() => vote(r.id, "down")}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md transition ${v.my === "down" ? "text-red-600 bg-red-100" : "hover:bg-gray-100"}`}
                      >
                        <ThumbsDown className={`w-4 h-4 transition-transform ${bump[r.id]?.down ? 'scale-125' : ''}`} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: rating breakdown + images */}
        <div className="lg:col-span-1">
          {pack?.total > 0 && (
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">{pack.heading}</h4>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-5xl font-bold text-gray-900 leading-none">
                  {pack.overall.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-gray-600">
                  out of 5
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                {renderStarsLarge(pack.overall)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on <span className="font-medium">{pack.total}</span> ratings
              </p>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-4">{n}</span>
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${pack.breakdown[n] || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">
                      {countFor(n)}
                    </span>
                  </div>
                ))}
              </div>

              {/* {pack.images.length > 0 && (
                <div className="mt-8">
                  <h5 className="text-sm font-semibold text-gray-700">Images from reviews</h5>
                  <div className="flex overflow-x-auto gap-3 mt-3 pb-2 scrollbar-hide">
                    {pack.images.map((src, i) => (
                      <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={src}
                          alt={`Review image ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>

      {/* ===== RELATED BOOKS ===== */}
      <div className="mt-16 mx-auto max-w-7xl">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
          Related Books in {bookData.category}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Explore more titles in this category.
        </p>

        <div className="relative mt-6">
          <div
            ref={relRowRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          >
            {relatedBooks.map((b) => (
              <div key={b.id} className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start">
                <BookCard book={b} fromSlider={true} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollRel(-1)}
            aria-label="Scroll left"
            className="hidden sm:inline-flex absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 items-center justify-center shadow-md hover:bg-gray-50 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scrollRel(1)}
            aria-label="Scroll right"
            className="hidden sm:inline-flex absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 items-center justify-center shadow-md hover:bg-gray-50 z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Want to read Modal/Dropdown */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 transition-opacity duration-300 ${
          showReadBox ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setShowReadBox(false)}
      >
        <div
          ref={readBoxRef}
          className="absolute right-4 bottom-4 w-[280px] rounded-lg shadow-xl border border-gray-300 bg-white p-4 transition-all duration-300 origin-bottom-right"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: showReadBox ? "scale(1)" : "scale(0.95)",
            opacity: showReadBox ? 1 : 0,
          }}
        >
          <h4 className="font-semibold text-gray-800">Reading Status</h4>
          <div className="mt-3 space-y-2">
            {shelfOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onPickShelf(opt)}
                className="w-full flex items-center justify-between text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                {opt.label}
                {readStatus === opt.key && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Author Follow Modal */}
      {showFollowModal && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/75 flex items-center justify-center px-4"
          onClick={() => setShowFollowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold text-gray-900">
                Follow {bookData.authors}
              </h4>
              <button
                onClick={() => setShowFollowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Choose your role to get relevant updates.
            </p>
            <div className="mt-4 space-y-3">
              {["Reader", "Writer", "Both"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRolePicked(role)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all border ${
                    rolePicked === role
                      ? "bg-sky-100 border-sky-400 text-sky-800 font-semibold"
                      : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsFollowing(true);
                setAuthorFollowers((prev) => prev + 1);
                setShowFollowModal(false);
              }}
              disabled={!rolePicked}
              className={`mt-6 w-full font-semibold px-4 py-3 rounded-md transition-colors ${
                rolePicked
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Follow
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300">
          {toast.msg}
        </div>
      )}
      {feedbackToast.open && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
            feedbackToast.type === "up" ? "bg-sky-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {feedbackToast.msg}
        </div>
      )}
    </div>
  );
}
