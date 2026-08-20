import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, Kicker } from "@/components/Reveal";
import { ABOUT_IMG, ABOUT_POINTS } from "@/data/content";

export const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="o-nas" ref={ref} className="relative py-28 md:py-40 px-6 lg:px-10" data-testid="about-section">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative overflow-hidden rounded-[2rem] aspect-[4/5]">
            <motion.img
              style={{ y }}
              src={ABOUT_IMG}
              alt="Taras Trio Molo Cafe"
              className="w-full h-[116%] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -right-4 md:-right-8 glass rounded-2xl px-7 py-5">
            <div className="font-serif text-4xl text-gold">01</div>
            <div className="text-xs uppercase tracking-[0.2em] text-sand/70">Kawiarnia na molo</div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Reveal><Kicker>O nas</Kicker></Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-4xl md:text-6xl text-cream font-light leading-tight mt-5">
              Kawiarnia na samym molo
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 text-base md:text-lg text-sand/75 leading-relaxed max-w-2xl">
              Trio Molo Cafe to miejsce stworzone dla osób, które chcą odpocząć przy kawie,
              deserze lub koktajlu z widokiem na morze. Słona bryza, dźwięk fal i złote światło
              zachodzącego słońca — wszystko w jednym miejscu.
            </p>
          </Reveal>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {ABOUT_POINTS.map((p, i) => (
              <Reveal key={p} delay={0.3 + i * 0.08}>
                <div className="flex items-center gap-3 glass rounded-xl px-5 py-4">
                  <span className="w-7 h-7 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Check size={15} />
                  </span>
                  <span className="text-sm text-sand/90">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
