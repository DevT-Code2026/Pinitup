import PromptCard from "./PromptCard";

export default function PromptGrid({ prompts = [], likedIds, onToggleLike }) {
  return (
    <div className="feed-prompt-grid">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={prompt._id}
          prompt={prompt}
          index={index}
          href={`/prompt/${prompt._id}`}
          liked={likedIds?.has(prompt._id)}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}