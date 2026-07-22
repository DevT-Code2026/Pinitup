import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function LikeButton({
  contentId,
  liked = false,
  likesCount = 0,
  onToggle,
  size = "default",
}) {
  const navigate = useNavigate();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    // Unauthenticated visitors get redirected to login.
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Optimistic update.
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    onToggle?.(contentId, nextLiked, nextCount);
    try {
      const res = await api.post(`/likes/${contentId}`);
      // Server response is authoritative — reconcile if it differs.
      if (
        res.data.liked !== nextLiked ||
        res.data.likesCount !== nextCount
      ) {
        onToggle?.(contentId, res.data.liked, res.data.likesCount);
      }
    } catch {
      // Revert optimistic update on failure.
      onToggle?.(contentId, liked, likesCount);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const isSmall = size === "small";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.88 }}
      className={`like-button ${liked ? "like-button--active" : ""} ${
        isSmall ? "like-button--small" : ""
      }`}
      aria-label={liked ? "Unlike this prompt" : "Like this prompt"}
      disabled={busy}
    >
      <motion.span
        key={liked ? "liked" : "unliked"}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="like-button__icon"
      >
        <Heart
          size={isSmall ? 16 : 20}
          fill={liked ? "currentColor" : "none"}
          strokeWidth={liked ? 0 : 2}
        />
      </motion.span>

      {likesCount > 0 && (
        <span className="like-button__count">{likesCount}</span>
      )}
    </motion.button>
  );
}
