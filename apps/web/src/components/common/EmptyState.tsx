/** Renders a consistent placeholder when a collection has no records. */
export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty">
      ✦<p>{text}</p>
    </div>
  );
}
