# AVI to MP4 Converter

Monorepo creado con frontend (React + Vite) y backend (FastAPI) para convertir videos de .avi a .mp4.

## Requisitos

- Node.js 20+
- Python 3.11+
- FFmpeg instalado y disponible en PATH

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Uso

1. Abre el frontend en el navegador.
2. Arrastra un archivo .avi al dropzone o selecciona uno.
3. Presiona Convertir para descargar el .mp4.
