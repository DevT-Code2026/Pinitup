/**
 * Build the canonical shareable URL for a prompt.
 */
function buildShareUrl(promptId) {
  return `${window.location.origin}/prompt/${promptId}`;
}

/**
 * Attempt Web Share API, then fall back to clipboard.
 * Returns { success: boolean, method: "share" | "clipboard" | null }.
 */
export default async function sharePrompt(prompt) {
  const url = buildShareUrl(prompt._id);

  if (navigator.share) {
    try {
      await navigator.share({
        title: prompt.title || "Check out this prompt",
        text: prompt.description || "",
        url,
      });
      return { success: true, method: "share" };
    } catch (err) {
      if (err.name === "AbortError") {
        return { success: false, method: null };
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: "clipboard" };
  } catch {
    return { success: false, method: null };
  }
}
