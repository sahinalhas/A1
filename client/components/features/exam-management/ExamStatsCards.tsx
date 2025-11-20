import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid, SkeletonCard } from '@/components/molecules/StatsGrid';
import { 
  FileText, 
  Users, 
  Target,
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ExamStatsCardsProps {
  stats: {
    totalSessions: number;
    totalStudents: number;
    avgParticipationRate: number;
    avgOverallSuccess: number;
    sessionsThisMonth: number;
    sessionsLastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  isLoading?: boolean;
}

export default function ExamStatsCards({ stats, isLoading }: ExamStatsCardsProps) {
  if (isLoading) {
    return (
      <StatsGrid columns={4}>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </StatsGrid>
    );
  }

  const getTrendText = () => {
    if (stats.trend === 'up') return 'Artan trend';
    if (stats.trend === 'down') return 'Azalan trend';
    return 'Stabil';
  };

  const cards = [
    {
      title: 'Toplam Deneme',
      value: stats.totalSessions,
      subtitle: `Bu ay: ${stats.sessionsThisMonth}`,
      icon: FileText,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: stats.trend !== 'stable' ? { 
        value: getTrendText(), 
        isPositive: stats.trend === 'up' 
      } : undefined,
    },
    {
      title: 'Toplam Öğrenci',
      value: stats.totalStudents,
      subtitle: 'Sistemde kayıtlı',
      icon: Users,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      title: 'Katılım Oranı',
      value: `${stats.avgParticipationRate.toFixed(1)}%`,
      subtitle: 'Ortalama katılım yüzdesi',
      icon: Target,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: stats.avgParticipationRate >= 70 ? { 
        value: 'Yüksek katılım', 
        isPositive: true 
      } : undefined,
    },
    {
      title: 'Genel Başarı',
      value: `${stats.avgOverallSuccess.toFixed(1)}%`,
      subtitle: 'Ortalama başarı oranı',
      icon: Award,
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: stats.avgOverallSuccess >= 60 ? { 
        value: 'İyi performans', 
        isPositive: true 
      } : undefined,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StatsGrid columns={4}>
        {cards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </StatsGrid>
    </motion.div>
  );
}
