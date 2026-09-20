import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="
        group
        flex
        items-center
        gap-3
        text-sm
        font-medium
        text-gray-500
        hover:text-black
        transition-all
        duration-300
        mb-8
      "
    >

      <span
        className="
          w-9
          h-9
          rounded-full
          border
          border-gray-200
          flex
          items-center
          justify-center
          group-hover:border-black
          group-hover:-translate-x-1
          transition-all
          duration-300
        "
      >
        <ArrowLeft 
          size={16}
          strokeWidth={1.8}
        />
      </span>


      <span
        className="
          tracking-wide
        "
      >
        رجوع
      </span>

    </button>
  );
}