import { useMemo, useRef, useState } from "react";
import Dropzone from "./components/Dropzone";
import ProgressStatus from "./components/ProgressStatus";
import Snackbar from "./components/Snackbar";
import { convertVideo } from "./services/api";

type Status = "idle" | "uploading" | "processing" | "success" | "error";
type SnackbarTone = "success" | "error" | "info";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<"low" | "balanced" | "high">("balanced");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; tone: SnackbarTone }>(
    {
      open: false,
      message: "",
      tone: "info"
    }
  );
  const snackbarTimer = useRef<number | null>(null);

  const isBusy = status === "uploading" || status === "processing";

  const buttonLabel = useMemo(() => {
    if (status === "processing") return "Convirtiendo...";
    if (status === "uploading") return "Subiendo...";
    return "Convertir";
  }, [status]);

  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const showSnackbar = (message: string, tone: SnackbarTone) => {
    if (snackbarTimer.current) {
      window.clearTimeout(snackbarTimer.current);
    }
    setSnackbar({ open: true, message, tone });
    snackbarTimer.current = window.setTimeout(() => {
      setSnackbar((current) => ({ ...current, open: false }));
    }, 4000);
  };

  const handleNewFile = () => {
    handleReset();
    setFile(null);
  };

  const handleConvert = async () => {
    if (!file || isBusy) return;
    handleReset();
    setStatus("uploading");

    try {
      console.log("Enviando datos al API", { filename: file.name, size: file.size, quality });
      const blob = await convertVideo(file, quality, (uploadProgress) => {
        setProgress(uploadProgress.percent);
        if (uploadProgress.percent >= 90) {
          setStatus("processing");
        }
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setStatus("success");
      showSnackbar("Conversion completada. Tu MP4 esta listo.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo convertir el archivo.";
      setError(message);
      setStatus("error");
      showSnackbar(message, "error");
    }
  };

  const handleFileSelect = (nextFile: File) => {
    setFile(nextFile);
    setStatus("idle");
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.45em] text-ink/45">Convertidor AVI a MP4</span>
          <h1 className="text-3xl font-semibold text-ink md:text-4xl">
            Conversion rapida y facil de tus videos AVI
          </h1>
          <p className="max-w-2xl text-base text-ink/60">
            Sube tu AVI, espera la conversion y descarga al instante.
          </p>
        </header>

        <Dropzone file={file} isBusy={isBusy} onFileSelect={handleFileSelect} onError={setError} />

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.35em] text-ink/40">Calidad</span>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { value: "low", label: "Rapido" },
                { value: "balanced", label: "Equilibrado" },
                { value: "high", label: "Mejor calidad" }
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                  quality === option.value
                    ? "border-ink bg-ink text-fog"
                    : "border-ink/20 text-ink hover:-translate-y-0.5 hover:shadow-soft"
                }`}
                onClick={() => setQuality(option.value)}
                disabled={isBusy}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ProgressStatus status={status} progress={progress} message={error ?? undefined} />
          <div className="flex flex-col gap-3 md:items-center">
            {status !== "success" && (
              <button
                className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-fog transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleConvert}
                disabled={!file || isBusy}
              >
                {buttonLabel}
              </button>
            )}
            {downloadUrl && status === "success" && (
              <a
                href={downloadUrl}
                download="converted.mp4"
                className="rounded-full border border-ink/20 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.35em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                Descargar MP4
              </a>
            )}
            {status === "success" && (
              <button
                type="button"
                className="rounded-full border border-ink/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
                onClick={handleNewFile}
              >
                Cargar otro archivo
              </button>
            )}
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
