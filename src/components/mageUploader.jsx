import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

export default function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      {!preview ? (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl aspect-square cursor-pointer hover:border-accent transition-colors text-muted"
        >
          <ImagePlus size={28} strokeWidth={1.5} />
          <span className="text-sm">اختر صورة من جهازك</span>
        </label>
      ) : (
        <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}