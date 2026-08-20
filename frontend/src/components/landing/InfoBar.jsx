import { MapPin, Star, Coffee, Waves } from "lucide-react";
import { motion } from "framer-motion";
import { INFO_CARDS } from "@/data/content";

const ICONS = { MapPin, Star, Coffee, Waves };

export const InfoBar = () => (
  <section id="info" className="relative z-20 -mt-24 md:-mt-16 px-6 lg:px-10" data-testid="info-bar">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
      {INFO_CARDS.map((c, i) => {
        const Icon = ICONS[c.icon];
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="glass rounded-2xl p-5 md:p-7 group cursor-default"
            data-testid={`info-card-${i}`}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gold/15 text-gold mb-4 group-hover:bg-gold group-hover:text-navy transition-colors duration-400">
              <Icon size={20} />
            </div>
            <div className="font-serif text-xl md:text-2xl text-cream">{c.title}</div>
            <div className="text-xs md:text-sm text-sand/60 mt-1">{c.sub}</div>
          </motion.div>
        );
      })}
    </div>
  </section>
);
