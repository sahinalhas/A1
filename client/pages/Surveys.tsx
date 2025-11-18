import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Plus, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/molecules/PageHeader";
import { 
 useSurveyTemplates, 
 useSurveyDistributions, 
 useTemplateQuestions,
 useCreateTemplate,
 useUpdateTemplate,
 useDeleteTemplate,
 useCreateDistribution,
 useUpdateDistribution,
 useDeleteDistribution 
} from "@/hooks/features/surveys";
import { useToast } from "@/hooks/utils/toast.utils";
import { SurveyTemplate, SurveyResponse } from "@/lib/survey-types";
import SurveyCreationDialog from "@/components/features/surveys/SurveyCreationDialog";
import SurveyDistributionDialog from "@/components/features/surveys/SurveyDistributionDialog";
import SurveyDistributionEditDialog from "@/components/features/surveys/SurveyDistributionEditDialog";
import SurveyTemplateEditDialog from "@/components/features/surveys/SurveyTemplateEditDialog";
import SurveyAnalyticsTab from "@/components/features/surveys/SurveyAnalyticsTab";
import TemplatesList from "@/components/features/surveys/TemplatesList";
import DistributionsList from "@/components/features/surveys/DistributionsList";
import SurveyResponsesList from "@/components/features/surveys/SurveyResponsesList";
import TemplateSelector from "@/components/features/surveys/TemplateSelector";
import SurveyAIAnalysis from "@/components/features/ai/SurveyAIAnalysis";
import SurveyStatsCards from "@/components/features/surveys/SurveyStatsCards";
import { useSurveyStats } from "@/hooks/features/surveys/survey-stats.hooks";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/core/client";

export default function Surveys() {
 const { toast } = useToast();
 const { data: templates = [], isLoading: templatesLoading } = useSurveyTemplates();
 const { data: distributions = [], isLoading: distributionsLoading } = useSurveyDistributions();
 
 const { data: allResponses = [] } = useQuery<SurveyResponse[]>({
 queryKey: ['survey-responses-all'],
 queryFn: () => apiClient.get('/api/surveys/responses'),
 });

 const stats = useSurveyStats(templates, distributions, allResponses);

 const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
 const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
 const { data: questions = [] } = useTemplateQuestions(selectedTemplateId, !!selectedTemplateId);
 
 const [selectedDistributionForAI, setSelectedDistributionForAI] = useState<any>(null);
 const [showTemplateSelector, setShowTemplateSelector] = useState(false);
 const [showDistributionDialog, setShowDistributionDialog] = useState(false);
 const [editingTemplate, setEditingTemplate] = useState<SurveyTemplate | null>(null);
 const [editingDistribution, setEditingDistribution] = useState<any>(null);
 const [showEditDialog, setShowEditDialog] = useState(false);

 const createTemplate = useCreateTemplate();
 const deleteTemplate = useDeleteTemplate();
 const createDistribution = useCreateDistribution();

 const loading = templatesLoading || distributionsLoading;

 const handleCreateDistribution = async (template: SurveyTemplate) => {
 setSelectedTemplateId(template.id);
 setSelectedTemplate(template);
 setShowDistributionDialog(true);
 };

 const handleDistributionCreated = async (distributionData: any) => {
 await createDistribution.mutateAsync({
 ...distributionData,
 templateId: selectedTemplate?.id,
 });

 setSelectedTemplate(null);
 setSelectedTemplateId("");
 setShowDistributionDialog(false);
 };

 const handleNewDistribution = () => {
 setShowTemplateSelector(true);
 };

 const handleTemplateSelected = async (template: SurveyTemplate) => {
 setShowTemplateSelector(false);
 setSelectedTemplateId(template.id);
 setSelectedTemplate(template);
 setShowDistributionDialog(true);
 };

 const handleEditTemplate = async (template: SurveyTemplate) => {
 setEditingTemplate(template);
 setShowEditDialog(true);
 };

 const handleDuplicateTemplate = async (template: SurveyTemplate) => {
 const duplicatedTemplate = {
 ...template,
 id: `${template.id}_copy_${Date.now()}`,
 title: `${template.title} (Kopya)`,
 createdAt: new Date().toISOString(),
 };

 await createTemplate.mutateAsync(duplicatedTemplate);
 };

 const handleDeleteTemplate = async (template: SurveyTemplate) => {
 if (!confirm(`"${template.title}" anket şablonunu silmek istediğinizden emin misiniz?`)) {
 return;
 }

 await deleteTemplate.mutateAsync(template.id);
 };


 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="text-center space-y-4">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
 <p className="text-muted-foreground">Anketler yükleniyor...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Anketler</h1>
 <p className="text-muted-foreground mt-1">
 Modern anket yönetimi ve analiz sistemi
 </p>
 </div>
 <SurveyCreationDialog>
 <Button size="sm" className="gap-2">
 <Plus className="h-4 w-4" />
 Yeni Anket
 </Button>
 </SurveyCreationDialog>
 </div>

 <Tabs defaultValue="templates" className="space-y-4">
 <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
 <TabsTrigger value="templates">Şablonlar</TabsTrigger>
 <TabsTrigger value="distributions">Dağıtımlar</TabsTrigger>
 <TabsTrigger value="responses">Yanıtlar</TabsTrigger>
 <TabsTrigger value="analytics">Analiz</TabsTrigger>
 <TabsTrigger value="ai-analysis">AI Analiz</TabsTrigger>
 </TabsList>

 <SurveyStatsCards stats={stats} isLoading={templatesLoading || distributionsLoading} />

 <TabsContent value="templates" className="space-y-4">
 <TemplatesList 
 templates={templates} 
 onDistribute={handleCreateDistribution}
 onEdit={handleEditTemplate}
 onDuplicate={handleDuplicateTemplate}
 onDelete={handleDeleteTemplate}
 />
 </TabsContent>

 <TabsContent value="distributions" className="space-y-4">
 <DistributionsList 
 distributions={distributions}
 onNewDistribution={handleNewDistribution}
 onEdit={(distribution) => setEditingDistribution(distribution)}
 />
 </TabsContent>

 <TabsContent value="responses" className="space-y-4">
 <SurveyResponsesList distributions={distributions} />
 </TabsContent>

 <TabsContent value="analytics" className="space-y-4">
 <SurveyAnalyticsTab distributions={distributions} />
 </TabsContent>

 <TabsContent value="ai-analysis" className="space-y-4">
 {distributions.length > 0 ? (
 <div className="space-y-4">
 <Card className="border-muted shadow-sm">
 <CardHeader>
 <CardTitle>Dağıtım Seçin</CardTitle>
 <CardDescription>AI analizi için bir anket dağıtımı seçin</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid gap-3">
 {distributions.map((dist: any) => (
 <Button
 key={dist.id}
 variant="outline"
 className="justify-start h-auto p-4 transition-all"
 onClick={() => setSelectedDistributionForAI(dist)}
 >
 <div className="text-left">
 <div className="font-medium">{dist.title}</div>
 <div className="text-sm text-muted-foreground">
 {dist.targetClasses?.join(', ') || 'Tüm Sınıflar'} • {dist.startDate ? new Date(dist.startDate).toLocaleDateString('tr-TR') : 'Tarih belirtilmedi'}
 </div>
 </div>
 </Button>
 ))}
 </div>
 </CardContent>
 </Card>

 {selectedDistributionForAI && (
 <SurveyAIAnalysis distributionId={String(selectedDistributionForAI.id)} />
 )}
 </div>
 ) : (
 <Card className="border-muted shadow-sm">
 <CardContent className="py-16 text-center">
 <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
 <p className="text-muted-foreground">Henüz anket dağıtımı bulunmuyor</p>
 </CardContent>
 </Card>
 )}
 </TabsContent>
 </Tabs>

 <TemplateSelector
 open={showTemplateSelector}
 onOpenChange={setShowTemplateSelector}
 templates={templates}
 onSelect={handleTemplateSelected}
 />

 {selectedTemplate && questions.length > 0 && (
 <SurveyDistributionDialog
 open={showDistributionDialog}
 onOpenChange={(open) => {
 setShowDistributionDialog(open);
 if (!open) {
 setSelectedTemplate(null);
 setSelectedTemplateId("");
 }
 }}
 survey={selectedTemplate}
 questions={questions}
 onDistributionCreated={handleDistributionCreated}
 >
 <div />
 </SurveyDistributionDialog>
 )}

 {editingDistribution && (
 <SurveyDistributionEditDialog
 open={!!editingDistribution}
 onOpenChange={(open) => !open && setEditingDistribution(null)}
 distribution={editingDistribution}
 onEditComplete={() => setEditingDistribution(null)}
 />
 )}

 {editingTemplate && (
 <SurveyTemplateEditDialog
 open={!!editingTemplate}
 onOpenChange={(open) => !open && setEditingTemplate(null)}
 template={editingTemplate}
 onEditComplete={() => setEditingTemplate(null)}
 />
 )}
 </div>
 );
}