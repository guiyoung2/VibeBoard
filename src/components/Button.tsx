import { useThemeStore } from "../stores/themeStore";

type ButtonVariant = "primary" | "outline" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs rounded",
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-2 rounded-lg",
  lg: "py-3 px-4 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: isDark
      ? "bg-accent hover:bg-accent-hover text-white"
      : "bg-primary hover:bg-primary-soft text-white",
    outline:
      "border border-border text-text-main hover:bg-bg-muted transition-colors",
    danger:
      "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
  };

  const baseClass =
    "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  return (
    <button
      type={rest.type ?? "button"}
      disabled={disabled}
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
