import { TextAa } from "@phosphor-icons/react";
import { useFont } from "../context/FontContext";

export default function FontToggle() {
  const { fontFamily, toggleFontFamily } = useFont();

  const getLabel = () => {
    switch (fontFamily) {
      case "serif":
        return "Serif";
      case "sans":
        return "Sans";
      case "monospace":
        return "Mono";
    }
  };

  return (
    <button
      className="font-toggle"
      onClick={toggleFontFamily}
      aria-label={`Font: ${getLabel()}. Click to change.`}
      title={`Font: ${getLabel()}`}>
      <TextAa size={18} />
    </button>
  );
}
