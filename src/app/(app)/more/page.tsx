"use client";

import { MoreView } from "@/components/prototype/components/MoreView";
import { useTheme } from "@/components/shell/ThemeProvider";

export default function MorePage() {
  const { isDarkMode, toggleTheme } = useTheme();
  return <MoreView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
}
