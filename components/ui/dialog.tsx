"use client";

import * as React from "react";
import * as DialogPrimitive from "@headlessui/react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
  return (
    <DialogPrimitive.Transition show={open} as={React.Fragment}>
      <DialogPrimitive.Dialog
        open={open}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Overlay */}
        <DialogPrimitive.Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        </DialogPrimitive.Transition.Child>

        {/* Dialog position wrapper */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Dialog content */}
          <DialogPrimitive.Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPrimitive.Dialog.Panel
              className={cn(
                "relative bg-white rounded-lg shadow-xl",
                "w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto",
                "transform transition-all"
              )}
            >
              {children}
            </DialogPrimitive.Dialog.Panel>
          </DialogPrimitive.Transition.Child>
        </div>
      </DialogPrimitive.Dialog>
    </DialogPrimitive.Transition>
  );
} 