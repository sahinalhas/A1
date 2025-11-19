import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { AI_TOOLS_TABS, VALID_AI_TOOLS_TABS } from '@/config/tabs';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { Badge } from '@/components/atoms/Badge';

const RiskDashboard = lazy(() => import('./RiskDashboard'));
const AIAssistant = lazy(() => import('./AIAssistant'));
const AIInsightsDashboard = lazy(() => import('./AIInsightsDashboard'));
const AdvancedAIAnalysis = lazy(() => import('./AdvancedAIAnalysis'));
const DailyActionPlan = lazy(() => import('./DailyActionPlan'));

export default function AIToolsPage() {
 const [searchParams] = useSearchParams();
 
 // Read initial tab from URL, but default to 'risk' if invalid
 const getValidTab = (tab: string | null): string => {
 if (tab && VALID_AI_TOOLS_TABS.includes(tab as any)) {
 return tab;
 }
 return 'risk';
 };

 const initialTab = getValidTab(searchParams.get('tab'));
 const [activeTab, setActiveTab] = useState(initialTab);

 // Update active tab if URL changes (e.g., from navigation)
 // Only watch searchParams, not activeTab, to avoid reverting user's manual tab changes
 useEffect(() => {
 const urlTab = searchParams.get('tab');
 const validTab = getValidTab(urlTab);
 setActiveTab(validTab);
 }, [searchParams]);

 // Handle tab change - only update local state, don't modify URL
 const handleTabChange = (value: string) => {
 setActiveTab(value);
 };

 return (
 <div className="w-full min-h-screen">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 p-5 md:p-6 shadow-xl"
 >
 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
 <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl"></div>

 <div className="relative z-10 max-w-3xl flex items-center justify-between">
 <div className="flex-1">
 <Badge className="mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
 <Sparkles className="h-3 w-3 mr-1" />
 Yapay Zeka Destekli Araçlar
 </Badge>
 <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
 AI Araçları
 </h1>
 <p className="text-sm md:text-base text-white/90 mb-4 max-w-xl leading-relaxed">
 Yapay zeka destekli analiz ve raporlama araçları.
 </p>
 <div className="flex gap-3 flex-wrap">
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <Zap className="h-3.5 w-3.5 text-yellow-300" />
 <span className="text-xs text-white font-medium">Hızlı Analiz</span>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <TrendingUp className="h-3.5 w-3.5 text-green-300" />
 <span className="text-xs text-white font-medium">Akıllı Öneriler</span>
 </div>
 </div>
 </div>

 <motion.div
 className="hidden md:block opacity-30"
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 >
 <Brain className="h-20 w-20 text-white" />
 </motion.div>
 </div>
 </motion.div>

 <div className="space-y-6 max-w-7xl mx-auto">
 {/* Tabs Container */}
 <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
 {/* Responsive Tab List */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 <TabsList variant="pills" className="justify-center flex-wrap">
 {AI_TOOLS_TABS.map((tabConfig) => (
 <TabsTrigger 
 key={tabConfig.value} 
 value={tabConfig.value}
 icon={tabConfig.icon}
 variant={tabConfig.variant}
 title={tabConfig.description}
 >
 {tabConfig.label}
 </TabsTrigger>
 ))}
 </TabsList>
 </motion.div>

 {/* Tab Contents */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.2 }}
 >
 <TabsContent value="risk" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[0].icon!} message="Risk verileri yükleniyor..." />}>
 <RiskDashboard />
 </Suspense>
 </TabsContent>

 <TabsContent value="ai-asistan" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[1].icon!} message="AI Asistan yükleniyor..." />}>
 <AIAssistant />
 </Suspense>
 </TabsContent>

 <TabsContent value="ai-insights" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[2].icon!} message="Günlük insights yükleniyor..." />}>
 <AIInsightsDashboard />
 </Suspense>
 </TabsContent>

 <TabsContent value="gelismis-analiz" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[3].icon!} message="Gelişmiş analiz yükleniyor..." />}>
 <AdvancedAIAnalysis />
 </Suspense>
 </TabsContent>

 <TabsContent value="gunluk-plan" className="min-h-[600px]">
 <Suspense fallback={<AIToolsLoadingState icon={AI_TOOLS_TABS[4].icon!} message="Günlük plan yükleniyor..." />}>
 <DailyActionPlan />
 </Suspense>
 </TabsContent>
 </motion.div>
 </Tabs>
 </div>
 </div>
 );
}
