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
}
