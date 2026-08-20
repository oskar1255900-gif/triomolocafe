import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ATMOSPHERE_IMG } from "@/data/content";

export const Atmosphere = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <section id="atmosfera" ref={ref} className="relative h-[85vh] overflow-hidden grain flex items-center" data-testid="atmosphere-section">
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img src={ATMOSPHERE_IMG} alt="Panorama Bałtyku o zachodzie słońca" className="w-full h-[130%] object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-navy/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-transparent to-navy" />

      <div className="absolute top-10 left-0 right-0 opacity-30">
        <Marquee autoFill speed={40} gradient={false}>
          <span className="font-serif text-7xl md:text-9xl text-sand/40 italic mx-8">
            Sunset · Cocktails · Ocean Breeze · Premium Roast ·&nbsp;
          </span>
        </Marquee>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream font-light leading-tight text-balance"
        >
          Najpiękniejszy widok zaczyna się przy stoliku nad morzem.
        </motion.h2>
      </div>
    </section>
  );
};
