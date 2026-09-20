export default function AnimatedGridBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white pointer-events-none">
      {/* برواز 1 - أعلى الشمال */}
      <div className="absolute top-10 left-[8%] w-16 h-20 border-4 border-neutral-200 rounded-sm animate-floatFrame opacity-60" />

      {/* برواز 2 - أعلى اليمين */}
      <div className="absolute top-24 right-[12%] w-20 h-16 border-4 border-neutral-200 rounded-sm animate-floatFrameSlow opacity-50 rotate-6" />

      {/* برواز 3 - نص الصفحة يسار */}
      <div className="absolute top-1/2 left-[5%] w-14 h-18 border-4 border-neutral-300 rounded-sm animate-floatFrame opacity-40 -rotate-6" />

      {/* برواز 4 - نص الصفحة يمين */}
      <div className="absolute top-[45%] right-[7%] w-24 h-20 border-4 border-neutral-200 rounded-sm animate-floatFrameSlow opacity-50 rotate-3" />

      {/* برواز 5 - تحت الشمال */}
      <div className="absolute bottom-16 left-[15%] w-16 h-20 border-4 border-neutral-300 rounded-sm animate-floatFrame opacity-40 rotate-2" />

      {/* برواز 6 - تحت اليمين */}
      <div className="absolute bottom-10 right-[18%] w-20 h-16 border-4 border-neutral-200 rounded-sm animate-floatFrameSlow opacity-50 -rotate-3" />

      {/* تدرج خفيف جدًا يدي عمق للخلفية */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-50 to-white" />
    </div>
  );
}