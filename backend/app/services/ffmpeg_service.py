import logging
import os
import subprocess
from pathlib import Path

logger = logging.getLogger("ssd.converter")


def convert_avi_to_mp4(input_path: Path, output_path: Path, quality: str) -> None:
    presets = {
        "low": {"preset": "ultrafast", "crf": "28", "audio": "96k"},
        "balanced": {"preset": "veryfast", "crf": "26", "audio": "128k"},
        "high": {"preset": "slow", "crf": "20", "audio": "160k"}
    }
    settings = presets.get(quality, presets["balanced"])

    ffmpeg_cmd = os.getenv("FFMPEG_PATH", "ffmpeg")

    command = [
        ffmpeg_cmd,
        "-y",
        "-hide_banner",
        "-i",
        str(input_path),
        "-c:v",
        "libx264",
        "-preset",
        settings["preset"],
        "-crf",
        settings["crf"],
        "-c:a",
        "aac",
        "-b:a",
        settings["audio"],
        "-movflags",
        "+faststart",
        "-threads",
        "0",
        str(output_path)
    ]

    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    if process.stdout:
        for line in process.stdout:
            line = line.strip()
            if line:
                logger.info("ffmpeg: %s", line)

    return_code = process.wait()
    if return_code != 0:
        raise RuntimeError("FFmpeg failed")
