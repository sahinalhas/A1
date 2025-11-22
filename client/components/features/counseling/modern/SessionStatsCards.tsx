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

interface SessionStatsCardsProps {
  stats: SessionStats;
  isLoading?: boolean;
}

export default function SessionStatsCards({ stats, isLoading }: SessionStatsCardsProps) {
  if (isLoading) {
    return (
      <StatsGrid columns={4}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </StatsGrid>
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
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Tamamlanan',
      value: stats.completed,
      subtitle: `%${completionRate} tamamlanma oranı`,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Bu Ay',
      value: stats.completedThisMonth,
      subtitle: stats.completedThisWeek > 0 
        ? `Bu hafta: ${stats.completedThisWeek}` 
        : 'Bu hafta görüşme yok',
      icon: TrendingUp,
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Ortalama Süre',
      value: stats.averageDuration > 0 ? `${stats.averageDuration} dk` : '-',
      subtitle: stats.totalDuration > 0 
        ? `Toplam: ${Math.floor(stats.totalDuration / 60)}s ${stats.totalDuration % 60}dk`
        : 'Tamamlanan görüşme yok',
      icon: Clock,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
  ];

  return (
    <StatsGrid columns={4}>
      {cards.map((card, index) => (
        <StatCard key={card.title} {...card} delay={index * 0.1} />
      ))}
    </StatsGrid>
  );
}
