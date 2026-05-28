import axios from "axios";

export type UploadProgress = {
  loaded: number;
  total?: number;
  percent: number;
};

export async function convertVideo(
  file: File,
  quality: "low" | "balanced" | "high",
  onProgress?: (progress: UploadProgress) => void
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("quality", quality);

  try {
    const response = await axios.post("/api/convert", formData, {
      responseType: "blob",
      timeout: 0,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? 0;
        const percent = total > 0 ? Math.round((event.loaded / total) * 90) : 0;
        onProgress({ loaded: event.loaded, total: event.total, percent });
      }
    });

    return response.data as Blob;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response?.data instanceof Blob) {
        try {
          const text = await response.data.text();
          const parsed = JSON.parse(text) as { detail?: string; message?: string };
          const detail = parsed.detail || parsed.message;
          if (detail) {
            throw new Error(detail);
          }
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== "Unexpected end of JSON input") {
            throw parseError;
          }
        }
      }
      if (typeof response?.data === "object" && response?.data) {
        const detail = (response.data as { detail?: string; message?: string }).detail;
        if (detail) {
          throw new Error(detail);
        }
      }
      throw new Error("Error al convertir el archivo");
    }
    throw error;
  }
}
