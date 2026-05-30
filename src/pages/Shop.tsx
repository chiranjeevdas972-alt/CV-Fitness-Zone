import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ShoppingBag, 
  Play, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Zap,
  Info,
  Dumbbell,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Form';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: 'gain' | 'loss' | 'recovery';
  price: number;
  image: string;
  description: string;
  videoUrl: string;
  rating: number;
  features: string[];
}

const PRODUCTS: Product[] = [
  // Body Gain Products (from Image 1)
  {
    id: 'gain-mb',
    name: 'Muscleblaze Weight Gainer',
    category: 'gain',
    price: 1749,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=600',
    description: 'High-calorie formula with added Digezyme for better digestion and nutrient absorption.',
    videoUrl: 'https://www.youtube.com/embed/A66lYhD0oNo',
    rating: 4.8,
    features: ['Added Digezyme', 'High Calorie', 'Rapid Gain', 'Vitamin Enriched']
  },
  {
    id: 'gain-nb',
    name: 'Nutrabay Gold Bulk Up Mass Gainer',
    category: 'gain',
    price: 3699,
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=600',
    description: 'Advanced mass gainer designed for serious athletes looking to build significant size.',
    videoUrl: 'https://www.youtube.com/embed/9BqE6aI_w00',
    rating: 4.9,
    features: ['Clean Carbs', 'High Protein', 'Gluten Free', 'Zero Added Sugar']
  },
  {
    id: 'gain-nm',
    name: 'Nutrimuscle Massive Weight Gainer',
    category: 'gain',
    price: 509,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    description: 'Affordable and effective massive weight gainer for beginners and hard-gainers.',
    videoUrl: 'https://www.youtube.com/embed/6iOq8V69_1w',
    rating: 4.5,
    features: ['Economical', 'Fast Absorption', 'Multiple Flavors', 'Choco Treat']
  },
  {
    id: 'gain-gnc',
    name: 'GNC Pro Performance Weight Gainer',
    category: 'gain',
    price: 2649,
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=600',
    description: 'Scientifically formulated gainer for performance and muscle mass maintenance.',
    videoUrl: 'https://www.youtube.com/embed/Xq-IByZf7yM',
    rating: 4.7,
    features: ['Performance Formula', '3KG Pack', 'Balanced Macros', 'Great Taste']
  },
  {
    id: 'gain-bl',
    name: 'Beastlife Anabolic Mass Gainer',
    category: 'gain',
    price: 549,
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600',
    description: 'Anabolic mass gainer with Ultrasorb Tech for enhanced recovery and growth.',
    videoUrl: 'https://www.youtube.com/embed/V_8TfK0XzZg',
    rating: 4.6,
    features: ['Ultrasorb Tech', 'Anabolic Growth', 'Quick Recovery', 'Budget Friendly']
  },
  {
    id: 'gain-os',
    name: 'One Science Premium Whey Duo',
    category: 'gain',
    price: 5999,
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=600',
    description: 'Premium combo pack including whey protein and creatine for ultimate gains.',
    videoUrl: 'https://www.youtube.com/embed/O8vMT8OEnR0',
    rating: 4.9,
    features: ['Premium Quality', 'Combo Pack', '100% Whey', 'Creatine Included']
  },

  // Body Loss / Performance Products (from Image 2)
  {
    id: 'loss-mb',
    name: 'MuscleBlaze Biozyme Whey',
    category: 'loss',
    price: 3199,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=600',
    description: 'Clinically tested EAF for 50% higher protein absorption and 60% higher BCAA.',
    videoUrl: 'https://www.youtube.com/embed/fUjH9Jv79S0',
    rating: 4.8,
    features: ['EAF Formula', 'High Absorption', 'Lean Muscle', 'Clinical Tested']
  },
  {
    id: 'loss-nrela',
    name: 'Patanjali Nutrela Whey Performance',
    category: 'loss',
    price: 4455,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    description: 'Natural protein source blend for athletic performance and weight management.',
    videoUrl: 'https://www.youtube.com/embed/_c-1Y7hS-U8',
    rating: 4.7,
    features: ['Natural Blend', 'High Performance', 'Weight Goal', 'Purity Guaranteed']
  },
  {
    id: 'loss-nb-pea',
    name: 'Nutrabay Pure Pea Protein Isolate',
    category: 'loss',
    price: 899,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&q=80&w=600',
    description: 'Plant-based protein isolate perfect for lactose-intolerant users looking for lean gains.',
    videoUrl: 'https://www.youtube.com/embed/X_9VoZsh7m0',
    rating: 4.6,
    features: ['Plant Based', 'Lactose Free', 'Vegan Friendly', 'Pure Isolate']
  },
  {
    id: 'loss-oziva',
    name: 'OZiva Women\'s Protein & Herbs',
    category: 'loss',
    price: 1529,
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=600',
    description: 'Ayurvedic protein blend for weight loss, metabolism boost, and hormonal balance.',
    videoUrl: 'https://www.youtube.com/embed/-E4tXIsZ3m0',
    rating: 4.7,
    features: ['Ayurvedic Herbs', 'Metabolism Boost', 'Hormonal Balance', 'Zero Sugar']
  },
  {
    id: 'loss-wellcore',
    name: 'Wellcore Creatine Monohydrate',
    category: 'loss',
    price: 529,
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=600',
    description: 'Ultra-pure micronized creatine for explosive strength and lean muscle support.',
    videoUrl: 'https://www.youtube.com/embed/_x1m8vG6S88',
    rating: 4.8,
    features: ['Micronized', 'Strength Boost', 'Pure Creatine', 'Quick Mix']
  }
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as any || 'all';
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gain' | 'loss' | 'recovery'>(categoryParam);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const updateCategory = (cat: string) => {
    setSelectedCategory(cat as any);
    setSearchParams({ category: cat });
  };

  const filteredProducts = selectedCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const handlePurchase = (product: Product) => {
    toast.success(`Purchased ${product.name}!`, {
      description: "We've sent the exclusive workout video to your email and added it to your library.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Supplement Zone</h1>
          <p className="text-zinc-500 font-medium">Fuel your growth with our premium selection of supplements.</p>
        </div>
        <div className="flex bg-white dark:bg-zinc-800 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-x-auto no-scrollbar">
          <button
            onClick={() => updateCategory('all')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === 'all' ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => updateCategory('gain')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === 'gain' ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            Gain
          </button>
          <button
            onClick={() => updateCategory('loss')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === 'loss' ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            Loss
          </button>
          <button
            onClick={() => updateCategory('recovery')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              selectedCategory === 'recovery' ? "bg-red-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            Recovery
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex flex-col xl:flex-row h-full">
              {/* Image Section */}
              <button
                onClick={() => setSelectedProduct(product)}
                className="relative w-full xl:w-72 h-72 xl:h-auto overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-red-650 block group cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-xs font-black tracking-widest">{product.rating}</span>
                  </div>
                </div>
                {/* Visual indicator explaining details load on click */}
                <div className="absolute top-4 right-4 bg-red-600/90 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ⚡ View Details
                </div>
              </button>

              {/* Content Section */}
              <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {product.category === 'gain' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <TrendingUp className="w-3 h-3" />
                        Mass Gain
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <TrendingDown className="w-3 h-3" />
                        Weight Loss
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Price</span>
                    <span className="text-3xl font-black tracking-tighter italic">₹{product.price}</span>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(product)}
                    className="px-8 py-4 bg-red-600 hover:bg-black text-white transition-all transform hover:scale-105 active:scale-95 group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:-translate-y-1 transition-transform" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-2xl"
          onClick={() => setActiveVideo(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-[0_0_100px_rgba(220,38,38,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={activeVideo.includes('?') ? `${activeVideo}&autoplay=1&rel=0` : `${activeVideo}?autoplay=1&rel=0`}
              title="Workout Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 p-4 bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all z-20"
            >
              <Zap className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Product Details Modal Overlay */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Image Section inside modal */}
            <div className="relative w-full md:w-[45%] h-64 md:h-[480px] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-750">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-zinc-950 dark:text-white text-xs font-black tracking-widest">{selectedProduct.rating}</span>
              </div>
            </div>

            {/* Right Information Details inside modal */}
            <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {selectedProduct.category === 'gain' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-650 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <TrendingUp className="w-3 h-3" />
                      Mass Gain
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-650 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <TrendingDown className="w-3 h-3" />
                      Weight Loss
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    Close [✕]
                  </button>
                </div>

                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white">
                  {selectedProduct.name}
                </h3>
                
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Formula Highlights</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-zinc-150 dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-zinc-450 text-[10px] font-black uppercase tracking-widest">Pricing Model</span>
                  <span className="text-3xl font-black tracking-tighter italic text-zinc-950 dark:text-white">₹{selectedProduct.price}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedProduct.videoUrl && (
                    <button 
                      onClick={() => {
                        setActiveVideo(selectedProduct.videoUrl);
                        setSelectedProduct(null);
                      }}
                      className="p-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all rounded-2xl block"
                      title="Play Tutorial Video"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  )}
                  <Button 
                    onClick={() => {
                      handlePurchase(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-black text-white hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest rounded-2xl"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-red-600 rounded-[2.5rem] p-12 text-white overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Expert Training Content</h2>
          <p className="text-white/80 font-medium leading-relaxed text-lg mb-8">
            Every product purchase unlocks exclusive training videos curated by our professional instructors. Learn the right techniques to maximize your results.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 font-black uppercase text-xs tracking-widest">
              Meal Plans included
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 font-black uppercase text-xs tracking-widest">
              Weekly progress check
            </div>
          </div>
        </div>
        <Dumbbell className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] text-white/5 rotate-12" />
      </div>
    </div>
  );
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
