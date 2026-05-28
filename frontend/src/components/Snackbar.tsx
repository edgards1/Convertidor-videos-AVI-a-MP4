type SnackbarProps = {
  open: boolean;
  message: string;
  tone?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Snackbar({ open, message, tone = "info", onClose }: SnackbarProps) {
  if (!open) return null;

  const toneStyles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900",
    error: "border-red-500/30 bg-red-500/10 text-red-900",
    info: "border-ink/20 bg-white/90 text-ink"
  }[tone];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2">
      <div
        className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm shadow-soft backdrop-blur ${toneStyles}`}
        role="status"
        aria-live="polite"
      >
        <span className="font-medium">{message}</span>
        <button
          type="button"
          className="text-xs uppercase tracking-[0.3em] opacity-70 transition hover:opacity-100"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
