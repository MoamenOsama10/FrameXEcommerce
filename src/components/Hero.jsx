import AnimatedGridBackground from "./AnimatedGridBackground";

export default function Hero() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-10 overflow-hidden">
      <AnimatedGridBackground />

      <h2 className="relative z-10 text-center font-display text-lg md:text-xl font-semibold tracking-wide uppercase mt-24 mb-16 text-shine">
        Welcome to Our Store
      </h2>
    </section>
  );
}