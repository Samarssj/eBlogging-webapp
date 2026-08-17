from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "images"

for source in ROOT.rglob("*.jpg"):
    target = source.with_suffix(".webp")
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((1200, 800), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=78, method=6)
    source.unlink()
    print(f"optimized {target.relative_to(ROOT)}")
