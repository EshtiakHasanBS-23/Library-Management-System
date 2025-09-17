// src/pages/ManageBooks/ManageBooks.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  FileText,
  FileAudio2,
  CheckCircle2,
  Search,
  Filter as FilterIcon,
} from "lucide-react";
import axios from "axios";
// import sectionedBooks from "../../data/sampleBooks";
import Sidebar from "../../components/DashboardSidebar/DashboardSidebar";
import Pagination from "../../components/Pagination/Pagination";

const PLACEHOLDER_IMG = "https://dummyimage.com/80x80/e5e7eb/9ca3af&text=📘";
const PAGE_SIZE = 6; // paginate after 6 books

// ---------- helpers ----------
function toYMD(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function normalizeFromSection(item) {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: item.title ?? "—",
    author: item.author ?? item.authors ?? "—",
    category: item.category ?? "—",
    copies: "—",
    updatedOn: toYMD(item.publishDate ?? item.stockDate ?? ""),
    cover: item.image ?? item.coverImage ?? PLACEHOLDER_IMG,
    pdf: item.pdf ?? "",
    audio: item.audio ?? "",
    description: item.summary ?? "",
  };
}


let categoryMap = {}; // cache for id → name

async function loadCategories() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/categories", {
      headers: { Authorization: `Bearer ${token}` }
    });
    categoryMap = res.data.reduce((map, cat) => {
      map[cat.id] = cat.name;
      return map;
    }, {});
  } catch (err) {
    console.error("Failed to load categories", err);
  }
}


function normalizeFromJson(item) {
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: item.title ?? "—",
    author: item.authors ?? item.author ?? "—",
    category: item.category_id?? "—",
    copies: item.copies || "—",
    updatedOn: toYMD(item.publishDate ?? ""),
    cover: item.coverImage || item.image ? `http://localhost:8000${item.image}` : PLACEHOLDER_IMG,
    pdf: item.pdf ?? "",
    audio: item.audio ?? "",
    description: item.summary ?? "",
  };
}

// ---------- Filter Bar COMPONENT ----------
function FilterBarBooks({
  queryTitle,
  setQueryTitle,
  filterAuthor,
  setFilterAuthor,
  filterCategory,
  setFilterCategory,
  authors,
  categories,
  onReset,
}) {
  return (
    <section className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Book name search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={queryTitle}
            onChange={(e) => setQueryTitle(e.target.value)}
            placeholder="Search by book name"
            className="w-64 md:w-80 rounded border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Author select */}
        <div className="flex items-center gap-2">
          <FilterIcon size={16} className="text-gray-500" />
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Category select */}
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

export default function ManageBooks() {
  useEffect(() => {
    document.title = "Manage Books";
  }, []);

  // --------- load books.json from PUBLIC ----------
  const [booksJson, setBooksJson] = useState([]);
  /*useEffect(() => {
    const url = `${import.meta.env.BASE_URL}books.json`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setBooksJson(Array.isArray(data) ? data : []))
      .catch(() => setBooksJson([]));
  }, []);*/
  
  // build table data (normalized)
 /* const baseBooks = useMemo(() => {
    const fromSections = [];
    if (sectionedBooks) {
      const {
        recommended = [],
        popular = [],
        business = [],
        featuredBooks = [],
        relatedBooks = [],
      } = sectionedBooks;
      [...recommended, ...popular, ...business, ...featuredBooks, ...relatedBooks].forEach(
        (b) => fromSections.push(normalizeFromSection(b))
      );
    }
    const fromJson = booksJson.map(normalizeFromJson);

    // dedupe by title+author
    const seen = new Set();
    const combined = [];
    [...fromSections, ...fromJson].forEach((b) => {
      const key = `${(b.title || "").trim().toLowerCase()}__${(b.author || "")
        .trim()
        .toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(b);
      }
    });

    combined.sort((a, b) => String(b.updatedOn).localeCompare(String(a.updatedOn)));
    return combined;
  }, [booksJson]);8/*/

  // displayed list (allows local add/edit/delete)
  const [displayed, setDisplayed] = useState([]);
  // useEffect(() => setDisplayed(baseBooks), [baseBooks]);
  useEffect(() => {
  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("token"); // if auth needed
      const res = await axios.get("http://localhost:8000/books", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const booksFromApi = res.data.map((b) => normalizeFromJson(b));
      setDisplayed(booksFromApi);
    } catch (err) {
      console.error("Failed to fetch books from API:", err);
      setDisplayed([]);
    }
  };

  fetchBooks();
}, []);

  // --------- FILTER STATE ----------
  const [queryTitle, setQueryTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // options reflect the current displayed list
  const options = useMemo(() => {
    const authors = new Set();
    const categories = new Set();
    displayed.forEach((b) => {
      if (b.author && b.author !== "—") authors.add(b.author);
      if (b.category && b.category !== "—") categories.add(b.category);
    });
    return {
      authors: Array.from(authors).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [displayed]);

  const clearFilters = () => {
    setQueryTitle("");
    setFilterAuthor("all");
    setFilterCategory("all");
  };

  // FILTERED ROWS
  const filteredRows = useMemo(() => {
    const q = queryTitle.trim().toLowerCase();
    return displayed.filter((b) => {
      const byTitle = !q || (b.title || "").toLowerCase().includes(q);
      const byAuthor = filterAuthor === "all" || b.author === filterAuthor;
      const byCategory = filterCategory === "all" || b.category === filterCategory;
      return byTitle && byAuthor && byCategory;
    });
  }, [displayed, queryTitle, filterAuthor, filterCategory]);

  // ---------- pagination for table (6 per page) ----------
  const [tablePage, setTablePage] = useState(1);
  const pageRows = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, tablePage]);

  // reset to page 1 when filters/data change
  useEffect(() => {
    setTablePage(1);
  }, [queryTitle, filterAuthor, filterCategory, displayed.length]);

  // --------- Add/Edit modal state ----------
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [editingIndex, setEditingIndex] = useState(-1); // index within 'displayed'

  // --------- Delete confirmation modal state ----------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // ------------ FORM ------------
  const emptyForm = {
    title: "",
    author: "",
    category: "",
    copies: "",
    coverFile: null,
    coverUrl: "",
    imageLoading: false,
    pdfFile: null,
    pdfUrl: "",
    pdfLoading: false,
    audioFile: null,
    audioUrl: "",
    audioLoading: false,
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  const rowToForm = (row) => ({
    id:row.id,
    title: row.title && row.title !== "—" ? row.title : "",
    author: row.author && row.author !== "—" ? row.author : "",
    category: row.category && row.category !== "—" ? row.category : "",
    copies:
      row.copies !== undefined && row.copies !== "—" ? String(row.copies) : "",
    coverFile: null,
    coverUrl: row.cover || "",
    imageLoading: false,
    pdfFile: null,
    pdfUrl: row.pdf || "",
    pdfLoading: false,
    audioFile: null,
    audioUrl: row.audio || "",
    audioLoading: false,
    description: row.description || "",
  });

  const onOpenCreate = () => {
    setMode("create");
    setEditingIndex(-1);
    setForm(emptyForm);
    setOpen(true);
  };

  // Accept row object (even from filtered/paged list) and resolve to its index inside 'displayed'
  const onOpenEdit = (row) => {
    const idx = displayed.findIndex((x) => x.id === row.id);
    if (idx === -1) return;
    setMode("edit");
    setEditingIndex(idx);
    setForm(rowToForm(displayed[idx]));
    setOpen(true);
  };

  const onClose = useCallback(() => setOpen(false), []);
  const onCloseConfirm = useCallback(() => setConfirmOpen(false), []);

  // lock page scroll when any modal open
  useEffect(() => {
    const anyOpen = open || confirmOpen;
    document.body.style.overflow = anyOpen ? "hidden" : "";
  }, [open, confirmOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // file inputs + 3s loader for image/pdf/audio
  const handleFile = (e, kind) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (kind === "image") {
      setForm((f) => ({ ...f, imageLoading: true }));
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setForm((f) => ({
          ...f,
          coverFile: file,
          coverUrl: url,
          imageLoading: false,
        }));``
      }, 3000);
    } else if (kind === "pdf") {
      setForm((f) => ({ ...f, pdfLoading: true }));
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setForm((f) => ({
          ...f,
          pdfFile: file,
          pdfUrl: url,
          pdfLoading: false,
        }));
      }, 3000);
    } else if (kind === "audio") {
      setForm((f) => ({ ...f, audioLoading: true }));
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setForm((f) => ({
          ...f,
          audioFile: file,
          audioUrl: url,
          audioLoading: false,
        }));
      }, 3000);
    }
  };

  // Upload popup (unused UI left as-is)
  const [uploadOpen, setUploadOpen] = useState(false);

  // 2s "Saved" toast
  const [savedToast, setSavedToast] = useState(false);

  /*const handleSave = async () => {
    if (!form.title) {
      alert("Please enter a book name.");
      return;
    }
    setSaving(true);

    if (mode === "edit" && editingIndex >= 0) {
      setDisplayed((prev) => {
        const next = [...prev];
        const row = { ...next[editingIndex] };
        row.title = form.title || "—";
        row.author = form.author || "—";
        row.category = form.category || "—";
        row.copies = form.copies || "—";
        row.cover = form.coverUrl || row.cover || PLACEHOLDER_IMG;
        row.pdf = form.pdfUrl || row.pdf || "";
        row.audio = form.audioUrl || row.audio || "";
        row.description = form.description || "";
        row.updatedOn = toYMD(new Date().toISOString());
        next[editingIndex] = row;
        return next;
      });
    } else {
      const newRow = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: form.title || "—",
        author: form.author || "—",
        category: form.category || "—",
        copies: form.copies || "—",
        updatedOn: toYMD(new Date().toISOString()),
        cover: form.coverUrl || PLACEHOLDER_IMG,
        pdf: form.pdfUrl || "",
        audio: form.audioUrl || "",
        description: form.description || "",
      };
      setDisplayed((prev) => [newRow, ...prev]);
    }

    setSaving(false);
    setOpen(false);

    // Show toast for 2s
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };*/


const handleSave = async () => {
  if (!form.title) {
    alert("Please enter a book name.");
    return;
  }
  setSaving(true);

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("category_id", form.category);  // backend expects category_id
    formData.append("copies", form.copies);
    formData.append("description", form.description);

    if (form.coverFile) formData.append("file", form.coverFile);
    if (form.pdfFile) formData.append("pdf", form.pdfFile);
    if (form.audioFile) formData.append("audio", form.audioFile);

    let res;
    if (mode ==="edit" && editingIndex >= 0) {
      // ✅ update book
      res = await axios.patch(`http://localhost:8000/books/${form.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // ✅ create new book
      res = await axios.post("http://localhost:8000/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Normalize backend response
    const savedBook = normalizeFromJson(res.data);

    // Update local state
    if (mode === "edit") {
      setDisplayed((prev) =>
        prev.map((b) => (b.id === savedBook.id ? savedBook : b))
      );
    } else {
      setDisplayed((prev) => [savedBook, ...prev]);
    }

    setOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  } catch (err) {
    console.error("Failed to save book:", err);
    alert("Error saving book!");
  } finally {
    setSaving(false);
  }
};


  /*const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    setDisplayed((prev) => prev.filter((x) => x.id !== pendingDeleteId));
    setPendingDeleteId(null);
    setConfirmOpen(false);
  };*/

  const requestDelete = (id) => {
  setPendingDeleteId(id);
  setConfirmOpen(true);
};

const confirmDelete = async () => {
  if (!pendingDeleteId) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:8000/books/${pendingDeleteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ update UI after successful delete
    setDisplayed((prev) => prev.filter((x) => x.id !== pendingDeleteId));

    setPendingDeleteId(null);
    setConfirmOpen(false);

    // optional success toast
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  } catch (err) {
    console.error("Failed to delete book:", err);
    alert("Error deleting book!");
  }
};

  const navItem =
    "flex items-center gap-2 px-3 py-3 text-gray-700 hover:text-sky-500 transition-colors";
  const navItemActive =
    "flex items-center gap-2 px-3 py-3 text-sky-600 font-medium";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Books</h1>

        {/* Filters */}
        <FilterBarBooks
          queryTitle={queryTitle}
          setQueryTitle={setQueryTitle}
          filterAuthor={filterAuthor}
          setFilterAuthor={setFilterAuthor}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          authors={options.authors}
          categories={options.categories}
          onReset={clearFilters}
        />

        {/* Card – soft shadow */}
        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Books List</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCreate}
                className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <Plus size={16} /> Add Book
              </button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="py-3 px-4">Book</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 whitespace-nowrap">No of copy</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((b) => (
                    <tr
                      key={b.id}
                      className="border-t last:border-b-0 odd:bg-gray-50 even:bg-white"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.cover || PLACEHOLDER_IMG}
                            alt={b.title}
                            className="h-10 w-10 rounded object-cover bg-gray-100 flex-shrink-0"
                          />
                          <p className="font-semibold text-gray-800 truncate">
                            {b.title}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{b.author}</td>
                      <td className="py-3 px-4 text-gray-700">{b.category}</td>
                      <td className="py-3 px-4 text-gray-700">{b.copies ?? "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(b)}
                            className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(b.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                        No books found with current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Same-to-same pagination design */}
            {filteredRows.length > 0 && (
              <Pagination
                page={tablePage}
                setPage={setTablePage}
                totalItems={filteredRows.length}
                pageSize={PAGE_SIZE}
              />
            )}
          </div>
        </section>
      </main>

      {/* ---------- Add/Edit Book Modal ---------- */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12">
            <div
              className="
                w-full max-w-3xl md:max-w-4xl mx-4 rounded-lg bg-white shadow-lg
                opacity-0 translate-y-3 scale-[0.98] animate-[popIn_.22s_ease-out_forwards]
              "
            >
              <div className="px-6 py-4 flex items-center gap-2">
                {mode === "edit" ? (
                  <Pencil size={20} className="text-gray-700" />
                ) : (
                  <Plus size={20} className="text-gray-700" />
                )}
                <h3 className="text-lg font-semibold text-gray-800">
                  {mode === "edit" ? "Edit book" : "Add book"}
                </h3>
              </div>

              <div className="px-6 pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1) Book */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Book</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="book name"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  {/* 2) Author */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Author</label>
                    <input
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                      placeholder="author name"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  {/* 3) Category */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Category</label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="category"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  {/* 4) No of copy */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">No of copy</label>
                    <input
                      name="copies"
                      value={form.copies}
                      onChange={handleChange}
                      placeholder="No of copy"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  {/* 5) Cover Image with loader */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Cover Image (.png, .jpg)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/*"
                        onChange={(e) => handleFile(e, "image")}
                        className="w-full rounded border border-gray-300 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                        {form.imageLoading ? (
                          <Loader2 className="animate-spin text-gray-400" size={20} />
                        ) : form.coverUrl ? (
                          <img
                            src={form.coverUrl}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Preview</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6) Book File (PDF) */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Book File (.pdf)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => handleFile(e, "pdf")}
                        className="w-full rounded border border-gray-300 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                        {form.pdfLoading ? (
                          <Loader2 className="animate-spin text-gray-400" size={20} />
                        ) : form.pdfUrl ? (
                          <FileText className="text-sky-600" size={24} />
                        ) : (
                          <span className="text-xs text-gray-400">PDF</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 7) Audio Clip */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Audio Clip (mp3/wav/m4a)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".mp3,.wav,.m4a,audio/*"
                        onChange={(e) => handleFile(e, "audio")}
                        className="w-full rounded border border-gray-300 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                        {form.audioLoading ? (
                          <Loader2 className="animate-spin text-gray-400" size={20} />
                        ) : form.audioUrl ? (
                          <FileAudio2 className="text-sky-600" size={24} />
                        ) : (
                          <span className="text-xs text-gray-400">Audio</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 8) Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="short description / notes"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-70"
                >
                  {mode === "edit" ? (saving ? "Updating…" : "Update") : saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Upload Popup ---------- */}
      {uploadOpen && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUploadOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg opacity-0 translate-y-2 animate-[popIn_.2s_ease-out_forwards]">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Upload</h3>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-sm text-gray-600">
                  Use the form inside <span className="font-medium">Add / Edit book</span> to attach the
                  cover image, PDF, and audio clip. This popup is just a quick note for users.
                </p>
              </div>
              <div className="px-6 py-4 bg-white flex justify-end">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseConfirm();
          }}
        >
          <div className="absolute inset-0 bg-black/50 opacity-0 animate-[fadeIn_.2s_ease-out_forwards]" />
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg opacity-0 translate-y-2 animate-[popIn_.2s_ease-out_forwards]">
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <AlertTriangle className="text-amber-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Are you sure you want to delete this record?
                    </h3>
                    {pendingDeleteId && (
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">
                          {displayed.find((x) => x.id === pendingDeleteId)?.title || "This book"}
                        </span>{" "}
                        will be permanently removed from the list.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseConfirm}
                  className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-md px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Saved toast (2s) */}
      {savedToast && (
        <div
          className="fixed bottom-6 right-6 z-[60] pointer-events-none animate-[toastIn_.25s_ease-out]"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="pointer-events-auto flex items-start gap-3 rounded-xl bg-white shadow-lg ring-1 ring-black/5 px-4 py-3">
            <div className="mt-0.5">
              <CheckCircle2 className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Saved</p>
              <p className="text-xs text-gray-600">Your changes have been updated.</p>
            </div>
          </div>
        </div>
      )}

      {/* animations */}
      <style>{`
        @keyframes fadeIn { to { opacity: 1 } }
        @keyframes popIn { to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}
