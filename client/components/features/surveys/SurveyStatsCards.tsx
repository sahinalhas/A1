import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid, SkeletonCard } from '@/components/molecules/StatsGrid';
import { 
 FileText, 
 Send, 
 CheckCircle2, 
 Users,
 TrendingUp,
 Clock
} from 'lucide-react';

interface SurveyStatsCardsProps {
 stats: {
 totalTemplates: number;
 totalDistributions: number;
 totalResponses: number;
 activeDistributions: number;
 completedDistributions: number;
 responseRate: number;
 distributionsByAudience: Record<string, number>;
 recentTemplates: number;
 };
 isLoading?: boolean;
}

export default function SurveyStatsCards({ stats, isLoading }: SurveyStatsCardsProps) {
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
 title: 'Anket Şablonları',
 value: stats.totalTemplates,
 subtitle: `${stats.recentTemplates} yeni şablon`,
 icon: FileText,
 gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
 },
 {
 title: 'Dağıtımlar',
 value: stats.totalDistributions,
 subtitle: `${stats.activeDistributions} aktif`,
 icon: Send,
 gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
 },
 {
 title: 'Toplam Yanıt',
 value: stats.totalResponses,
 subtitle: `%${stats.responseRate} yanıt oranı`,
 icon: CheckCircle2,
 gradient: 'bg-gradient-to-br from-green-500 to-green-600',
 trend: stats.responseRate > 70 ? { value: 'Yüksek katılım', isPositive: true } : undefined,
 },
 {
 title: 'Tamamlanan',
 value: stats.completedDistributions,
 subtitle: 'Tamamlanan dağıtım',
 icon: Clock,
 gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
 },
 ];

 return (
 <div className="space-y-4">
 <StatsGrid columns={4}>
 {cards.map((card, index) => (
 <StatCard key={card.title} {...card} delay={index * 0.1} />
 ))}
 </StatsGrid>

 {Object.keys(stats.distributionsByAudience).length > 0 && (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 >
 <Card className="relative overflow-hidden h-full">
 <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-500 to-blue-600" />
 <CardHeader className="pb-2 relative">
 <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
 <Users className="h-4 w-4" />
 Hedef Kitle Dağılımı
 </CardTitle>
 </CardHeader>
 <CardContent className="relative">
 <div className="space-y-2">
 {Object.entries(stats.distributionsByAudience)
 .slice(0, 3)
 .map(([audience, count]) => (
 <div key={audience} className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground capitalize">{audience}</span>
 <span className="font-medium">{count}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 )}
 </div>
 );
}
