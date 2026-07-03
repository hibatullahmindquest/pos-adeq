export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center text-center text-sm text-muted py-10 px-4">
      {message}
    </div>
  );
}
