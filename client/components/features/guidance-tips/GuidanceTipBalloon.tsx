import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Star, ChevronRight, RefreshCw, BookOpen, Users, Heart, Briefcase, AlertTriangle, Brain, Scale, Wrench } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface GuidanceTip {
  id: string;
  category: string;
  title: string;
  content: string;
  importance: 'DUSUK' | 'NORMAL' | 'YUKSEK' | 'KRITIK';
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Lightbulb; color: string; bgColor: string }> = {
  'PSIKOLOJIK_DANISMANLIK': { icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  'KARIYER_REHBERLIGI': { icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'OGRENCI_ILETISIMI': { icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
  'VELI_GORUSMESI': { icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  'KRIZ_YONETIMI': { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
  'MOTIVASYON': { icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  'SINIF_YONETIMI': { icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  'MEVZUAT': { icon: Scale, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  'TEKNIK_BILGI': { icon: Wrench, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  'GENEL': { icon: Lightbulb, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
};

const IMPORTANCE_STYLES: Record<string, string> = {
  'DUSUK': 'border-gray-200',
  'NORMAL': 'border-blue-200',
  'YUKSEK': 'border-orange-300 shadow-orange-100',
  'KRITIK': 'border-red-300 shadow-red-100 animate-pulse',
};

const CATEGORY_LABELS: Record<string, string> = {
  'PSIKOLOJIK_DANISMANLIK': 'Psikolojik Danışmanlık',
  'KARIYER_REHBERLIGI': 'Kariyer Rehberliği',
  'OGRENCI_ILETISIMI': 'Öğrenci İletişimi',
  'VELI_GORUSMESI': 'Veli Görüşmesi',
  'KRIZ_YONETIMI': 'Kriz Yönetimi',
  'MOTIVASYON': 'Motivasyon',
  'SINIF_YONETIMI': 'Sınıf Yönetimi',
  'MEVZUAT': 'Mevzuat',
  'TEKNIK_BILGI': 'Teknik Bilgi',
  'GENEL': 'Genel',
};

interface GuidanceTipBalloonProps {
  autoShow?: boolean;
  showInterval?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function GuidanceTipBalloon({ 
  autoShow = true, 
  showInterval = 30 * 60 * 1000,
  position = 'bottom-right' 
}: GuidanceTipBalloonProps) {
  const [tip, setTip] = useState<GuidanceTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState<number>(0);

  const fetchNextTip = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guidance-tips/next');
      const data = await response.json();
      
      if (data.success && data.data) {
        setTip(data.data);
        setIsVisible(true);
        setIsExpanded(false);
        setRating(0);
      }
    } catch (error) {
      console.error('Failed to fetch guidance tip:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissTip = useCallback(async () => {
    if (!tip) return;
    
    try {
      await fetch(`/api/guidance-tips/dismiss/${tip.id}`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to dismiss tip:', error);
    }
    
    setIsVisible(false);
    setTip(null);
  }, [tip]);

  const rateTip = useCallback(async (value: number) => {
    if (!tip) return;
    setRating(value);
    
    try {
      await fetch(`/api/guidance-tips/rate/${tip.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      });
    } catch (error) {
      console.error('Failed to rate tip:', error);
    }
  }, [tip]);

  useEffect(() => {
    if (!autoShow) return;

    const timer = setTimeout(() => {
      fetchNextTip();
    }, 5000);

    const interval = setInterval(() => {
      fetchNextTip();
    }, showInterval);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [autoShow, showInterval, fetchNextTip]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
  };

  const categoryConfig = tip ? CATEGORY_CONFIG[tip.category] || CATEGORY_CONFIG['GENEL'] : CATEGORY_CONFIG['GENEL'];
  const CategoryIcon = categoryConfig.icon;

  return (
    <>
      <AnimatePresence>
        {isVisible && tip && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50',
              positionClasses[position],
              'max-w-sm w-full'
            )}
          >
            <div className={cn(
              'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2',
              IMPORTANCE_STYLES[tip.importance],
              'overflow-hidden'
            )}>
              <div className={cn(
                'flex items-center gap-3 p-4',
                categoryConfig.bgColor
              )}>
                <div className={cn(
                  'p-2 rounded-xl bg-white/80 dark:bg-gray-800/80',
                  categoryConfig.color
                )}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium', categoryConfig.color)}>
                    {CATEGORY_LABELS[tip.category] || tip.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {tip.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissTip}
                  className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <AnimatePresence>
                {isExpanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {tip.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 mr-2">Değerlendir:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => rateTip(star)}
                              className={cn(
                                'p-1 transition-colors',
                                rating >= star ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                              )}
                            >
                              <Star className={cn('h-4 w-4', rating >= star && 'fill-current')} />
                            </button>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            dismissTip();
                            setTimeout(fetchNextTip, 500);
                          }}
                          className="text-xs gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Sonraki
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {tip.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(true)}
                      className="mt-2 text-xs gap-1 text-primary hover:text-primary"
                    >
                      Devamını Oku
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchNextTip}
          disabled={isLoading}
          className={cn(
            'fixed z-50',
            positionClasses[position],
            'p-4 rounded-full bg-primary text-primary-foreground shadow-lg',
            'hover:shadow-xl transition-shadow',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <RefreshCw className="h-6 w-6 animate-spin" />
          ) : (
            <Lightbulb className="h-6 w-6" />
          )}
        </motion.button>
      )}
    </>
  );
}
