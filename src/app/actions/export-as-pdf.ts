import { Novel } from "@/lib/schemas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

export async function exportAsPDF(novel: Novel) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Function to wrap text within width limits
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const lines: { text: string; isLastLine: boolean }[] = [];
    const paragraphs = text.split("\n");

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(" ");
      let currentLine = "";
      let lineWords: string[] = [];

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (textWidth > maxWidth) {
          lines.push({ text: currentLine, isLastLine: false });
          currentLine = word;
          lineWords = [word];
        } else {
          currentLine = testLine;
          lineWords.push(word);
        }
      });

      if (currentLine) {
        lines.push({ text: currentLine, isLastLine: true }); // Mark the last line
      }
      lines.push({ text: "", isLastLine: false }); // Empty line for spacing
    });

    return lines;
  };

  // Add title page
  const titlePage = pdfDoc.addPage();
  const { width, height } = titlePage.getSize();

  titlePage.drawText(novel.config.title, {
    x: (width - font.widthOfTextAtSize(novel.config.title, 24)) / 2,
    y: height - 100,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  });

  titlePage.drawText(
    `By: ${novel.config.characters.map((c) => c.name).join(", ")}`,
    {
      x:
        (width -
          font.widthOfTextAtSize(
            novel.config.characters.map((c) => c.name).join(", "),
            16
          )) /
        2,
      y: height - 140,
      size: 16,
      font,
      color: rgb(0.2, 0.2, 0.2),
    }
  );

  // Process each chapter
  novel.chapters.forEach((chapter, chapterIndex) => {
    let page = pdfDoc.addPage();
    let y = height - 80;
    const margin = 50;
    const lineHeight = 16;

    // Centered Chapter Title
    const chapterTitle = `Chapter ${chapterIndex + 1}: ${chapter.title}`;
    page.drawText(chapterTitle, {
      x: (width - font.widthOfTextAtSize(chapterTitle, 18)) / 2,
      y,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Chapter Summary
    const summaryLines = wrapText(chapter.summary, width - 2 * margin, 12);
    summaryLines.forEach(({ text }) => {
      if (y < margin) {
        page = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(text, {
        x: (width - font.widthOfTextAtSize(text, 10)) / 2,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= lineHeight;
    });

    y -= 20; // Extra spacing before paragraphs

    // Process each paragraph
    chapter.paragraphs.forEach((paragraph) => {
      const paragraphLines = wrapText(
        paragraph.content,
        width - 2 * margin,
        12
      );

      paragraphLines.forEach(({ text, isLastLine }) => {
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - 50;
        }

        if (!isLastLine) {
          // Justify all lines except the last one
          const words = text.split(" ");
          let x = margin;
          const spaceWidth =
            words.length > 1
              ? (width -
                  2 * margin -
                  font.widthOfTextAtSize(text.replace(/\s+/g, ""), 12)) /
                (words.length - 1)
              : 0;

          words.forEach((word, i) => {
            page.drawText(word, { x, y, size: 12, font, color: rgb(0, 0, 0) });
            x +=
              font.widthOfTextAtSize(word, 12) +
              (i < words.length - 1 ? spaceWidth : 0);
          });
        } else {
          // Left-align the last line
          page.drawText(text, {
            x: margin,
            y,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          });
        }

        y -= lineHeight;
      });

      y -= 10; // Extra spacing after paragraphs

      // Add image if available
      if (paragraph.image) {
        fetch(paragraph.image)
          .then((res) => res.arrayBuffer())
          .then(async (imageData) => {
            const image = await pdfDoc.embedPng(imageData);
            const imgWidth = 200;
            const imgHeight = 200;
            if (y < imgHeight + margin) {
              page = pdfDoc.addPage();
              y = height - 50;
            }
            page.drawImage(image, {
              x: (width - imgWidth) / 2, // Center image
              y: y - imgHeight,
              width: imgWidth,
              height: imgHeight,
            });
            y -= imgHeight + 20; // Space after image
          });
      }
    });
  });

  // Save PDF and trigger download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, `${novel.config.title}.pdf`);
}
