import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Star } from 'lucide-react';
import api from '@/lib/api';

const MenuPreview = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/menu?bestseller=true');
        
        // Zabezpieczenie: sprawdzamy czy odpowiedź to tablica
        const data = response.data;
        if (Array.isArray(data)) {
          setItems(data);
        } else if (data && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Błąd podczas pobierania menu:', err);
        setError(true);
        setItems([]); // W razie błędu ustawiamy pustą tablicę zamiast undefined
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Zabezpieczenie: gwarancja, że zawsze operujemy na tablicy
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section id="menu-preview" className="py-24 bg-stone-900 text-stone-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Nagłówek sekcji */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center space-x-2 text-amber-500 mb-4"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">Nasze Specjały</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mb-6"
          >
            Wybrane Bestsellery
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-400 text-lg"
          >
            Poznaj najchętniej wybierane dania przygotowywane z pasją przez naszych szefów kuchni.
          </motion.p>
        </div>

        {/* Stan ładowania */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        )}

        {/* Stan błędu lub braku danych */}
        {!isLoading && (error || safeItems.length === 0) && (
          <div className="text-center py-12 text-stone-400">
            <p>Nie udało się wczytać menu lub lista jest pusta.</p>
          </div>
        )}

        {/* Lista dań (Bestsellery) */}
        {!isLoading && safeItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeItems.map((item, index) => (
              <motion.div
                key={item._id || item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700/50 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.isBestseller && (
                        <div className="absolute top-4 right-4 bg-amber-500 text-stone-950 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-current" />
                          Bestseller
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif font-bold text-stone-100 group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-lg font-semibold text-amber-500 ml-4 whitespace-nowrap">
                        {item.price} PLN
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-stone-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {item.allergens && item.allergens.length > 0 && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="flex flex-wrap gap-1 text-xs text-stone-500">
                      <span>Alergeny:</span>
                      <span>{Array.isArray(item.allergens) ? item.allergens.join(', ') : item.allergens}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuPreview;
