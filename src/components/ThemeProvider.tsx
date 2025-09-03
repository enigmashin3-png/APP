import { PropsWithChildren, useEffect } from "react";
import { useTheme } from "../store/theme";

export default function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}

