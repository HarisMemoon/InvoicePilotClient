import { useEffect } from "react";

const lockState = new Map();

function lockElement(element) {
  const existing = lockState.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  lockState.set(element, { count: 1, overflow: element.style.overflow });
  element.style.overflow = "hidden";
}

function unlockElement(element) {
  const state = lockState.get(element);
  if (!state) return;

  state.count -= 1;
  if (state.count === 0) {
    element.style.overflow = state.overflow;
    lockState.delete(element);
  }
}

export default function useModalScrollLock(isOpen, modalRef) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const modal = modalRef?.current || document.querySelector(".modal-scroll-lock");
    const elements = new Set([document.documentElement, document.body]);

    for (let parent = modal?.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll" || parent.scrollHeight > parent.clientHeight) {
        elements.add(parent);
      }
    }

    elements.forEach(lockElement);
    return () => elements.forEach(unlockElement);
  }, [isOpen, modalRef]);
}
