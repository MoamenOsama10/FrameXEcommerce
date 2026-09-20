import { useState, useRef } from "react";
import { ChevronsLeftRight } from "lucide-react";

export default function BeforeAfterSlider({ beforeImage, afterImage }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPosition(percent);
  };

  const handleMouseDown = () => (isDragging.current = true);
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };
  const handleTouchMove = (e) => updatePosition(e.touches[0].clientX);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-center font-display text-2xl md:text-3xl font-semibold mb-8">
        See the Transformation
      </h2>

      <div
        ref={containerRef}
        className="relative aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <img
          src={afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

    {position > 15 && (
  <span
    className="
      absolute 
      top-4 
      left-4 
      bg-black/60 
      text-white 
      text-xs 
      font-medium 
      px-3 
      py-1.5 
      rounded-full 
      z-10
      transition-opacity
    "
  >
    Before
  </span>
)}


{position < 85 && (
  <span
    className="
      absolute 
      top-4 
      right-4 
      bg-black/60 
      text-white 
      text-xs 
      font-medium 
      px-3 
      py-1.5 
      rounded-full 
      z-10
      transition-opacity
    "
  >
    After
  </span>
)}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-black">
            <ChevronsLeftRight size={18} strokeWidth={2} />
          </div>
        </div>
      </div>
    </section>
  );
}