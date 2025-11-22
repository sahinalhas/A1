
import { motion } from 'framer-motion';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/organisms/Card';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
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
    return (
      <div className="flex gap-3 w-full">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-24 bg-muted rounded-lg animate-pulse"></div>
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
      description: `${stats.individual} bireysel, ${stats.group} grup`,
      icon: Calendar,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Tamamlanan',
      value: stats.completed,
      description: `%${completionRate} tamamlanma oranı`,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Bu Ay',
      value: stats.completedThisMonth,
      description: stats.completedThisWeek > 0 
        ? `Bu hafta: ${stats.completedThisWeek}` 
        : 'Bu hafta görüşme yok',
      icon: TrendingUp,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Ortalama Süre',
      value: stats.averageDuration > 0 ? `${stats.averageDuration} dk` : '-',
      description: stats.totalDuration > 0 
        ? `Toplam: ${Math.floor(stats.totalDuration / 60)}s ${stats.totalDuration % 60}dk`
        : 'Tamamlanan görüşme yok',
      icon: Clock,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <div className="flex gap-3 w-full">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className={cn(
            "flex-1 border",
            card.bgColor,
            card.borderColor
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn("h-4 w-4", card.iconColor)} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
