export default function AnnouncementBar() {
  const message = "Welcome to FrameX";
  const items = Array(8).fill(message);

  return (
    <div className="bg-black text-white overflow-hidden py-2">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.map((text, i) => (
          <span key={i} className="text-xs tracking-wide mx-8">
            {text}
          </span>
        ))}
        {items.map((text, i) => (
          <span key={`dup-${i}`} className="text-xs tracking-wide mx-8">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}