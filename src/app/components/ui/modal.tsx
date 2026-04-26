import { useEffect } from "react";
import { cn } from "./utils";

export type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className={cn("modal-box", sizeClass[size], className)}>
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-border">
            {title && <div className="text-xl font-semibold">{title}</div>}
            {description && (
              <div className="mt-1 text-sm text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

