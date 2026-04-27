import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Cloud } from "lucide-react";
import { Half2Icon } from "@radix-ui/react-icons";

// Theme toggle component using same icons as Better Todo app
// Icons: Moon (dark), Sun (light), Half2Icon (tan), Cloud (cloud)
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Get the appropriate icon for current theme
  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon size={18} />;
      case "light":
        return <Sun size={18} />;
      case "tan":
        // Half2Icon from Radix uses different sizing
        return <Half2Icon style={{ width: 18, height: 18 }} />;
      case "cloud":
        return <Cloud size={18} />;
    }
  };

  // Get theme label for accessibility
  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "light":
        return "Light";
      case "tan":
        return "Tan";
      case "cloud":
        return "Cloud";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Current theme: ${getLabel()}. Click to toggle.`}
      title={`Theme: ${getLabel()}`}>
      {getIcon()}
    </button>
  );
}
