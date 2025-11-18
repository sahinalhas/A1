import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/organisms/Card";
import { StatCard } from "@/components/molecules/StatCard";
import { StatsGrid } from "@/components/molecules/StatsGrid";
import { Button } from "@/components/atoms/Button";
import { PageHeader } from "@/components/molecules/PageHeader";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/organisms/Chart";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Line, LineChart } from "recharts";
import { Badge } from "@/components/atoms/Badge";
import { motion } from "framer-motion";
import {
  Bell,
  Users2,
  CalendarDays,
  MessageSquare,
  FileText,
  BarChart3,
  BookOpen,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle2,
  AlertCircle,
  Brain,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  KeyRound,
} from "lucide-react";
import { type EarlyWarning } from "@/lib/analytics";
import { optimizedGenerateEarlyWarnings } from "@/lib/analytics-cache";
import type { Student, Intervention } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import RiskSummaryWidget from "@/components/features/common/RiskSummaryWidget";
import DailyActionPlanWidget from "@/components/features/dashboard/DailyActionPlanWidget";
import SchoolWideAIInsights from "@/components/features/dashboard/SchoolWideAIInsights";
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton";
import AISuggestionPanel from "@/components/features/ai-suggestions/AISuggestionPanel";
import { apiClient } from "@/lib/api/core/client";
import { STUDENT_ENDPOINTS, SURVEY_ENDPOINTS, COUNSELING_ENDPOINTS } from "@/lib/constants/api-endpoints";
import { MODERN_GRADIENTS } from "@/lib/config/theme.config";
import { useAuth } from "@/lib/auth-context";

interface DashboardStats {
  studentCount: number;
  meetingCount: number;
  activeSurveyCount: number;
  openInterventionCount: number;
  completedInterventionsThisMonth: number;
  activeCounselingSessionsToday: number;
}

interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
  none: number;
}

interface CounselingSession {
  id: string;
  sessionDate: string;
  topic: string;
  status: string;
  studentIds?: string[];
}

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickLoginLoading, setIsQuickLoginLoading] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    meetingCount: 0,
    activeSurveyCount: 0,
    openInterventionCount: 0,
    completedInterventionsThisMonth: 0,
    activeCounselingSessionsToday: 0,
  });

  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution>({
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarning[]>([]);
  const [weeklyMeetingTrend, setWeeklyMeetingTrend] = useState<any[]>([]);

  useEffect(() => {
    if (students.length === 0) {
      setEarlyWarnings([]);
      return;
    }
    
    const fetchWarnings = async () => {
      try {
        const warnings = await optimizedGenerateEarlyWarnings();
        setEarlyWarnings(warnings.slice(0, 10));
      } catch (error) {
        console.error('Failed to generate early warnings:', error);
        setEarlyWarnings([]);
      }
    };
    
    setTimeout(() => fetchWarnings(), 500);
  }, [students]);

  const criticalWarnings = useMemo(() => {
    return earlyWarnings.filter(w => w.severity === 'kritik' || w.severity === 'yüksek');
  }, [earlyWarnings]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [studentsResponse, distributions, sessions] = await Promise.all([
          apiClient.get<Student[]>(STUDENT_ENDPOINTS.BASE, { showErrorToast: false }),
          apiClient.get<any[]>(SURVEY_ENDPOINTS.DISTRIBUTIONS, { showErrorToast: false }),
          apiClient.get<CounselingSession[]>(COUNSELING_ENDPOINTS.BASE, { showErrorToast: false }),
        ]);

        const studentsData = Array.isArray(studentsResponse) ? studentsResponse : [];
        if (studentsData.length > 0) {
          setStudents(studentsData);
          setStats(prev => ({ ...prev, studentCount: studentsData.length }));

          const riskCount = {
            high: studentsData.filter((s: Student) => s.risk === "Yüksek").length,
            medium: studentsData.filter((s: Student) => s.risk === "Orta").length,
            low: studentsData.filter((s: Student) => s.risk === "Düşük").length,
            none: studentsData.filter((s: Student) => !s.risk).length,
          };
          setRiskDistribution(riskCount);
        }

        if (distributions) {
          const activeCount = distributions.filter((d: any) => d.status === 'ACTIVE').length;
          setStats(prev => ({ ...prev, activeSurveyCount: activeCount }));
        }

        if (sessions) {
          const today = new Date().toISOString().split('T')[0];
          const activeTodayCount = sessions.filter(s => 
            s.sessionDate?.startsWith(today) && s.status === 'ACTIVE'
          ).length;
          setStats(prev => ({ ...prev, activeCounselingSessionsToday: activeTodayCount }));

          const thisWeek = getLastNDays(7);
          const weeklyData = thisWeek.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            const count = sessions.filter(s => s.sessionDate?.startsWith(dayStr)).length;
            return {
              day: day.toLocaleDateString('tr-TR', { weekday: 'short' }),
              count: count,
            };
          });
          setWeeklyMeetingTrend(weeklyData);
          
          const thisWeekTotal = weeklyData.reduce((sum, d) => sum + d.count, 0);
          setStats(prev => ({ ...prev, meetingCount: thisWeekTotal }));
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
    
    async function fetchInterventionStats() {
      try {
        const data = await apiClient.get<{
          openInterventions: number;
          completedThisMonth: number;
        }>('/api/standardized-profile/intervention-stats', { showErrorToast: false });
        
        if (data) {
          setStats(prev => ({ 
            ...prev, 
            openInterventionCount: data.openInterventions,
            completedInterventionsThisMonth: data.completedThisMonth 
          }));
        }
      } catch (error) {
        console.error('Failed to fetch intervention stats:', error);
      }
    }
    
    fetchInterventionStats();
  }, []);

  function getLastNDays(n: number): Date[] {
    const days: Date[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }

  const displayStats = useMemo(() => {
    return [
      { 
        title: "Toplam Öğrenci", 
        value: stats.studentCount, 
        icon: Users2, 
        gradient: MODERN_GRADIENTS.purple,
        subtitle: `${stats.studentCount} kayıtlı öğrenci`
      },
      { 
        title: "Bu Hafta Görüşme", 
        value: stats.meetingCount, 
        icon: CalendarDays, 
        gradient: MODERN_GRADIENTS.blue,
        subtitle: `${stats.activeCounselingSessionsToday} bugün`
      },
      { 
        title: "Açık Müdahale", 
        value: stats.openInterventionCount, 
        icon: AlertTriangle, 
        gradient: MODERN_GRADIENTS.amber,
        subtitle: `${stats.completedInterventionsThisMonth} bu ay tamamlandı`
      },
      { 
        title: "Aktif Anket", 
        value: stats.activeSurveyCount, 
        icon: MessageSquare, 
        gradient: MODERN_GRADIENTS.green,
        subtitle: "Devam eden anketler"
      },
    ];
  }, [stats]);

  const riskChartData = useMemo(() => [
    { name: "Düşük", value: riskDistribution.low, color: "#22c55e" },
    { name: "Orta", value: riskDistribution.medium, color: "#f59e0b" },
    { name: "Yüksek", value: riskDistribution.high, color: "#ef4444" },
    { name: "Değerlendirilmemiş", value: riskDistribution.none, color: "#94a3b8" },
  ], [riskDistribution]);

  const isDevelopment = import.meta.env.DEV;

  const handleQuickAdminLogin = async () => {
    setIsQuickLoginLoading(true);
    try {
      const success = await login('admin@okul.edu.tr', 'admin123');
      if (success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Admin hızlı giriş hatası:', error);
    } finally {
      setIsQuickLoginLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6 page-transition">
      {!isAuthenticated && isDevelopment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Geliştirme Modu</h3>
                  <p className="text-sm text-white/90">Admin olarak hızlı giriş yapabilirsiniz</p>
                </div>
              </div>
              <Button
                onClick={handleQuickAdminLogin}
                disabled={isQuickLoginLoading}
                className="bg-white text-orange-600 hover:bg-white/90"
              >
                {isQuickLoginLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Admin Hızlı Giriş
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <PageHeader
        title="Rehber360"
        subtitle={new Date().toLocaleDateString('tr-TR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
        icon={Sparkles}
        actions={
          <Badge variant="secondary" className="text-sm px-4 py-2 h-fit gap-2 bg-primary/10 text-primary border-primary/20">
            <Clock className="h-4 w-4" />
            Gerçek Zamanlı
          </Badge>
        }
      />

      <StatsGrid columns={4}>
        {displayStats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            gradient={stat.gradient}
            delay={i * 0.1}
          />
        ))}
      </StatsGrid>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-2 card-lift gpu-accelerated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Haftalık Görüşme Trendleri
              </CardTitle>
              <CardDescription>Son 7 günlük görüşme dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Görüşme", color: "hsl(var(--primary))" },
                }}
                className="h-[250px]"
              >
                <AreaChart data={weeklyMeetingTrend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-2 card-lift gpu-accelerated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Kritik Uyarılar
              </CardTitle>
              <CardDescription>Acil müdahale gerektiren durumlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalWarnings.length > 0 ? (
                criticalWarnings.slice(0, 4).map((warning, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 interactive haptic-feedback border border-amber-200/50"
                    onClick={() => navigate(`/ogrenci/${warning.studentId}`)}
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{warning.studentName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{warning.message}</div>
                    </div>
                    <Badge variant="destructive" className="text-xs flex-shrink-0">{warning.severity}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <span>Kritik uyarı bulunmuyor</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 card-lift gpu-accelerated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Risk Dağılımı
              </CardTitle>
              <CardDescription>Öğrenci risk seviyeleri analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Yüksek Risk</span>
                    </div>
                    <Badge variant="destructive">{riskDistribution.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium">Orta Risk</span>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">{riskDistribution.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Düşük Risk</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400">{riskDistribution.low}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-medium">Değerlendirilmemiş</span>
                    </div>
                    <Badge variant="outline">{riskDistribution.none}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 card-lift gpu-accelerated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Hızlı Erişim
              </CardTitle>
              <CardDescription>Sık kullanılan modüller</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full group justify-start text-base h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 btn-ripple haptic-feedback focus-glow">
                <a href="/ogrenci">
                  <Users2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  Öğrenciler
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full group justify-start text-base h-12 hover:bg-blue-50 dark:hover:bg-blue-950/20 btn-ripple haptic-feedback">
                <a href="/gorusmeler">
                  <CalendarDays className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  Görüşmeler
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full group justify-start text-base h-12 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 btn-ripple haptic-feedback">
                <a href="/anketler">
                  <MessageSquare className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  Anketler
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full group justify-start text-base h-12 hover:bg-amber-50 dark:hover:bg-amber-950/20 btn-ripple haptic-feedback">
                <a href="/raporlar">
                  <FileText className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  Raporlar
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full group justify-start text-base h-12 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/20 btn-ripple haptic-feedback">
                <a href="/ai-asistan">
                  <Brain className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                  AI Asistan
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <RiskSummaryWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <DailyActionPlanWidget />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <AISuggestionPanel />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SchoolWideAIInsights />
      </motion.div>
    </div>
  );
}
