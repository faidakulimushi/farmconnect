import { useState } from "react";
import { Facebook, Link2, Check } from "lucide-react";
import toast from "react-hot-toast";

/**
 * One-click share buttons for Facebook, X (Twitter), and copy-link.
 * Props:
 *   title       – product/page title
 *   description – short text used as the tweet body
 *   url         – canonical URL to share (defaults to window.location.href)
 */
export default function SocialShare({ title = "", description = "", url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const tweetText = encodeURIComponent(
    `${title}${description ? " — " + description.slice(0, 80) : ""}\n`
  );

  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterHref  = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}`;

  const openPopup = (href) => {
    window.open(href, "_blank", "width=620,height=460,noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Share:</span>

      {/* Facebook */}
      <button
        onClick={() => openPopup(facebookHref)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#145DB7] text-white text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Facebook</span>
      </button>

      {/* X (Twitter) */}
      <button
        onClick={() => openPopup(twitterHref)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 active:bg-gray-700 text-white text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        aria-label="Share on X (Twitter)"
      >
        {/* Official X logo SVG (not available in older lucide-react versions) */}
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="hidden sm:inline">X (Twitter)</span>
      </button>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          ${copied
            ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        aria-label="Copy product link"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 shrink-0" />
          : <Link2 className="w-3.5 h-3.5 shrink-0" />}
        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy link"}</span>
      </button>
    </div>
  );
}
