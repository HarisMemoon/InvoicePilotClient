// src/components/ModalWrapper.jsx
import { X } from "lucide-react";
import { useRef } from "react";
import useModalScrollLock from "../hooks/useModalScrollLock";

export default function ModalWrapper({ children, onClose }) {
  const modalRef = useRef(null);
  useModalScrollLock(true, modalRef);

  return (
    <div ref={modalRef} className="modal-scroll-lock fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl custom-scrollbar dark:bg-gray-800"
        // 100% opacity for the modal itself
        style={{ opacity: 1 }}
      >
        {/* Close button – always visible */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X className="h-6 w-6" />
        </button>

        {children}
      </div>
    </div>
  );
}
