import { Star } from "lucide-react";

export default function StarRating({ rating = 0, max = 5, interactive = false, onRate, size = "sm" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(i + 1)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
            aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
          >
            <Star
              className={`${sizes[size]} ${
                filled
                  ? "fill-accent-400 text-accent-400"
                  : half
                  ? "fill-accent-200 text-accent-300"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
