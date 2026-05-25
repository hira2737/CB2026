import React from "react";

const SectionWrapper = ({ id, eyebrow, title, count, children }) => (
  <section id={id} className="max-w-screen-2xl mx-auto px-5 md:px-12 py-12 md:py-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase font-black tracking-[0.25em] text-[#f5c518] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
          {title}
        </h2>
      </div>
      {typeof count === "number" && (
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {count} movies
        </p>
      )}
    </div>
    {children}
  </section>
);

export default SectionWrapper;
