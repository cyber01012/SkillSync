import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "./AuthLayout";

export default function AuthModal({ mode, close, setMode, onGoogleAuth }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="group relative bg-white rounded-2xl w-[900px] h-[520px] overflow-hidden shadow-2xl"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="
              absolute top-3 right-3 z-[110]
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              inline-flex items-center justify-center
              w-9 h-9 rounded-full
              bg-black/5 hover:bg-black/10
              text-[#133B6C] hover:text-black
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#133B6C]
              pointer-events-auto
            "
          >
            <span className="text-xl leading-none">×</span>
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <AuthLayout
              key={mode}
              mode={mode}
              setMode={setMode}
              onGoogleAuth={onGoogleAuth}
            />
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}