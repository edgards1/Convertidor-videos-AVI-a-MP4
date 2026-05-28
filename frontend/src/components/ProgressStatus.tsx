type ProgressStatusProps = {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message?: string;
};

const labels: Record<ProgressStatusProps["status"], string> = {
  idle: "Listo para convertir",
  uploading: "Subiendo archivo",
  processing: "Convirtiendo video",
  success: "Conversion completada",
  error: "Ocurrio un error"
};

export default function ProgressStatus({ status, progress, message }: ProgressStatusProps) {
  const isActive = status === "uploading" || status === "processing";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{labels[status]}</span>
          {isActive && <span className="loading-dot" aria-hidden="true" />}
        </div>
        <span className="text-ink/60">{status === "idle" ? "" : `${progress}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={`progress-bar h-full rounded-full transition-all duration-300 ${
            status === "error" ? "bg-coral" : isActive ? "progress-bar--active" : "bg-moss"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && <div className="text-sm text-coral">{message}</div>}
    </div>
  );
}
