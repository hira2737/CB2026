import React from "react";

const SkeletonLoader = ({ count = 5 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="aspect-[2/3] rounded-3xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-pulse border border-white/5"
      />
    ))}
  </div>
);

export default SkeletonLoader;
