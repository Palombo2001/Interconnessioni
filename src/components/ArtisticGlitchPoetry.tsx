import React from "react";

interface ArtisticGlitchPoetryProps {
  text: string;
  glitchFactor: number;
  fontClass?: string;
}

export const ArtisticGlitchPoetry: React.FC<ArtisticGlitchPoetryProps> = ({
  text,
  glitchFactor,
  fontClass = "font-sans",
}) => {
  if (!text) return null;

  // Render the text as a stable, unified block so it wraps naturally at word boundaries
  // and stays perfectly synchronized, avoiding chaotic character-level overlaps.
  const shadowStyle = glitchFactor > 0.4
    ? "1px 0.5px 2px rgba(239, 68, 68, 0.4), -1px -0.5px 2px rgba(14, 165, 233, 0.4)"
    : "0 1px 3px rgba(0,0,0,0.3)";

  return (
    <div className="w-full px-2 py-1 flex items-center justify-center">
      <p 
        className={`${fontClass} text-slate-200 text-xs sm:text-sm md:text-base font-medium leading-relaxed tracking-wide text-center uppercase`}
        style={{
          textShadow: shadowStyle,
          letterSpacing: "0.06em",
        }}
      >
        {text}
      </p>
    </div>
  );
};

