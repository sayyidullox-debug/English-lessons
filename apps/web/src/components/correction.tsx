"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildSegments, type FeedbackAnnotation } from "@/lib/feedback";
import { cn } from "@/lib/utils";

interface CorrectionProps {
  wrong: string;
  fix: string;
  why: string;
  /** Bosh sahifada chiziq qalamda chizilgandek paydo bo'ladi. */
  draw?: boolean;
  delay?: number;
}

/** Imtihonchi belgisi: xato so'z chizilgan, tuzatish qo'lda yozilgandek. */
export function Correction({ wrong, fix, why, draw, delay = 0 }: CorrectionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} />}
        className="cursor-help rounded-sm outline-offset-2"
        aria-label={`${wrong} xato, to'g'risi: ${fix}. ${why}`}
      >
        <span
          className={cn(!draw && "pen-wrong", draw && "pen-draw")}
          style={draw ? ({ "--draw-delay": `${delay}s` } as React.CSSProperties) : undefined}
        >
          {wrong}
        </span>
        {fix ? <span className="pen-fix ml-1 text-[0.95em]">{fix}</span> : null}
      </TooltipTrigger>
      <TooltipContent className="max-w-64 whitespace-normal leading-snug">{why}</TooltipContent>
    </Tooltip>
  );
}

/** Insho matni: belgilangan joylar qizil qalam bilan ko'rsatiladi. */
export function AnnotatedEssay({ text, annotations }: { text: string; annotations: FeedbackAnnotation[] }) {
  const segments = buildSegments(text, annotations);
  return (
    <div className="whitespace-pre-wrap font-serif text-lg leading-[1.9] [overflow-wrap:anywhere]">
      {segments.map((segment, i) =>
        segment.annotation ? (
          <Correction
            key={i}
            wrong={segment.text}
            fix={segment.annotation.fix}
            why={segment.annotation.why}
          />
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </div>
  );
}
