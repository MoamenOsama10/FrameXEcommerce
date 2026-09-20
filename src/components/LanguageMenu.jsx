import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative flex items-center justify-center">

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          justify-center
          w-[18px]
          h-[18px]
          text-white/80
          hover:text-white
          transition-colors
        "
      >
        <Globe size={18} strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="
            absolute
            top-8
            right-0
            bg-white
            rounded-lg
            shadow-lg
            overflow-hidden
            w-32
            text-black
            z-30
          "
        >
          <button
            onClick={() => {
              setLanguage("en");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
              language === "en" ? "font-semibold" : ""
            }`}
          >
            English
          </button>

          <button
            onClick={() => {
              setLanguage("ar");
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
              language === "ar" ? "font-semibold" : ""
            }`}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
}