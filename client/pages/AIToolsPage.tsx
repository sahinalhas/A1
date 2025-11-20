import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain, Zap, TrendingUp } from 'lucide-react';
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
 <div className="w-full min-h-screen pb-6">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.5 }}
 className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 text-white mb-6"
 >
 <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
 
 <div className="relative max-w-7xl mx-auto px-6 py-12">
 <div className="flex items-center justify-between flex-wrap gap-6">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="flex-1"
 >
 <div className="flex items-center gap-3 mb-3">
 <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
 <Brain className="h-7 w-7" />
 </div>
 <h1 className="text-4xl font-bold tracking-tight">AI Araçları</h1>
 </div>
 <p className="text-white/90 text-base max-w-2xl">
 Yapay zeka destekli analiz ve raporlama araçları
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="flex gap-3 flex-wrap"
 >
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <Zap className="h-3.5 w-3.5 text-yellow-300" />
 <span className="text-xs text-white font-medium">Hızlı Analiz</span>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
 <TrendingUp className="h-3.5 w-3.5 text-green-300" />
 <span className="text-xs text-white font-medium">Akıllı Öneriler</span>
 </div>
 </motion.div>
 </div>

 <motion.div
 className="hidden md:block opacity-30"
 animate={{ rotate: 360 }}
 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
 style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)' }}
 >
 <Brain className="h-20 w-20 text-white" />
 </motion.div>
 </div>
 </motion.div>

 <div className="space-y-6 max-w-7xl mx-auto px-6">
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
