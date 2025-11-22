import { motion } from 'framer-motion';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid, SkeletonCard } from '@/components/molecules/StatsGrid';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Users, 
  Timer,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import type { SessionStats } from '@/hooks/features/counseling/session-stats.hooks';
import { cn } from '@/lib/utils';

interface SessionStatsCardsProps {
  stats: SessionStats;
  isLoading?: boolean;
}

export default function SessionStatsCards({ stats, isLoading }: SessionStatsCardsProps) {
  if (isLoading) {
    // This part seems to be a placeholder and might need adjustment based on the actual SkeletonCard implementation.
    // The original code used SkeletonCard within StatsGrid, now it's not directly used.
    // For now, returning a simplified placeholder.
    return (
      <div className="flex justify-between items-center w-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[23%] h-24 bg-gray-200 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const cards = [
    {
      title: 'Toplam Görüşme',
      value: stats.total,
      subtitle: `${stats.individual} bireysel, ${stats.group} grup`,
      icon: Calendar,
      bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-400',
      description: `${stats.individual} bireysel, ${stats.group} grup`,
    },
    {
      title: 'Tamamlanan',
      value: stats.completed,
      subtitle: `%${completionRate} tamamlanma oranı`,
      icon: CheckCircle2,
      bgClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-400',
      description: `%${completionRate} tamamlanma oranı`,
    },
    {
      title: 'Bu Ay',
      value: stats.completedThisMonth,
      subtitle: stats.completedThisWeek > 0 
        ? `Bu hafta: ${stats.completedThisWeek}` 
        : 'Bu hafta görüşme yok',
      icon: TrendingUp,
      bgClass: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-amber-400',
      description: stats.completedThisWeek > 0 
        ? `Bu hafta: ${stats.completedThisWeek}` 
        : 'Bu hafta görüşme yok',
    },
    {
      title: 'Ortalama Süre',
      value: stats.averageDuration > 0 ? `${stats.averageDuration} dk` : '-',
      subtitle: stats.totalDuration > 0 
        ? `Toplam: ${Math.floor(stats.totalDuration / 60)}s ${stats.totalDuration % 60}dk`
        : 'Tamamlanan görüşme yok',
      icon: Clock,
      bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-purple-400',
      description: stats.totalDuration > 0 
        ? `Toplam: ${Math.floor(stats.totalDuration / 60)}s ${stats.totalDuration % 60}dk`
        : 'Tamamlanan görüşme yok',
    },
  ];

  return (
    <>
      <div className="flex justify-between w-full">
        {cards.map((card, index) => (
          <Card key={card.title} className={cn("relative overflow-hidden w-[23%]", card.bgClass)}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 p-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={cn("h-4 w-4", card.iconColor)} />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}