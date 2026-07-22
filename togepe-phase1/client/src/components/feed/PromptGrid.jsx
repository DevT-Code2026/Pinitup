import PromptCard from "./PromptCard";

export default function PromptGrid({ prompts = [], likedIds, savedIds, onToggleLike, onSave, onShare }) {
  return (
    <div className="feed-prompt-grid">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={prompt._id}
          prompt={prompt}
          index={index}
          href={`/prompt/${prompt._id}`}
          liked={likedIds?.has(prompt._id)}
          saved={savedIds?.has(prompt._id)}
          onToggleLike={onToggleLike}
          onSave={onSave}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
