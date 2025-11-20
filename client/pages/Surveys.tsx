import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { 
  Plus, 
  ClipboardList, 
  FileText, 
  Send, 
  MessageSquare, 
  BarChart3, 
  Brain,
  Sparkles 
} from "lucide-react";
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
    <div className="w-full min-h-screen pb-6">
      {/* Modern Gradient Header */}
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
                  <ClipboardList className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Anketler</h1>
              </div>
              <p className="text-white/90 text-base max-w-2xl">
                Modern anket yönetimi ve analiz sistemi
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SurveyCreationDialog>
                <Button 
                  size="lg" 
                  className="gap-2 bg-white text-cyan-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5" />
                  Yeni Anket Oluştur
                </Button>
              </SurveyCreationDialog>
            </motion.div>
          </div>

          <motion.div
            className="hidden md:block opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)' }}
          >
            <Sparkles className="h-20 w-20 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <div className="space-y-6 max-w-7xl mx-auto px-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SurveyStatsCards stats={stats} isLoading={templatesLoading || distributionsLoading} />
        </motion.div>

        {/* Modern Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Şablonlar</span>
              </TabsTrigger>
              <TabsTrigger value="distributions" className="gap-2">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Dağıtımlar</span>
              </TabsTrigger>
              <TabsTrigger value="responses" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Yanıtlar</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analiz</span>
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Analiz</span>
              </TabsTrigger>
            </TabsList>

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
                  <Card className="border-muted">
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
                            className="justify-start h-auto p-4"
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
                <Card className="border-muted">
                  <CardContent className="py-16 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz anket dağıtımı bulunmuyor</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

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
