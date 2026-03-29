export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
