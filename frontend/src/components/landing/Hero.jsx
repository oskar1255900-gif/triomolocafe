import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { HERO_IMG } from "@/data/content";
import { CONTACT } from "@/data/content";
import { Waves } from "@/components/Waves";

const line = {
  hidden: { y: "115%" },
  visible: (i) => ({
    y: "0%",
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 + i * 0.18 },
  }),
};

const MaskLine = ({ children, i }) => (
  <span className="block overflow-hidden">
    <motion.span custom={i} variants={line} initial="hidden" animate="visible" className="block">
      {children}
    </motion.span>
  </span>
);

export const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="hero" ref={ref} className="relative h-[100svh] w-full overflow-hidden grain" data-testid="hero-section">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src={HERO_IMG}
          alt="Taras Trio Molo Cafe o zachodzie słońca"
          className="w-full h-[115%] object-cover animate-slow-zoom"
        />
      </motion.div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-navy/20 to-navy" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/70 via-transparent to-transparent" />
      {/* sunset glow */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gold/20 blur-[120px] rounded-full animate-glow" />

      <motion.div style={{ opacity }} className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="uppercase tracking-[0.35em] text-xs md:text-sm text-gold mb-6"
        >
          Kawiarnia na molo · Kołobrzeg
        </motion.span>

        <h1 className="font-serif text-cream font-light leading-[0.95] text-5xl sm:text-7xl lg:text-8xl">
          <MaskLine i={0}>Trio Molo Cafe</MaskLine>
          <span className="block overflow-hidden mt-2">
            <motion.span custom={1} variants={line} initial="hidden" animate="visible" className="block text-3xl sm:text-4xl lg:text-5xl italic text-sand/90">
              gdzie kawa smakuje lepiej
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span custom={2} variants={line} initial="hidden" animate="visible" className="block text-3xl sm:text-4xl lg:text-5xl italic text-sand/90">
              z widokiem na Bałtyk
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.9 }}
          className="mt-8 max-w-xl text-base md:text-lg text-sand/80 leading-relaxed"
        >
          Kawa, desery i koktajle na samym molo w Kołobrzegu.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <a href="#menu" className="btn-gold rounded-full px-8 py-4 text-sm font-semibold text-center" data-testid="hero-menu-btn">
            Zobacz menu
          </a>
          <a
            href={CONTACT.directions}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-8 py-4 text-sm font-semibold text-center border border-sand/40 text-cream hover:border-gold hover:text-gold transition-colors duration-300"
            data-testid="hero-directions-btn"
          >
            Wyznacz trasę
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll arrow */}
      <a href="#info" className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 text-sand/70 flex flex-col items-center gap-2" data-testid="hero-scroll-arrow">
        <span className="text-[10px] uppercase tracking-[0.3em]">Przewiń</span>
        <ChevronDown className="animate-soft-bounce" size={22} />
      </a>

      <Waves />
    </section>
  );
};
