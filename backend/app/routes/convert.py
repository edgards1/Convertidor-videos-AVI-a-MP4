from pathlib import Path
from errno import ENOSPC
import logging
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse

from ..services.ffmpeg_service import convert_avi_to_mp4

router = APIRouter()
logger = logging.getLogger("ssd.converter")

BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"

ALLOWED_MIME_TYPES = {
    "video/x-msvideo",
    "video/avi",
    "application/octet-stream"
}


def ensure_dirs() -> None:
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def cleanup_file(path: Path) -> None:
    try:
        if path.exists():
            path.unlink()
    except OSError:
        pass


@router.post("/convert")
async def convert_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: str = Form("balanced")
) -> FileResponse:
    ensure_dirs()

    filename = file.filename or ""
    if not filename.lower().endswith(".avi"):
        raise HTTPException(status_code=400, detail="Solo archivos AVI")

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Tipo de archivo invalido")

    unique_id = uuid.uuid4().hex
    input_path = TEMP_DIR / f"{unique_id}.avi"
    output_path = OUTPUT_DIR / f"{unique_id}.mp4"

    quality = quality.strip().lower()
    if quality not in {"low", "balanced", "high"}:
        raise HTTPException(status_code=400, detail="Calidad invalida")

    try:
        logger.info("upload started filename=%s content_type=%s", filename, file.content_type)
        with input_path.open("wb") as buffer:
            total_bytes = 0
            last_logged = 0
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                buffer.write(chunk)
                total_bytes += len(chunk)
                if total_bytes - last_logged >= 50 * 1024 * 1024:
                    logger.info("upload progress bytes=%d", total_bytes)
                    last_logged = total_bytes

        logger.info("upload finished bytes=%d", total_bytes)

        logger.info("conversion started input=%s quality=%s", input_path.name, quality)
        convert_avi_to_mp4(input_path, output_path, quality)
        logger.info("conversion finished output=%s", output_path.name)
    except FileNotFoundError as exc:
        cleanup_file(input_path)
        logger.exception("ffmpeg not installed")
        raise HTTPException(status_code=500, detail="FFmpeg no esta instalado") from exc
    except OSError as exc:
        cleanup_file(input_path)
        cleanup_file(output_path)
        if exc.errno == ENOSPC:
            logger.exception("no space left on device")
            raise HTTPException(status_code=507, detail="Sin espacio en disco") from exc
        logger.exception("file write failed")
        raise HTTPException(status_code=500, detail="Error de escritura en disco") from exc
    except RuntimeError as exc:
        cleanup_file(input_path)
        cleanup_file(output_path)
        logger.exception("conversion failed")
        raise HTTPException(status_code=500, detail="Error en la conversion") from exc

    background_tasks.add_task(cleanup_file, input_path)
    background_tasks.add_task(cleanup_file, output_path)
    logger.info("cleanup scheduled input=%s output=%s", input_path.name, output_path.name)

    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="converted.mp4",
        background=background_tasks
    )
