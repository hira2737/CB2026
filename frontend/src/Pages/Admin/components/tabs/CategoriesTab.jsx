import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { normalizeArrayResponse } from "../../../../utils/movieFormatters";

const CategoriesTab = ({ categories, onAddClick, onDelete }) => {
  const safeCategories = normalizeArrayResponse(categories, ["categories"]);

  return (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
        Manage <span className="text-[#f5c518]">Categories</span>
      </h3>
      <button
        onClick={onAddClick}
        className="btn-fill-gold !px-8 !py-3 text-xs flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        <Plus size={16} /> Add Category
      </button>
    </div>

    <div className="card-dark overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="bg-white/5">
          <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            <th className="px-10 py-6 text-left">Name</th>
            <th className="px-10 py-6 text-left">Description</th>
            <th className="px-10 py-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {safeCategories.map((category) => (
            <tr
              key={category._id}
              className="hover:bg-white/5 transition-colors"
            >
              <td className="px-10 py-6 font-black">{category.name}</td>
              <td className="px-10 py-6 text-gray-400">
                {category.description || "—"}
              </td>
              <td className="px-10 py-6 text-right">
                <button
                  onClick={() => onDelete(category)}
                  className="text-rose-500 hover:text-rose-400 transition-colors"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {safeCategories.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="px-10 py-20 text-center text-gray-600 italic"
              >
                No categories found. Add one to get started!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default CategoriesTab;
