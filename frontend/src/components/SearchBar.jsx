import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Tag, Leaf } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import api from "../services/api";

export default function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions whenever the debounced value changes
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get(`/products/suggestions?q=${encodeURIComponent(q)}`)
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.data.suggestions || []);
          setOpen(true);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitSearch = useCallback(
    (value) => {
      const term = (value ?? query).trim();
      if (!term) return;
      setOpen(false);
      setQuery("");
      setSuggestions([]);
      navigate(`/products?keyword=${encodeURIComponent(term)}`);
    },
    [navigate, query]
  );

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "category") {
      setOpen(false);
      setQuery("");
      setSuggestions([]);
      navigate(`/products?category=${encodeURIComponent(suggestion.slug)}`);
    } else {
      commitSearch(suggestion.label);
    }
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") commitSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else {
        commitSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    commitSearch();
  };

  return (
    <div ref={containerRef} className={`relative flex w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search fresh produce…"
            autoComplete="off"
            className="input pl-9 pr-8 py-2 text-sm rounded-r-none border-r-0"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-haspopup="listbox"
          />
        </div>
        <button
          type="submit"
          className="btn-primary btn-sm rounded-l-none border border-primary-600 px-4"
        >
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {suggestions.length === 0 ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              <Search className="w-4 h-4 shrink-0" />
              No products found
            </li>
          ) : (
            (suggestions || []).map((s, i) => (
              <li
                key={`${s.type}-${s.label}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors
                  ${
                    i === activeIndex
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
              >
                {s.type === "category" ? (
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 shrink-0">
                    <Tag className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </span>
                ) : s.image ? (
                  <img
                    src={s.image}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  </span>
                )}
                <span className="flex-1 truncate">{s.label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 capitalize">
                  {s.type}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
