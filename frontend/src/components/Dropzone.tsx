import { useCallback, useRef, useState } from "react";

type DropzoneProps = {
  file: File | null;
  isBusy: boolean;
  onFileSelect: (file: File) => void;
  onError: (message: string) => void;
};

export default function Dropzone({ file, isBusy, onFileSelect, onError }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const nextFile = files[0];

      // const maxSizeBytes = 500 * 1024 * 1024;
      // if (nextFile.size > maxSizeBytes) {
      //   onError("El archivo supera el tamano maximo permitido.");
      //   return;
      // }

      if (!nextFile.name.toLowerCase().endsWith(".avi")) {
        onError("Solo se permiten archivos .avi");
        return;
      }

      onFileSelect(nextFile);
    },
    [onFileSelect, onError]
  );

  const openFileDialog = () => {
    if (isBusy) return;
    inputRef.current?.click();
  };

  return (
    <div
      className={`relative rounded-3xl border border-dashed p-10 transition-all duration-300 ${
        isDragActive ? "border-ink bg-white" : "border-ink/15 bg-white/60"
      } ${isBusy ? "opacity-70" : "hover:-translate-y-0.5 hover:shadow-soft"}`}
      onClick={openFileDialog}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isBusy) setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        if (isBusy) return;
        handleFiles(event.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFileDialog();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".avi"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
        disabled={isBusy}
      />
      <div className="flex flex-col gap-3 text-center">
        <div className="text-2xl font-semibold">Arrastra tu AVI aqui</div>
        <div className="text-sm text-ink/60">O haz click para seleccionar un archivo</div>
        {file && (
          <div className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm">
            <span className="font-medium">{file.name}</span>
            <span className="text-ink/50">{Math.ceil(file.size / (1024 * 1024))} MB</span>
          </div>
        )}
      </div>
    </div>
  );
}
