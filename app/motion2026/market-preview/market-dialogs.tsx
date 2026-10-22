"use client";

import { useEffect } from "react";

export default function MarketDialogs() {
  useEffect(() => {
    const root = document.querySelector(".market-page");
    if (!root) return;
    const handleClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>("button[data-market-open]");
      if (button) {
        const dialog = document.getElementById(button.dataset.marketOpen ?? "");
        if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
      }
      if (target instanceof HTMLDialogElement && event instanceof MouseEvent) {
        const bounds = target.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) target.close();
      }
    };
    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, []);
  return null;
}
