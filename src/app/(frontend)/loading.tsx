export default function FrontendLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        <p className="text-white/40 font-vazir text-sm">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
