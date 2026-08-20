import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';
import api from '@/lib/api';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/gallery');
        
        // Zabezpieczenie: sprawdzamy czy odpowiedź z API jest tablicą
        const data = response.data;
        if (Array.isArray(data)) {
          setImages(data);
        } else if (data && Array.isArray(data.images)) {
          setImages(data.images);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania galerii:', err);
        setImages([]); // Zabezpieczenie przed błędem w przypadku awarii API
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Gwarancja, że zawsze operujemy na bezpiecznej tablicy
  const safeImages = Array.isArray(images) ? images : [];

  // Wyciąganie unikalnych kategorii z pobranych zdjęć
  const categories = ['all', ...new Set(
    safeImages
      .map((img) => img.category)
      .filter(Boolean)
  )];

  // Filtrowanie zdjęć na podstawie wybranej kategorii
  const filteredImages = activeCategory === 'all'
    ? safeImages
    : safeImages.filter((img) => img.category === activeCategory);

  // Przygotowanie slajdów do przeglądarki Lightbox
  const lightboxSlides = filteredImages.map((img) => ({
    src: img.url || img.src || '',
    alt: img.title || img.alt || 'Zdjęcie z galerii',
    title: img.title,
    description: img.description
  }));

  return (
    <section id="gallery" className="py-24 bg-stone-950 text-stone-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nagłówek sekcji */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-2 text-amber-500 mb-4"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">Galeria</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mb-6"
          >
            Chwile Złapane w Kadrze
          </motion.h2>
        </div>

        {/* Filtry kategorii */}
        {!isLoading && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 capitalize ${
                  activeCategory === category
                    ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {category === 'all' ? 'Wszystkie' : category}
              </button>
            ))}
          </div>
        )}

        {/* Ładowanie */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        )}

        {/* Pusta galeria */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            Brak zdjęć do wyświetlenia w tej kategorii.
          </div>
        )}

        {/* Siatka zdjęć */}
        {!isLoading && filteredImages.length > 0 && (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image._id || image.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-900 cursor-pointer border border-stone-800"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={image.url || image.src}
                    alt={image.title || 'Zdjęcie w galerii'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        {image.title && (
                          <h3 className="text-lg font-serif font-bold text-stone-100">
                            {image.title}
                          </h3>
                        )}
                        {image.category && (
                          <span className="text-xs text-amber-500 font-medium capitalize">
                            {image.category}
                          </span>
                        )}
                      </div>
                      <div className="bg-amber-500/20 text-amber-500 p-2 rounded-full backdrop-blur-md">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Lightbox - Podgląd Pełnoekranowy */}
        <Lightbox
          open={lightboxIndex >= 0}
          index={lightboxIndex}
          close={() => setLightboxIndex(-1)}
          slides={lightboxSlides}
        />
      </div>
    </section>
  );
};

export default Gallery;
