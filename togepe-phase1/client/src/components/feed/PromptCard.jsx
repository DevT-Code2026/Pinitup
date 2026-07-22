import { useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark, Share2, MoreHorizontal } from "lucide-react";
import sharePrompt from "../../utils/sharePrompt.js";

export default function PromptCard({
  prompt,
  index = 0,
  href,
  liked = false,
  saved = false,
  onToggleLike,
  onSave,
  onShare,
}) {
  const busyRef = useRef(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busyRef.current || !onToggleLike) return;
    busyRef.current = true;
    onToggleLike(prompt._id || prompt.id);
    setTimeout(() => {
      busyRef.current = false;
    }, 400);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) onSave(prompt._id || prompt.id);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(prompt);
    } else {
      sharePrompt({
        id: prompt._id || prompt.id,
        title: prompt.title,
      });
    }
  };

  const cardContent = (
    <div className="feed-prompt-card">
      {/* Image */}
      <div className="feed-prompt-card__image-wrapper">
        {(prompt.mediaUrl || prompt.imageUrl) ? (
          <img
            src={prompt.mediaUrl || prompt.imageUrl}
            alt={prompt.title}
            className="feed-prompt-card__image"
            loading={index < 10 ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="feed-prompt-card__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        {prompt.category && (
          <span className="feed-prompt-card__badge">{prompt.category}</span>
        )}

        {/* Hover overlay */}
        <div className="feed-prompt-card__overlay">
          <div className="feed-prompt-card__actions">
            <button
              className={`feed-prompt-card__action-btn ${
                liked ? "feed-prompt-card__action-btn--liked" : ""
              }`}
              onClick={handleLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>

            <button
              className={`feed-prompt-card__action-btn ${
                saved ? "feed-prompt-card__action-btn--saved" : ""
              }`}
              onClick={handleSave}
              aria-label={saved ? "Unsave" : "Save to board"}
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
            </button>

            <button
              className="feed-prompt-card__action-btn feed-prompt-card__action-btn--share"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 size={16} />
            </button>

            <button
              className="feed-prompt-card__action-btn"
              onClick={(e) => e.preventDefault()}
              aria-label="More options"
              style={{ marginLeft: "auto" }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          <h3 className="feed-prompt-card__title-overlay">{prompt.title}</h3>

          <div className="feed-prompt-card__author-row">
            <div className="feed-prompt-card__author-avatar">
              {(prompt.uploadedBy?.name || prompt.author || "U").charAt(0).toUpperCase()}
            </div>
            <span className="feed-prompt-card__author-name">
              {prompt.uploadedBy?.name || prompt.author || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        to={href}
        className="feed-prompt-card__link"
        aria-label={prompt.title}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
