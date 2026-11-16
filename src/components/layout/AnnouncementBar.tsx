export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-ink text-surface">
      <div className="jr-container flex items-center justify-center py-2 text-[11px] uppercase tracking-wide text-center">
        {message}
      </div>
    </div>
  );
}