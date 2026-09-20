import bannerImage from "../assets/feature-banner.jpg";

export default function FeatureBanner() {
  return (
    <div className="px-6 pt-4 pb-8">
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src={bannerImage}
          alt="Frames that reflect your personality"
          className="w-full h-auto block"
        />

       
      </section>
    </div>
  );
}