import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";
import { CATEGORIES_ICONS } from "../utils/constants";

export default function CategoryFilter({ selectedCategory, onSelect }) {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const handleSelect = (catId) => {
    if (onSelect) {
      onSelect(catId);
    } else {
      navigate(catId ? `/products?category=${catId}` : "/products");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect("")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          !selectedCategory
            ? "bg-primary-600 text-white border-primary-600"
            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400"
        }`}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => handleSelect(cat._id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            selectedCategory === cat._id
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400"
          }`}
        >
          {CATEGORIES_ICONS[cat.name] || "🌱"} {cat.name}
        </button>
      ))}
    </div>
  );
}
