# Student Photo Extraction Notes

## What worked for `report photos.pdf`

The PDF contained five portraits as separate embedded JPEG image objects. Because the photos were embedded individually, they could be copied directly from the PDF without taking screenshots, cropping the page, or recompressing the images.

The extracted files retained their original dimensions of approximately 175 x 234 pixels.

## Repeatable process

1. Inspect the PDF with `pdfinfo` to confirm its page count, encryption status, and general structure.
2. Render the PDF pages to PNG with `pdftoppm` and visually inspect the roster. This establishes the student names and the order in which the portraits appear.
3. Use `pypdf` to inspect `page.images` on every page. Record each embedded image's filename, dimensions, and order.
4. Match the embedded image order to the visible student order in the rendered pages. Do not assume the PDF object names contain student names.
5. Write each image's original `image.data` bytes to disk. This preserves the embedded image instead of introducing screenshot or recompression loss.
6. Rename the files with stable, lowercase, hyphenated student names, such as `camilo-garcia.jpg`.
7. Verify every output with the `file` command and create a temporary contact sheet to confirm that each portrait matches its filename.
8. Delete temporary page renders and contact sheets after verification.

## Example extraction code

```python
from pathlib import Path

from pypdf import PdfReader


source = Path("report photos.pdf")
output_directory = Path("output/student-photos")

# Put these in the same order that the students and portraits appear in the PDF.
filenames = [
    "first-student.jpg",
    "second-student.jpg",
]

reader = PdfReader(source)
images = [image for page in reader.pages for image in page.images]

if len(images) != len(filenames):
    raise RuntimeError(
        f"Expected {len(filenames)} photos, but found {len(images)} embedded images."
    )

output_directory.mkdir(parents=True, exist_ok=True)

for image, filename in zip(images, filenames, strict=True):
    (output_directory / filename).write_bytes(image.data)
```

## Useful commands

```bash
pdfinfo "report photos.pdf"
pdftoppm -png -r 150 "report photos.pdf" "tmp/pdfs/report-page"
file output/student-photos/*.jpg
```

## Important edge cases

- Some PDFs flatten the whole page into one image. In that case, individual portraits cannot be extracted directly and must be cropped from a high-resolution page render.
- A PDF can store images in an order that differs from the visible reading order. Always compare the extracted photos with a rendered page before assigning names.
- Multi-page PDFs require collecting `page.images` from every page, as shown in the example.
- PDFs may contain logos or decorative graphics in addition to portraits. Filter or manually identify those before applying student filenames.
- Avoid overwriting an existing photo unless the new PDF is known to contain the intended replacement.
- Student portraits are sensitive records. Keep the extraction local and do not upload them to external services without authorization.
