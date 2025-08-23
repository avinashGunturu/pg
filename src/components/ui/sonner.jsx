import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

// Re-export the Toaster component
export { Toaster }

// Export Sonner as an alias for Toaster for backward compatibility
export const Sonner = Toaster;
