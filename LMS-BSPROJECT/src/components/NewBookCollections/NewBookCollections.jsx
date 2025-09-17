// src/components/NewBookCollections/NewBookCollections.jsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import BookCard from "../../components/BookCard/BookCard";

const books = [
  { id: 1, title: "Fundamentals of Software Testing, 2nd Edition", author: " by Bernard Homès", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643480/d9_wxocuv.jpg", rating: 4, status: "Available", category: "Development" },
  { id: 2, title: "The Coming Wave: AI, Power, and Our Future", author: " Mustafa Suleyman", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643606/ai5_ua61lt.jpg", rating: 4.8, status: "Available", category: "General" },
  { id: 3, title: "Co-Intelligence: Living and Working with AI", author: "Ethan Mollick", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643734/ai6_mh7ans.jpg", rating: 5, status: "Out Of Stock", category: "General" },
  { id: 4, title: "Ace the Data Science Interview: 201 Real Interview Questions Asked By FAANG, Tech Startups, & Wall Street", author: " Nick Singh &  Kevin Huo", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643910/DS4_ifbyg1.jpg", rating: 4.8, status: "Out Of Stock", category: "Development" },
  { id: 5, title: "Python for Data Analysis", author: "by Wes McKinney", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644368/ds1_qqs3rd.jpg", rating: 4, status: "Available", category: "Development" },
  { id: 6, title: "Data Mining: Concepts and Techniques", author: "Jiawei Han & Jian Pei", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644513/datamining_oy6mhy.jpg", rating: 5, status: "Available", category: "Development" },
  { id: 7, title: "Python Crash Course-Institucionstas", author: "Eric Matthes", image: "https://covers.openlibrary.org/b/id/8671733-L.jpg", rating: 5, status: "Available", category: "Development" },
  { id: 8, title: "Eloquent JavaScript Third Edition", author: "Marijn Haverbeke", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754645070/el_ruimml.jpg", rating: 4, status: "Available", category: "Development" },
  { id: 9, title: "Practice of System and Network Administration", author: "Thomas Limoncelli & Strata Chalup ", image: "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644753/network_mezj51.jpg", rating: 5, status: "Available", category: "IT & Software" },
];

export default function NewBookCollections() {
  const popRowRef = useRef(null);
  const navigate = useNavigate();

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
                  book={{ ...b, coverImage: b.image }} // map to the shared card shape
                  variant="row"
                  status={b.status}
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




// // src/components/NewBookCollections/NewBookCollections.jsx
// import { useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight, ChevronLeft } from "lucide-react";
// import BookCard from "../../components/BookCard/BookCard";

// const books = [
//   {
//     id: 1,
//     title: "Fundamentals of Software Testing, 2nd Edition",
//     author: " by Bernard Homès",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643480/d9_wxocuv.jpg",
//     rating: 4,
//     status: "Available",
//     category: "Development",
//   },
//   {
//     id: 2,
//     title: "The Coming Wave: AI, Power, and Our Future",
//     author: " Mustafa Suleyman",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643606/ai5_ua61lt.jpg",
//     rating: 4.8,
//     status: "Available",
//     category: "General",
//   },
//   {
//     id: 3,
//     title: "Co-Intelligence: Living and Working with AI",
//     author: "Ethan Mollick",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643734/ai6_mh7ans.jpg",
//     rating: 5,
//     status: "Out Of Stock",
//     category: "General",
//   },
//   {
//     id: 4,
//     title:
//       "Ace the Data Science Interview: 201 Real Interview Questions Asked By FAANG, Tech Startups, & Wall Street",
//     author: " Nick Singh &  Kevin Huo",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754643910/DS4_ifbyg1.jpg",
//     rating: 4.8,
//     status: "Out Of Stock",
//     category: "Development",
//   },
//   {
//     id: 5,
//     title: "Python for Data Analysis",
//     author: "by Wes McKinney",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644368/ds1_qqs3rd.jpg",
//     rating: 4,
//     status: "Available",
//     category: "Development",
//   },
//   {
//     id: 6,
//     title:
//       "Data Mining: Concepts and Techniques (The Morgan Kaufmann Series in Data Management Systems)",
//     author: "Jiawei Han, Jian Pei &  Hanghang Tong ",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644513/datamining_oy6mhy.jpg",
//     rating: 5,
//     status: "Available",
//     category: "Development",
//   },
//   {
//     id: 7,
//     title: "Python Crash Course",
//     author: "Eric Matthes",
//     image: "https://covers.openlibrary.org/b/id/8671733-L.jpg",
//     rating: 5,
//     status: "Available",
//     category: "Development",
//   },
//   {
//     id: 8,
//     title: "Eloquent JavaScript",
//     author: "Marijn Haverbeke",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754645070/el_ruimml.jpg",
//     rating: 4,
//     status: "Available",
//     category: "Development",
//   },
//   {
//     id: 9,
//     title: "Practice of System and Network Administration",
//     author: "Thomas Limoncelli, Christina Hogan & Strata Chalup ",
//     image:
//       "https://res.cloudinary.com/dbm4aqhwi/image/upload/v1754644753/network_mezj51.jpg",
//     rating: 5,
//     status: "Available",
//     category: "IT & Software",
//   },
// ];

// export default function NewBookCollections() {
//   const popRowRef = useRef(null);
//   const navigate = useNavigate();

//   const goTo = (b) =>
//     navigate(`/book/${b.id}`, {
//       state: { fromSlider: b },
//     });

//   const scrollByAmount = (ref, dir = 1) => {
//     const el = ref?.current;
//     if (!el) return;
//     const step = Math.round(el.clientWidth * 0.9);
//     el.scrollBy({ left: dir * step, behavior: "smooth" });
//   };

//   const handleRowScroll = () => {};

//   return (
//     <section className="mt-12">
//       <div className="mb-8 rounded-lg border border-gray-300 overflow-hidden">
//         <div className="px-4 py-3 bg-white flex items-center justify-between">
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//             NEW BOOK COLLECTIONS
//           </h2>

//           <div className="hidden sm:flex gap-2">
//             <button
//               onClick={() => scrollByAmount(popRowRef, -1)}
//               className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
//               aria-label="Scroll left"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//             <button
//               onClick={() => scrollByAmount(popRowRef, 1)}
//               className="p-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
//               aria-label="Scroll right"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="border-t border-gray-200 relative bg-white">
//           <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
//           <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

//           <div
//             ref={popRowRef}
//             onScroll={handleRowScroll}
//             className="overflow-x-auto no-scrollbar"
//           >
//             <div className="flex gap-5 p-3 sm:p-4 snap-x snap-mandatory">
//               {books.map((b) => (
//                 <BookCard
//                   key={b.id}
//                   book={b}
//                   variant="row"
//                   status={b.status}
//                   onClick={() => goTo(b)}
//                   onReadThisBook={() => goTo(b)}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="sm:hidden absolute inset-y-0 left-1 flex items-center">
//             <button
//               onClick={() => scrollByAmount(popRowRef, -1)}
//               className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
//               aria-label="Scroll left"
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </button>
//           </div>
//           <div className="sm:hidden absolute inset-y-0 right-1 flex items-center">
//             <button
//               onClick={() => scrollByAmount(popRowRef, 1)}
//               className="p-2 rounded-md border border-gray-300 bg-white/90 hover:bg-white shadow"
//               aria-label="Scroll right"
//             >
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

