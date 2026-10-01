type ToastRegionProps = {
  notice: string;
  error: string;
  onClearNotice: () => void;
  onClearError: () => void;
};

/** Announces transient application feedback through accessible live regions. */
export function ToastRegion({
  notice,
  error,
  onClearNotice,
  onClearError
}: ToastRegionProps) {
  return (
    <>
      {notice && (
        <div className="toast ok" role="status" aria-live="polite" onClick={onClearNotice}>
          {notice}<button aria-label="Fermer">×</button>
        </div>
      )}
      {error && (
        <div className="toast error" role="alert" aria-live="assertive" onClick={onClearError}>
          {error}<button aria-label="Fermer">×</button>
        </div>
      )}
    </>
  );
}
