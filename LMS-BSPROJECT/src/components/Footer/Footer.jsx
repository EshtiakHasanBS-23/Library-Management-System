
// Footer.jsx
import React from "react";
import { ChevronUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full bg-[#1e2a31] text-gray-400">
      {/* Center on mobile/tablet, left on desktop */}
      <div className="mx-auto w-full max-w-screen-xl px-6 sm:px-10 lg:px-12 pt-14 pb-8 text-center md:text-center lg:text-left">
        {/* Row 1: Copyright */}
        <p className="m-0 text-[15px] leading-relaxed">
          Copyright (c) Brainstation 23 LMS - 2025. All rights reserved.
        </p>

        {/* Divider */}
        <hr className="my-6 border-[#2c3941]" />

        {/* Row 2: Links — centered on mobile/tablet, left on desktop */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-[15px]">
          <a
            href="#"
            className="hover:text-white transition-colors"
            aria-label="Data retention summary"
          >
            Data retention summary
          </a>
          <a
            href="#"
            className="hover:text-white transition-colors"
            aria-label="Get the mobile app"
          >
            Get the mobile app
          </a>
        </div>
      </div>

      {/* Back-to-top button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        className="group absolute right-4 top-6 sm:right-6 sm:top-8 grid h-9 w-9 place-items-center rounded-md bg-[#148dc0] text-white shadow-md transition hover:bg-[#0f7aa6] focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <ChevronUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
      </button>
    </footer>
  );
};

export default Footer;

