
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Loader2, 
  MessageSquare, 
  Target, 
  FileText, 
  ClipboardCheck, 
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/organisms/Dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Switch } from "@/components/atoms/Switch";
import { Slider } from "@/components/atoms/Slider";
import { Calendar } from "@/components/organisms/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/organisms/Popover";
import { Card, CardContent } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/organisms/Collapsible";
import { useToast } from "@/hooks/utils/toast.utils";

import { completeSessionSchema, type CompleteSessionFormValues, type CounselingSession, type CounselingTopic } from "../types";
import CounselingTopicSelector from "./CounselingTopicSelector";
import ActionItemsManager from "./ActionItemsManager";
import AIAnalysisPreview from "../ai/AIAnalysisPreview";
import { useAISessionAnalysis } from "@/hooks/features/counseling/useAISessionAnalysis";
import { cn } from "@/lib/utils";

interface EnhancedCompleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CounselingSession | null;
  topics: CounselingTopic[];
  onSubmit: (data: CompleteSessionFormValues) => void;
  isPending: boolean;
}

export default function EnhancedCompleteSessionDialog({
  open,
  onOpenChange,
  session,
  topics,
  onSubmit,
  isPending,
}: EnhancedCompleteSessionDialogProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [actionItemsOpen, setActionItemsOpen] = useState(false);
  const { toast } = useToast();

  const { analyzeSession, analysis, isAnalyzing, clearAnalysis } = useAISessionAnalysis();

  const normalizeTopicValue = (topicValue: string | undefined): string => {
    if (!topicValue) return "";
    
    const topicById = topics.find(t => t.id === topicValue);
    if (topicById) return topicValue;
    
    const topicByTitle = topics.find(t => t.title === topicValue);
    if (topicByTitle) return topicByTitle.id;
    
    return topicValue;
  };

  const form = useForm<CompleteSessionFormValues>({
    resolver: zodResolver(completeSessionSchema) as any,
    mode: "onBlur",
    defaultValues: {
      topic: normalizeTopicValue(session?.topic),
      exitTime: new Date().toTimeString().slice(0, 5),
      detailedNotes: "",
      actionItems: [],
      followUpNeeded: false,
      cooperationLevel: 3,
      emotionalState: "sakin",
      physicalState: "normal",
      communicationQuality: "açık",
      followUpDate: undefined,
      followUpTime: undefined,
    },
  });

  const followUpNeeded = form.watch("followUpNeeded");

  useEffect(() => {
    if (followUpNeeded && !form.getValues("followUpDate")) {
      setDatePickerOpen(true);
    }
  }, [followUpNeeded]);

  const handleSubmit = (data: CompleteSessionFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const handleFormSubmit = () => {
    const errors = form.formState.errors;
    
    if (Object.keys(errors).length > 0) {
      if (errors.topic) {
        toast({
          title: 'Eksik bilgi',
          description: 'Görüşme konusu seçmelisiniz.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        setTimeout(() => form.setFocus('topic'), 100);
        return;
      }
      
      if (errors.followUpDate) {
        const missingTime = !form.getValues('followUpTime');
        toast({
          title: 'Eksik bilgi',
          description: missingTime 
            ? 'Takip görüşmesi için tarih ve saat seçmelisiniz.'
            : 'Takip görüşmesi için tarih seçmelisiniz.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        setTimeout(() => {
          if (!form.getValues('followUpDate')) {
            setDatePickerOpen(true);
          } else if (missingTime) {
            form.setFocus('followUpTime');
          }
        }, 100);
        return;
      }
      
      if (errors.followUpTime) {
        toast({
          title: 'Eksik bilgi',
          description: 'Takip görüşmesi için saat seçmelisiniz.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        setTimeout(() => form.setFocus('followUpTime'), 100);
        return;
      }
      
      if (errors.exitTime) {
        toast({
          title: 'Eksik bilgi',
          description: 'Çıkış saati gereklidir.',
          variant: 'destructive'
        });
        setActiveTab('summary');
        setTimeout(() => form.setFocus('exitTime'), 100);
        return;
      }

      toast({
        title: 'Form hatası',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        variant: 'destructive'
      });
    }
  };

  const getCurrentStepLabel = () => {
    switch(activeTab) {
      case "summary": return "1/2";
      case "assessment": return "2/2";
      default: return "";
    }
  };

  const getSubmitButtonText = () => {
    if (followUpNeeded) {
      return "Kaydet ve Takip Planla";
    }
    return "Görüşmeyi Kaydet";
  };

  const handleAIAnalyze = async () => {
    const rawNotes = form.getValues('detailedNotes');

    if (!rawNotes || rawNotes.trim().length < 10) {
      toast({
        title: 'Yetersiz not',
        description: 'Analiz için en az 10 karakter uzunluğunda not yazın',
        variant: 'destructive'
      });
      return;
    }

    if (!session) {
      toast({
        title: 'Hata',
        description: 'Oturum bilgisi bulunamadı',
        variant: 'destructive'
      });
      return;
    }

    try {
      const studentId = session.sessionType === 'group' 
        ? session.students?.[0]?.id 
        : session.student?.id;
      
      if (!studentId) {
        throw new Error('Öğrenci ID bulunamadı');
      }

      const sessionDateTime = `${session.sessionDate}T${session.entryTime}:00`;
      
      const requestData = {
        rawNotes,
        sessionId: session.id,
        studentId,
        sessionType: session.sessionType,
        sessionDate: sessionDateTime,
        entryTime: session.entryTime,
        sessionTopic: session.topic
      };
      
      console.log('AI Analysis Request Data:', requestData);
      console.log('Session ID:', session.id, 'Type:', typeof session.id);
      console.log('Student ID:', studentId, 'Type:', typeof studentId);
      console.log('Session Date:', sessionDateTime);
      
      await analyzeSession(requestData);

      setPreviewOpen(true);

      toast({
        title: 'Analiz tamamlandı',
        description: 'AI önerileri hazır. İnceleyin ve uygulamak istediklerinizi seçin.',
      });

    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      toast({
        title: 'Analiz hatası',
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
      });
    }
  };

  const handleApplyAnalysis = (selections: any) => {
    if (!analysis) return;

    if (selections.summary) {
      form.setValue('detailedNotes', analysis.summary.professional);
    }

    if (selections.emotionalState) {
      form.setValue('emotionalState', analysis.formSuggestions.emotionalState);
    }

    if (selections.physicalState) {
      form.setValue('physicalState', analysis.formSuggestions.physicalState);
    }

    if (selections.cooperationLevel) {
      form.setValue('cooperationLevel', analysis.formSuggestions.cooperationLevel);
    }

    if (selections.communicationQuality) {
      form.setValue('communicationQuality', analysis.formSuggestions.communicationQuality);
    }

    if (selections.sessionFlow) {
      form.setValue('sessionFlow', analysis.formSuggestions.sessionFlow);
    }

    if (selections.studentParticipationLevel) {
      form.setValue('studentParticipationLevel', analysis.formSuggestions.studentParticipationLevel);
    }

    if (selections.actionItems && analysis.actionItems.length > 0) {
      const selectedItems = analysis.actionItems
        .filter((_, index) => selections.actionItems[index] !== false)
        .map(item => ({
          description: item.description,
          assignedTo: item.assignedTo,
          priority: item.priority,
          dueDate: item.dueDate instanceof Date 
            ? item.dueDate.toISOString().split('T')[0] 
            : item.dueDate
        }));
      form.setValue('actionItems', selectedItems);
    }

    if (selections.followUp && analysis.followUpRecommendation?.needed) {
      form.setValue('followUpNeeded', true);
      if (analysis.followUpRecommendation.suggestedDays) {
        const suggestedDate = new Date();
        suggestedDate.setDate(suggestedDate.getDate() + analysis.followUpRecommendation.suggestedDays);
        form.setValue('followUpDate', suggestedDate);
      }
    }

    setPreviewOpen(false);

    toast({
      title: 'Uygulandı',
      description: 'AI önerileri forma uygulandı. İsterseniz düzenleyebilirsiniz.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        <DialogHeader>
          <div className="relative pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-400/20 rounded-xl blur-lg" />
                  <div className="relative p-3 rounded-xl bg-violet-100/60 dark:bg-violet-900/30">
                    <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="font-bold text-xl text-slate-800 dark:text-slate-100">
                    Görüşmeyi Tamamla
                  </DialogTitle>
                  <DialogDescription className="mt-1.5 text-slate-600 dark:text-slate-400">
                    Görüşme detaylarını kaydedin ve takip planı oluşturun
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-lg">
                Adım {getCurrentStepLabel()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit, handleFormSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl gap-1 border border-slate-200/50 dark:border-slate-700/50">
                  <TabsTrigger 
                    value="summary" 
                    className="data-[state=active]:bg-violet-100/80 dark:data-[state=active]:bg-violet-900/40 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    <FileText className="h-4 w-4 mr-1.5" />
                    Özet & Takip
                  </TabsTrigger>
                  <TabsTrigger 
                    value="assessment"
                    className="data-[state=active]:bg-emerald-100/80 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 py-2.5 rounded-lg text-sm font-medium transition-all"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1.5" />
                    Değerlendirme
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-3 mt-5">
                  <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      {/* Başlangıç Bilgileri - Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Çıkış Saati */}
                        <FormField
                          control={form.control}
                          name="exitTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-violet-500" />
                                Çıkış Saati <span className="text-rose-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="time" 
                                  {...field} 
                                  className="h-9 rounded-lg text-sm" 
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        {/* Görüşme Konusu - 2 kolon */}
                        <FormField
                          control={form.control}
                          name="topic"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-1 lg:col-span-2">
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Görüşme Konusu <span className="text-rose-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <CounselingTopicSelector
                                  topics={topics}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  placeholder="Konu ara ve seç..."
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Görüşme Notları */}
                      <FormField
                        control={form.control}
                        name="detailedNotes"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-violet-500" />
                                Görüşme Notları <span className="text-slate-400 text-xs font-normal ml-1">(İsteğe bağlı)</span>
                              </FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAIAnalyze}
                                disabled={isAnalyzing}
                                className="gap-1.5 h-7 text-xs px-2.5"
                              >
                                {isAnalyzing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                                AI Analiz
                              </Button>
                            </div>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Görüşme detayları, kararlar, sonuçlar..."
                                rows={4}
                                className="rounded-lg resize-none text-sm"
                                enableVoice={true}
                                voiceLanguage="tr-TR"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Takip Görüşmesi Toggle */}
                      <FormField
                        control={form.control}
                        name="followUpNeeded"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5">
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer m-0 flex items-center gap-2">
                                <Target className="h-4 w-4 text-amber-500" />
                                Takip Görüşmesi Planlayın
                              </FormLabel>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Takip Görüşmesi Detayları - Inline */}
                      {followUpNeeded && (
                        <div className="space-y-3 rounded-lg border border-amber-300/60 dark:border-amber-700/40 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                              Takip Randevusu
                            </p>
                            <Badge variant="destructive" className="text-xs ml-auto">Gerekli</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <FormField
                              control={form.control}
                              name="followUpDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-slate-700 dark:text-slate-300">
                                    Tarih <span className="text-rose-500">*</span>
                                  </FormLabel>
                                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal h-9 text-xs",
                                            !field.value && "text-slate-400"
                                          )}
                                        >
                                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                                          {field.value ? (
                                            format(field.value, "d MMM yyyy", { locale: tr })
                                          ) : (
                                            <span>Tarih seç</span>
                                          )}
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => {
                                          if (date) {
                                            field.onChange(date);
                                            setDatePickerOpen(false);
                                          }
                                        }}
                                        disabled={(date) => {
                                          const today = new Date();
                                          today.setHours(0, 0, 0, 0);
                                          return date < today;
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="followUpTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-slate-700 dark:text-slate-300">
                                    Saat <span className="text-rose-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="time" 
                                      {...field} 
                                      className="h-9 text-xs" 
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Aksiyon Maddeleri - Collapsible */}
                      <Collapsible open={actionItemsOpen} onOpenChange={setActionItemsOpen}>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full flex items-center justify-between px-3 py-2.5 h-auto hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <Target className="h-4 w-4 text-slate-500" />
                                Aksiyon Maddeleri
                                <span className="text-xs text-slate-400 font-normal">(İsteğe bağlı)</span>
                              </div>
                              {actionItemsOpen ? (
                                <ChevronUp className="h-4 w-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 pb-3">
                            <FormField
                              control={form.control}
                              name="actionItems"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <ActionItemsManager
                                      items={field.value || []}
                                      onItemsChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="assessment" className="space-y-3 mt-5">
                  <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            Değerlendirme
                          </h3>
                        </div>
                        <Badge variant="outline" className="text-xs">İsteğe bağlı</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
                        <FormField
                          control={form.control}
                          name="sessionFlow"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Görüşme Seyri
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 rounded-lg text-sm">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="çok_olumlu">Çok Olumlu</SelectItem>
                                  <SelectItem value="olumlu">😊 Olumlu</SelectItem>
                                  <SelectItem value="nötr">😐 Nötr</SelectItem>
                                  <SelectItem value="sorunlu">😟 Sorunlu</SelectItem>
                                  <SelectItem value="kriz">🚨 Kriz</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="studentParticipationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Katılım Düzeyi
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 rounded-lg text-sm">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="çok_aktif">Çok Aktif</SelectItem>
                                  <SelectItem value="aktif">Aktif</SelectItem>
                                  <SelectItem value="pasif">Pasif</SelectItem>
                                  <SelectItem value="dirençli">Dirençli</SelectItem>
                                  <SelectItem value="kapalı">Kapalı</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emotionalState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Duygu Durumu
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 rounded-lg text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="sakin">😌 Sakin</SelectItem>
                                  <SelectItem value="kaygılı">😰 Kaygılı</SelectItem>
                                  <SelectItem value="üzgün">😢 Üzgün</SelectItem>
                                  <SelectItem value="sinirli">😠 Sinirli</SelectItem>
                                  <SelectItem value="mutlu">😊 Mutlu</SelectItem>
                                  <SelectItem value="karışık">😕 Karışık</SelectItem>
                                  <SelectItem value="diğer">🤔 Diğer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="physicalState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Fiziksel Durum
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 rounded-lg text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="yorgun">Yorgun</SelectItem>
                                  <SelectItem value="enerjik">Enerjik</SelectItem>
                                  <SelectItem value="huzursuz">Huzursuz</SelectItem>
                                  <SelectItem value="hasta">Hasta</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="communicationQuality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                İletişim Kalitesi
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 rounded-lg text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                  <SelectItem value="açık">Açık</SelectItem>
                                  <SelectItem value="çekingen">Çekingen</SelectItem>
                                  <SelectItem value="dirençli">Dirençli</SelectItem>
                                  <SelectItem value="sınırlı">Sınırlı</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cooperationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                İşbirliği: {field.value}/5
                              </FormLabel>
                              <FormControl>
                                <div className="pt-1">
                                  <Slider
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={[field.value || 3]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-3 sm:gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="h-11 px-5 rounded-xl border font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="h-11 px-6 rounded-xl font-medium bg-violet-500/90 hover:bg-violet-600/90 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {getSubmitButtonText()}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>

      <AIAnalysisPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        analysis={analysis}
        isLoading={isAnalyzing}
        onApply={handleApplyAnalysis}
      />
    </Dialog>
  );
}
