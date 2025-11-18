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
  TrendingUp // Import TrendingUp icon
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

  const cards = [
    {
      title: 'Toplam Görüşme',
      value: stats.total,
      subtitle: `${stats.individual} bireysel, ${stats.group} grup`,
      icon: Calendar,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Aktif Görüşmeler',
      value: stats.active,
      subtitle: 'Devam eden görüşmeler',
      icon: Activity,
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Tamamlanan',
      value: stats.completed,
      subtitle: `Bu ay: ${stats.completedThisMonth}`,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: stats.completedThisWeek > 0 ? { value: `+${stats.completedThisWeek} bu hafta`, isPositive: true } : undefined,
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
    <div className="space-y-4">
      <StatsGrid columns={4}>
        {cards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </StatsGrid>

      {/* İkinci Satır */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.keys(stats.sessionsByMode).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full">
              <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-500 to-purple-600" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Görüşme Modları
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-2">
                  {Object.entries(stats.sessionsByMode)
                    .slice(0, 3)
                    .map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{mode}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full">
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-500 to-green-600" />
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                Bu Hafta
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold mb-1">{stats.completedThisWeek}</div>
              <p className="text-xs text-muted-foreground">
                Tamamlanan görüşme
              </p>
              {stats.completedToday > 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Bugün: </span>
                  <span className="font-medium">{stats.completedToday}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}