import { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-4 dark:bg-neutral-900">
        {title && <div className="mb-2 text-lg font-semibold">{title}</div>}
        {children}
      </div>
      <button className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
    </div>
  );
}
