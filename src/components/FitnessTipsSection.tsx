import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Apple, 
  Dumbbell, 
  Moon, 
  Activity, 
  Clock, 
  ArrowRight, 
  ThumbsUp, 
  Share2, 
  X, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  category: 'Strength' | 'Nutrition' | 'Fat Loss' | 'Recovery' | 'Technique';
  readTime: string;
  date: string;
  icon: any;
  summary: string;
  content: string[];
  takeaways: string[];
  author: string;
  initialLikes: number;
}

const ARTICLES: Article[] = [
  {
    id: 'tip-1',
    title: 'Progressive Overload: The Golden Rule for Muscle Growth',
    category: 'Strength',
    readTime: '4 min read',
    date: 'Daily Coach Insight',
    icon: Dumbbell,
    summary: 'Why lifting the exact same weight every week stalls your progress and how systematic micro-loading triggers continuous muscle hypertrophy.',
    takeaways: [
      'Increase either reps, sets, weight, or reduce rest periods every 1-2 weeks.',
      'Log your daily sets and reps to avoid "workout amnesia".',
      'Prioritize strict form over ego-lifting to prevent joint wear.'
    ],
    content: [
      'The principle of progressive overload states that muscle fibers will only adapt and grow when exposed to greater stimulus than they are accustomed to.',
      'If you bench press 60kg for 3 sets of 10 reps every workout for six months, your body has zero biological reason to build additional contractile muscle tissue.',
      'Instead of making massive jumps in barbell weight, add 1 extra rep per set or increase weight by 1.25kg to 2.5kg. Small incremental gains compound into massive strength and physique transformations over time.'
    ],
    author: 'C Vidya Head Strength Coach',
    initialLikes: 142
  },
  {
    id: 'tip-2',
    title: 'Protein Timing & Daily Target: Myth vs Science',
    category: 'Nutrition',
    readTime: '3 min read',
    date: 'Daily Nutrition Tip',
    icon: Apple,
    summary: 'The 30-minute anabolic window is largely exaggerated. Learn how total daily protein intake and even distribution dictate your recovery.',
    takeaways: [
      'Target 1.6g to 2.2g of protein per kilogram of bodyweight daily.',
      'Distribute your protein intake across 3 to 5 meals (25-40g per meal).',
      'Hydration of at least 3-4 liters daily is critical for protein synthesis and kidney function.'
    ],
    content: [
      'For decades, athletes believed that failing to chug a protein shake within 30 minutes of dropping a dumbbell would negate their entire workout.',
      'Modern sports physiology confirms the muscle protein synthesis (MPS) window remains elevated for 24 to 48 hours post-resistance training.',
      'Focus on hitting your total daily macro target with high-biological-value sources like whey isolate, eggs, chicken breast, paneer, and soy, rather than stressing over minute-by-minute timing.'
    ],
    author: 'Lead Sports Nutritionist',
    initialLikes: 198
  },
  {
    id: 'tip-3',
    title: 'High-Intensity Interval Training (HIIT) vs Zone 2 Cardio',
    category: 'Fat Loss',
    readTime: '5 min read',
    date: 'Fat Loss Blueprint',
    icon: Flame,
    summary: 'Discover the distinct metabolic benefits of steady low-intensity cardio versus explosive anaerobic bursts for lasting leanness.',
    takeaways: [
      'Zone 2 cardio (conversational pace) maximizes cellular mitochondrial density and fat oxidation.',
      'HIIT boosts EPOC (afterburn effect) in under 20 minutes but requires longer central nervous system recovery.',
      'Combine 120 minutes of Zone 2 weekly with 1-2 short HIIT sessions for peak endurance.'
    ],
    content: [
      'Fat loss occurs predominantly in an energetic calorie deficit, but the style of cardio you select dictates whether you preserve lean muscle or burn it away.',
      'Zone 2 cardio trains your mitochondria to burn fatty acids efficiently while placing minimal stress on your joints and central nervous system.',
      'In contrast, HIIT triggers intense glycogen depletion and increases metabolic rate for hours post-session. Balancing both ensures maximum cardiac health and body fat reduction.'
    ],
    author: 'Elite Conditioning Specialist',
    initialLikes: 167
  },
  {
    id: 'tip-4',
    title: 'The Sleep-Anabolic Connection: Why Gains Happen in Bed',
    category: 'Recovery',
    readTime: '4 min read',
    date: 'Recovery Protocol',
    icon: Moon,
    summary: 'How deep stage 3-4 sleep drives growth hormone secretion, lowers cortisol, and restores muscular glycogen stores.',
    takeaways: [
      'Aim for 7 to 9 hours of uninterrupted sleep every single night.',
      'Eliminate blue screen exposure 45 minutes prior to sleep to optimize melatonin.',
      'Keep your sleeping room cool (18-21°C) for deep restorative REM cycles.'
    ],
    content: [
      'You do not grow in the gym; you break down muscle tissue in the gym. True muscular adaptation and neural regeneration occur during deep restorative sleep.',
      'During slow-wave sleep, your pituitary gland releases up to 70% of your daily pulsatile Human Growth Hormone (HGH).',
      'Chronic sleep deprivation elevates catabolic cortisol levels, accelerates muscle breakdown, and spikes hunger hormones (ghrelin), derailing fat loss goals.'
    ],
    author: 'Sports Recovery Team',
    initialLikes: 215
  },
  {
    id: 'tip-5',
    title: 'Squat & Deadlift Spine Safety: Core Bracing 101',
    category: 'Technique',
    readTime: '4 min read',
    date: 'Biomechanics Guide',
    icon: Activity,
    summary: 'Master the Valsalva maneuver and intra-abdominal pressure to protect your lower lumbar spine under heavy compound loads.',
    takeaways: [
      'Breathe deep into your diaphragm (belly), not your chest, before descending.',
      'Brace your core as if preparing to take a punch in the stomach.',
      'Keep the bar path strictly over mid-foot throughout the entire movement.'
    ],
    content: [
      'Back pain and lumbar strains in gym athletes are rarely caused by heavy weight alone; they stem from improper spinal stability and poor abdominal bracing.',
      'The Valsalva maneuver creates high intra-abdominal pressure that forms a rigid cylinder around your spinal column, converting your torso into a solid pillar.',
      'Lock your ribs down, pack your lats, take a 360-degree belly breath, and maintain rigid spinal neutral throughout the eccentric and concentric phases.'
    ],
    author: 'Head Biomechanics Trainer',
    initialLikes: 183
  }
];

export function FitnessTipsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Strength', 'Nutrition', 'Fat Loss', 'Recovery', 'Technique'];

  const filteredArticles = selectedCategory === 'All' 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory);

  const handleLike = (articleId: string, initial: number) => {
    if (likedArticles[articleId]) {
      setLikedArticles(prev => ({ ...prev, [articleId]: false }));
      setLikes(prev => ({ ...prev, [articleId]: (prev[articleId] || initial) - 1 }));
    } else {
      setLikedArticles(prev => ({ ...prev, [articleId]: true }));
      setLikes(prev => ({ ...prev, [articleId]: (prev[articleId] || initial) + 1 }));
      toast.success('Thanks for voting! Helpful feedback recorded.');
    }
  };

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title} - ${window.location.origin}/#tips`);
      toast.success('Tip link copied to clipboard!');
    }
  };

  return (
    <section id="tips" className="py-24 bg-white border-t border-zinc-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 border border-yellow-300 rounded-full text-yellow-800 text-xs font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500" />
            Daily Member Knowledge
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-zinc-950">
            Daily <span className="text-blue-600">Fitness Tips</span> & <span className="text-yellow-500">Guides</span>
          </h2>
          <p className="text-zinc-700 font-semibold max-w-2xl mx-auto mt-4 text-base md:text-lg">
            Evidence-based training guidelines, daily nutrition tips, and recovery protocols curated by certified C Vidya trainers.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-zinc-700 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, i) => {
            const Icon = article.icon;
            const currentLikes = likes[article.id] ?? article.initialLikes;
            const isLiked = !!likedArticles[article.id];

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-zinc-200 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 shadow-md group"
              >
                <div>
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-800 bg-yellow-400/20 px-2.5 py-1 rounded-full border border-yellow-400/40">
                        {article.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-950 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-zinc-600 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div>
                  {/* Action row */}
                  <div className="pt-5 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Read Guide
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(article.id, article.initialLikes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isLiked 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                        title="Helpful tip"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-blue-600' : ''}`} />
                        <span>{currentLikes}</span>
                      </button>

                      <button
                        onClick={() => handleShare(article)}
                        className="p-1.5 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors cursor-pointer"
                        title="Share Tip"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Read Full Article Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl text-zinc-900"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="mb-6 pr-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-800 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/40">
                      {selectedArticle.category}
                    </span>
                    <span className="text-zinc-500 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedArticle.readTime}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-zinc-950">
                    {selectedArticle.title}
                  </h3>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-2">
                    Authored by {selectedArticle.author}
                  </p>
                </div>

                {/* Key Takeaways Box */}
                <div className="p-5 rounded-2xl bg-yellow-50/60 border border-yellow-200 mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-yellow-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                    Key Actionable Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {selectedArticle.takeaways.map((item, idx) => (
                      <li key={idx} className="text-xs text-zinc-800 font-medium flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Body Content */}
                <div className="space-y-4 text-zinc-700 text-sm leading-relaxed font-normal mb-8">
                  {selectedArticle.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-zinc-200 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(selectedArticle.id, selectedArticle.initialLikes)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({likes[selectedArticle.id] ?? selectedArticle.initialLikes})
                  </button>

                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
