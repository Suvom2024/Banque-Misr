'use client'

interface FeaturedScenarioHeroProps {
  title: string
  subtitle: string
  description: string
  onExplore?: () => void
  onPreview?: () => void
}

export function FeaturedScenarioHero({
  title,
  subtitle,
  description,
  onExplore,
  onPreview,
}: FeaturedScenarioHeroProps) {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-bm-maroon to-bm-maroon-dark min-h-[420px] md:min-h-[480px] flex items-center shadow-2xl group transition-all duration-500 hover:shadow-glow">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear group-hover:scale-110 opacity-30"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcftRC4eGNNFJ-uVY-1FGZsQqFc6JM_6muPrsbhpvJFe6Hjsz6gtHTY4-hS_gbx911TiuP451IK-gou4bQCF8tZQeoX9NAPOTFJn_YNYnR9kOsJEe85AiotIqgOFPekMZUfWN9stO_STu4dqMKeKeXqYmWOPBMslMR71fClMvY0294WFNr08HoAOo3hgbh1k_T7vU-ZtdbPCkl6HQ2j8Infx0qTzw7D4LU6D5CLi0lxk4S9WreDwxmAYJHlkvJBuh0kyphhN8fFLk')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-bm-maroon via-bm-maroon/95 to-transparent"></div>
      <div className="absolute inset-0 hero-pattern"></div>
      <div className="relative z-10 px-8 md:px-12 lg:px-16 py-10 md:py-12 w-full md:w-2/3 lg:w-1/2">
        <div className="inline-flex items-center gap-2 bg-bm-gold/90 backdrop-blur-sm border border-bm-gold/30 text-bm-maroon-dark px-4 py-2 rounded-lg text-xs md:text-sm font-bold mb-6 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-bm-maroon-dark animate-pulse"></span>
          Trending Scenario
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg tracking-tight">
          {title} <br />
          <span className="text-bm-gold">{subtitle}</span>
        </h2>
        <p className="text-white/90 text-base md:text-lg mb-8 leading-relaxed max-w-lg font-normal">{description}</p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExplore}
            className="bg-bm-gold text-bm-maroon-dark font-extrabold py-4 px-8 rounded-xl hover:bg-bm-gold-dark transition-all flex flex-col items-center justify-center gap-0 transform hover:-translate-y-1 shadow-lg hover:shadow-xl min-w-[150px]"
          >
            <span className="text-base md:text-lg leading-none">Explore</span>
            <span className="flex items-center gap-1.5 text-base md:text-lg leading-none">
              Now
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </span>
          </button>
          <button
            onClick={onPreview}
            className="bg-bm-maroon-dark/80 backdrop-blur-sm text-white border-2 border-white/30 font-semibold py-4 px-6 rounded-xl text-base hover:bg-bm-maroon-dark hover:border-white/50 transition-all flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined">play_circle</span>
            Preview
          </button>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,32.3C59,43.1,47.1,51.8,35.1,59.3C23.1,66.8,11.1,73.1,-2.4,77.2C-15.9,81.4,-34.1,83.4,-49.2,76.3C-64.3,69.2,-76.3,53,-83.4,35.4C-90.5,17.8,-92.7,-1.2,-86.6,-17.8C-80.5,-34.4,-66.1,-48.6,-50.9,-55.6C-35.7,-62.6,-19.7,-62.4,-4.7,-54.3L10.3,-46.2Z"
            fill="#FFC72C"
            transform="translate(100 100)"
          ></path>
        </svg>
      </div>
    </section>
  )
}

