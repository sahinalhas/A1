import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { Brain } from 'lucide-react';
import { AI_TOOLS_TABS, VALID_AI_TOOLS_TABS } from '@/config/tabs';
import { AIToolsLoadingState } from '@/components/features/ai-tools/AIToolsLoadingState';
import { PageHeader } from '@/components/molecules/PageHeader';

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
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-7xl mx-auto py-6 space-y-6"
 >
 <PageHeader
 icon={Brain}
 title="AI Araçları"
 subtitle="Yapay zeka destekli analiz, raporlama ve asistan araçları"
 />

 {/* Tabs Container */}
 <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
 {/* Responsive Tab List */}
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

 {/* Tab Contents */}
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
 </Tabs>
 </motion.div>
 );
}
