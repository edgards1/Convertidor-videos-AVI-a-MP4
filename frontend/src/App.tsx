import { useMemo, useState } from "react";
import Dropzone from "./components/Dropzone";
import ProgressStatus from "./components/ProgressStatus";
import { convertVideo } from "./services/api";

type Status = "idle" | "uploading" | "processing" | "success" | "error";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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

  const handleConvert = async () => {
    if (!file || isBusy) return;
    handleReset();
    setStatus("uploading");

    try {
      const blob = await convertVideo(file, (uploadProgress) => {
        setProgress(uploadProgress.percent);
        if (uploadProgress.percent >= 90) {
          setStatus("processing");
        }
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setStatus("success");
    } catch (err) {
      setError("No se pudo convertir el archivo. Intenta de nuevo.");
      setStatus("error");
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
            Conversion simple, sin friccion.
          </h1>
          <p className="max-w-2xl text-base text-ink/60">
            Sube tu AVI, espera la conversion y descarga al instante.
          </p>
        </header>

        <Dropzone file={file} isBusy={isBusy} onFileSelect={handleFileSelect} onError={setError} />

        <div className="flex flex-col gap-6">
          <ProgressStatus status={status} progress={progress} message={error ?? undefined} />
          <div className="flex flex-col gap-3 md:items-center">
            <button
              className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-fog transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleConvert}
              disabled={!file || isBusy}
            >
              {buttonLabel}
            </button>
            {downloadUrl && status === "success" && (
              <a
                href={downloadUrl}
                download="converted.mp4"
                className="rounded-full border border-ink/20 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.35em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                Descargar MP4
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
