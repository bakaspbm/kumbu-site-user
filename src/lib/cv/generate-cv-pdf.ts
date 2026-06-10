import { jsPDF } from "jspdf";
import { formatExperiencePeriod } from "@/lib/cv/experience";
import type { UserCv } from "@/types/job";

const MARGIN = 18;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

function drawKumbuBrand(doc: jsPDF, x: number, y: number): number {
  doc.setFillColor(255, 245, 245);
  doc.roundedRect(x, y, 52, 16, 3, 3, "F");
  doc.setDrawColor(214, 40, 40);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, 52, 16, 3, 3, "S");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(214, 40, 40);
  doc.text("Kumb", x + 6, y + 10.5);
  doc.setTextColor(30, 41, 59);
  doc.text("ú", x + 22.5, y + 10.5);
  doc.setFillColor(214, 40, 40);
  doc.circle(x + 46, y + 9.5, 1.1, "F");
  return y + 20;
}

async function loadLogo(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch("/logo_kumbu.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (!dataUrl?.startsWith("data:image/png")) return null;

    const dims = await new Promise<{ width: number; height: number } | null>(
      (resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      },
    );
    if (!dims) return null;
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function logoSizeMm(naturalW: number, naturalH: number): { w: number; h: number } {
  const maxH = 14;
  const ratio = naturalW / naturalH;
  return { w: maxH * ratio, h: maxH };
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

export async function downloadCvPdf(cv: UserCv, filename?: string): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const logo = await loadLogo();
  if (logo) {
    const { w, h } = logoSizeMm(logo.width, logo.height);
    doc.addImage(logo.dataUrl, "PNG", MARGIN, y, w, h);
    y += h + 6;
  } else {
    y = drawKumbuBrand(doc, MARGIN, y);
  }

  doc.setDrawColor(214, 40, 40);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  y = addWrappedText(doc, cv.fullName, MARGIN, y, CONTENT_W, 8) + 2;

  if (cv.profession) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(214, 40, 40);
    y = addWrappedText(doc, cv.profession, MARGIN, y, CONTENT_W, 6) + 4;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const contact = [
    cv.email,
    cv.phone,
    [cv.city, cv.province].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");
  if (contact) y = addWrappedText(doc, contact, MARGIN, y, CONTENT_W, 5) + 6;

  function sectionTitle(title: string) {
    if (y > 270) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(214, 40, 40);
    y = addWrappedText(doc, title.toUpperCase(), MARGIN, y, CONTENT_W, 5) + 2;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
  }

  if (cv.summary?.trim()) {
    sectionTitle("Sobre mim");
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.summary.trim(), MARGIN, y, CONTENT_W, 5) + 6;
  }

  if ((cv.experience ?? []).length > 0) {
    sectionTitle("Experiência profissional");
    for (const exp of cv.experience ?? []) {
      if (y > 255) {
        doc.addPage();
        y = MARGIN;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      y = addWrappedText(
        doc,
        `${exp.position} — ${exp.company}`,
        MARGIN,
        y,
        CONTENT_W,
        5,
      );
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      y = addWrappedText(
        doc,
        formatExperiencePeriod(exp),
        MARGIN,
        y,
        CONTENT_W,
        4,
      ) + 1;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      y = addWrappedText(doc, exp.description, MARGIN, y, CONTENT_W, 5) + 5;
    }
  }

  if ((cv.skills ?? []).length > 0) {
    sectionTitle("Competências");
    doc.setFontSize(10);
    y = addWrappedText(doc, (cv.skills ?? []).join(" · "), MARGIN, y, CONTENT_W, 5) + 4;
  }

  if ((cv.languages ?? []).length > 0) {
    sectionTitle("Idiomas");
    doc.setFontSize(10);
    y = addWrappedText(doc, (cv.languages ?? []).join(" · "), MARGIN, y, CONTENT_W, 5) + 4;
  }

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const footY = 287;
  doc.text("CV gerado em Kumbú — Marketplace Angola", MARGIN, footY);
  doc.text(new Date().toLocaleDateString("pt-AO"), PAGE_W - MARGIN, footY, {
    align: "right",
  });

  const safeName = cv.fullName.replace(/[^\w\s-]/g, "").trim() || "cv";
  doc.save(filename ?? `CV-${safeName}-Kumbu.pdf`);
}
