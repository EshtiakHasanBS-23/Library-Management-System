// components/Section/Section.jsx
import BookCard from "../BookCard/BookCard";

export default function Section({ title, books = [] }) {
  const items = (books || []).slice(0, 4); // keep only 4 cards

  return (
    <div className="mb-12">
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      {/* Responsive horizontal strip:
          - Mobile: 2 full cards visible
          - md (tablet): 2 full cards visible (no half 3rd card)
          - lg+ (desktop): 3 full cards visible
          - Total of 4 cards in list */}
      <div
        className="
          flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory items-stretch
          px-1 py-1 hide-scrollbar
          [scrollbar-width:none] [-ms-overflow-style:none]
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((book) => (
          <div
            key={book.id}
            className="
              snap-start shrink-0
              [flex-basis:calc(50%-1rem)]               /* mobile: 2 cards, gap-8 => 1rem half-gap */
              md:[flex-basis:calc(50%-1rem)]            /* tablet: 2 cards (no half 3rd) */
              lg:[flex-basis:calc((100%-4rem)/3)]       /* desktop: 3 cards, gap-8 => 2 gaps = 4rem */
              min-w-0 flex justify-start
            "
          >
            <BookCard
              id={book.id}
              title={book.title}
              author={book.author}
              image={book.image}
            />
          </div>
        ))}

        {/* Padding so last card fully shows */}
        <div className="shrink-0 pr-2" />
      </div>
    </div>
  );
}
