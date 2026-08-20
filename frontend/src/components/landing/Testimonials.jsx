import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Reveal, Kicker } from "@/components/Reveal";
import { TESTIMONIALS } from "@/data/content";

export const Testimonials = () => (
  <section className="relative py-28 md:py-36 px-6 lg:px-10" data-testid="testimonials-section">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <Reveal><Kicker>Opinie gości</Kicker></Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl md:text-6xl text-cream font-light mt-4">Co mówią o nas</h2>
        </Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.author}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="glass rounded-2xl p-8 relative"
            data-testid={`testimonial-${i}`}
          >
            <Quote className="text-gold/40 mb-5" size={34} />
            <p className="font-serif text-2xl text-cream leading-snug">„{t.quote}"</p>
            <div className="flex gap-1 mt-6 text-gold">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={16} fill="currentColor" />
              ))}
            </div>
            <div className="mt-4 text-sm text-sand/60">— {t.author}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
