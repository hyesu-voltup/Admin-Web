import * as React from "react";

/** Dialog Content props: open 상태와 닫기 콜백 */
interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * shadcn/ui 스타일 Dialog 모달
 * - open 시 오버레이 + 중앙 컨텐츠 박스, 오버레이/ESC 클릭 시 onOpenChange(false)
 */
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ open, onOpenChange, children, className = "", ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onOpenChange(false);
      };
      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }, [open, onOpenChange]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onOpenChange(false);
    };

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleOverlayClick}
        />
        <div
          ref={ref ?? contentRef}
          className={`relative z-50 w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-gray-100 bg-white p-6 shadow-card sm:max-w-lg sm:rounded-2xl ${className}`}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-bold text-gray-900 ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-8 ${className}`}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export { DialogContent, DialogHeader, DialogTitle, DialogFooter };
