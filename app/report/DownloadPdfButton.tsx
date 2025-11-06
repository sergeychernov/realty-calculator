"use client";

import { useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type DownloadPdfButtonProps = {
  targetId: string;
  filename?: string;
};

export default function DownloadPdfButton({ targetId, filename = "report.pdf" }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
      setIsGenerating(true);

      const canvas = await html2canvas(target, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Обработать клонированный документ перед парсингом html2canvas
          // Используем computed styles из оригинального документа, которые браузер уже преобразовал в rgb
          const clonedTarget = clonedDoc.getElementById(targetId);
          if (!clonedTarget) return;

          const elements: HTMLElement[] = [
            clonedTarget as HTMLElement,
            ...Array.from(clonedTarget.querySelectorAll<HTMLElement>("*")),
          ];

          type ColorProp =
            | "color"
            | "backgroundColor"
            | "borderTopColor"
            | "borderRightColor"
            | "borderBottomColor"
            | "borderLeftColor"
            | "outlineColor";

          const colorStyleProperties: ColorProp[] = [
            "color",
            "backgroundColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "outlineColor",
          ];

          // Найти соответствующие элементы в оригинальном документе
          const originalTarget = document.getElementById(targetId);
          if (!originalTarget) return;

          const originalElements = [
            originalTarget as HTMLElement,
            ...Array.from(originalTarget.querySelectorAll<HTMLElement>("*")),
          ];

          const hasUnsupported = (v: string) => /(oklab|oklch|lab|lch)\(/i.test(v);

          for (let i = 0; i < elements.length && i < originalElements.length; i++) {
            const clonedEl = elements[i];
            const originalEl = originalElements[i];
            const computed = window.getComputedStyle(originalEl);

            // 1) Сначала прицельно цвета
            for (const property of colorStyleProperties) {
              const val = (computed as unknown as Record<string, string>)[property];
              if (!val) continue;
              if (!hasUnsupported(val)) {
                (clonedEl.style as unknown as Record<string, string>)[property] = val;
              } else {
                // Безопасные фолбэки
                const lower = property.toLowerCase();
                if (lower.includes("background")) (clonedEl.style as unknown as Record<string, string>)[property] = "#ffffff";
                else (clonedEl.style as unknown as Record<string, string>)[property] = "#000000";
              }
            }

            // 2) Убрать тени/контуры с непарсабельными цветами
            const boxShadow = computed.boxShadow;
            if (boxShadow && hasUnsupported(boxShadow)) {
              clonedEl.style.boxShadow = "none";
            }
            const textShadow = computed.textShadow as unknown as string;
            if (textShadow && hasUnsupported(textShadow)) {
              clonedEl.style.textShadow = "none";
            }
            const outlineColor = computed.outlineColor as unknown as string;
            if (outlineColor && hasUnsupported(outlineColor)) {
              clonedEl.style.outline = "none";
            }
            const borderColor = computed.borderColor as unknown as string;
            if (borderColor && hasUnsupported(borderColor)) {
              clonedEl.style.borderColor = "#000000";
            }
            const caretColor = (computed as unknown as Record<string, string>)["caretColor"];
            if (caretColor && hasUnsupported(caretColor)) {
              (clonedEl.style as unknown as Record<string, string>)["caretColor"] = "#000000";
            }
          }
        },
        ignoreElements: (el) => {
          // Пропускаем кросс-доменные изображения, чтобы не "травить" canvas
          if (el instanceof HTMLImageElement && el.src) {
            try {
              const url = new URL(el.src, window.location.href);
              return url.origin !== window.location.origin;
            } catch {
              return true;
            }
          }
          return false;
        },
      });

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      if (imgWidthPx === 0 || imgHeightPx === 0) {
        console.error("Canvas is empty", { width: imgWidthPx, height: imgHeightPx });
        throw new Error("Empty canvas");
      }

      // Проверить, что canvas содержит данные (не полностью белый)
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, Math.min(100, imgWidthPx), Math.min(100, imgHeightPx));
        const hasContent = imageData.data.some((val, idx) => idx % 4 !== 3 && val !== 255);
        if (!hasContent) {
          console.warn("Canvas appears to be completely white - may indicate rendering issue");
        }
      }

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();

      // Масштаб: сколько мм приходится на один пиксель по ширине, чтобы вписать в страницу
      const mmPerPx = pageWidthMm / imgWidthPx;
      // Высота одного PDF-листа в пикселях при таком масштабе
      const pageHeightPx = Math.floor(pageHeightMm / mmPerPx);

      let renderedHeightPx = 0;
      let isFirstPage = true;
      while (renderedHeightPx < imgHeightPx) {
        const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - renderedHeightPx);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgWidthPx;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          imgWidthPx,
          sliceHeightPx,
          0,
          0,
          imgWidthPx,
          sliceHeightPx
        );

        const sliceImgData = sliceCanvas.toDataURL("image/png");
        const sliceHeightMm = sliceHeightPx * mmPerPx;

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(sliceImgData, "PNG", 0, 0, pageWidthMm, sliceHeightMm);

        isFirstPage = false;
        renderedHeightPx += sliceHeightPx;
      }

      pdf.save(filename);
    } catch (err) {
      // минимальная диагностика, чтобы понять причину
      console.error("PDF generation error", err);
    } finally {
      setIsGenerating(false);
    }
  }, [targetId, filename]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      {isGenerating ? "Сохранение…" : "Скачать PDF"}
    </button>
  );
}


