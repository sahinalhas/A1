import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/organisms/Tabs';
import { ClipboardList, User } from 'lucide-react';
import { PageHeader } from '@/components/molecules/PageHeader';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { Skeleton } from '@/components/atoms/Skeleton';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
 useExamTypes,
 useExamSubjects,
 useExamSessions,
 useCreateExamSession,
 useUpdateExamSession,
 useDeleteExamSession,
 useUpsertExamResult,
 useSessionStatistics,
 useImportExcelResults,
 downloadExcelTemplate,
 useSchoolExamsByStudent,
 useCreateSchoolExam,
 useDeleteSchoolExam,
} from '@/hooks/queries/exams.query-hooks';
import { ExamSessionDialog } from '@/components/features/exam-management/ExamSessionDialog';
import { PracticeExamsTab } from '@/components/features/exam-management/PracticeExamsTab';
import { SchoolExamsTab } from '@/components/features/exam-management/SchoolExamsTab';
import { DashboardOverviewTab } from '@/components/features/exam-management/DashboardOverviewTab';
import { UnifiedAnalysisTab } from '@/components/features/exam-management/UnifiedAnalysisTab';
import { AdvancedAnalyticsTab } from '@/components/features/exam-management/AdvancedAnalyticsTab';
import { StudentSelfServiceDashboard } from '@/components/features/exam-management/StudentSelfServiceDashboard';
import type {
 ExamSession,
 SubjectResults,
} from '../../shared/types/exam-management.types';

interface Student {
 id: string;
 name: string;
 class?: string;
 studentNumber?: string;
 grade?: number;
}

function useStudents() {
 return useQuery<Student[]>({
 queryKey: ['students'],
 queryFn: async () => {
 const response = await fetch('/api/students');
 if (!response.ok) throw new Error('Öğrenciler yüklenemedi');
 const data = await response.json();
 return data.data || [];
 },
 });
}

export default function ExamManagementPage() {
 const [activeTab, setActiveTab] = useState<string>('overview');
 const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
 const [editingSession, setEditingSession] = useState<ExamSession | null>(null);
 const [statsSessionId, setStatsSessionId] = useState<string>('');
 const [resultEntrySessionId, setResultEntrySessionId] = useState<string>('');
 const [selectedStudentForDashboard, setSelectedStudentForDashboard] = useState<string>('');

 const { data: examTypes, isLoading: typesLoading, error: typesError } = useExamTypes();
 const { data: allSessions = [], refetch: refetchSessions } = useExamSessions();
 const { data: students = [] } = useStudents();
 const { data: schoolExams = [] } = useSchoolExamsByStudent(undefined);

 const createSession = useCreateExamSession();
 const updateSession = useUpdateExamSession();
 const deleteSession = useDeleteExamSession();
 const upsertResult = useUpsertExamResult();
 const importExcel = useImportExcelResults();
 const createSchoolExam = useCreateSchoolExam();
 const deleteSchoolExam = useDeleteSchoolExam();

 const { data: statistics, isLoading: statsLoading } = useSessionStatistics(
 statsSessionId || undefined
 );

 const resultEntrySession = allSessions.find((s) => s.id === resultEntrySessionId);
 const subjectsForResultEntry = useExamSubjects(
 resultEntrySession?.exam_type_id
 );

 const handleCreateExam = async (data: {
 exam_type_id: string;
 name: string;
 exam_date: string;
 description?: string;
 }) => {
 try {
 await createSession.mutateAsync(data);
 toast.success('Deneme sınavı oluşturuldu');
 refetchSessions();
 } catch (error) {
 toast.error('Deneme sınavı oluşturulamadı');
 throw error;
 }
 };

 const handleSaveSession = async (data: {
 name: string;
 exam_date: string;
 description?: string;
 }) => {
 try {
 if (editingSession) {
 await updateSession.mutateAsync({
 id: editingSession.id,
 input: data,
 });
 toast.success('Deneme sınavı güncellendi');
 } else {
 toast.error('Geçersiz işlem');
 }
 setEditingSession(null);
 setSessionDialogOpen(false);
 refetchSessions();
 } catch (error) {
 toast.error('Bir hata oluştu');
 }
 };

 const handleEditSession = (session: ExamSession) => {
 setEditingSession(session);
 setSessionDialogOpen(true);
 };

 const handleDeleteSession = async (sessionId: string) => {
 try {
 await deleteSession.mutateAsync(sessionId);
 toast.success('Deneme sınavı silindi');
 refetchSessions();
 } catch (error) {
 toast.error('Deneme sınavı silinemedi');
 }
 };

 const handleViewStatistics = (session: ExamSession) => {
 setStatsSessionId(session.id);
 setActiveTab('analysis');
 };

 const handleSaveResults = async (
 sessionId: string,
 studentId: string,
 results: SubjectResults[]
 ) => {
 try {
 const promises = results.map((result) =>
 upsertResult.mutateAsync({
 session_id: sessionId,
 student_id: studentId,
 ...result,
 })
 );
 await Promise.all(promises);
 toast.success('Sonuçlar kaydedildi');
 } catch (error) {
 toast.error('Sonuçlar kaydedilemedi');
 throw error;
 }
 };

 const handleImportExcel = async (sessionId: string, file: File) => {
 try {
 const result = await importExcel.mutateAsync({ sessionId, file });
 toast.success(result.message || 'Dosya başarıyla yüklendi');
 return { success: true, message: result.message || 'İçe aktarma başarılı' };
 } catch (error: unknown) {
 toast.error(error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Dosya yüklenemedi');
 return {
 success: false,
 message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Bir hata oluştu',
 };
 }
 };

 const handleDownloadTemplate = async (examTypeId: string) => {
 downloadExcelTemplate(examTypeId, true);
 toast.success('Şablon indiriliyor');
 };

 const handleSaveSchoolExam = async (data: any) => {
 try {
 await createSchoolExam.mutateAsync(data);
 toast.success('Okul sınavı kaydedildi');
 } catch (error) {
 toast.error('Okul sınavı kaydedilemedi');
 throw error;
 }
 };

 const handleDeleteSchoolExam = async (examId: string) => {
 try {
 await deleteSchoolExam.mutateAsync(examId);
 toast.success('Okul sınavı silindi');
 } catch (error) {
 toast.error('Okul sınavı silinemedi');
 }
 };

 if (typesLoading) {
 return (
 <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
 <div className="space-y-2">
 <Skeleton className="h-8 w-64" />
 <Skeleton className="h-4 w-96" />
 </div>
 <Skeleton className="h-[500px] w-full" />
 </div>
 );
 }

 if (typesError) {
 return (
 <div className="w-full max-w-7xl mx-auto p-6">
 <Alert variant="destructive">
 <AlertDescription>
 Sınav türleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
 </AlertDescription>
 </Alert>
 </div>
 );
 }

 return (
 <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
 <PageHeader
 title="Sınavlar"
 subtitle="Deneme sınavları, okul notları ve değerlendirme sonuçlarını yönetin"
 icon={ClipboardList}
 />

 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
 <TabsTrigger value="overview">
 Genel Bakış
 </TabsTrigger>
 <TabsTrigger value="practice-exams">
 Denemeler
 </TabsTrigger>
 <TabsTrigger value="school-exams">
 Okul Sınavları
 </TabsTrigger>
 <TabsTrigger value="analysis">
 Analizler
 </TabsTrigger>
 <TabsTrigger value="advanced">
 Gelişmiş Analitik
 </TabsTrigger>
 <TabsTrigger value="student-dashboard">
 Öğrenci Panosu
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="mt-6">
 <DashboardOverviewTab
 examTypes={examTypes || []}
 onNavigateToTab={setActiveTab}
 onCreateSession={() => {
 setActiveTab('practice-exams');
 }}
 />
 </TabsContent>

 <TabsContent value="practice-exams" className="mt-6">
 <PracticeExamsTab
 examTypes={examTypes || []}
 sessions={allSessions}
 subjects={subjectsForResultEntry.data || []}
 students={students}
 onCreateExam={handleCreateExam}
 onViewStatistics={handleViewStatistics}
 onImportExcel={handleImportExcel}
 onDownloadTemplate={handleDownloadTemplate}
 onSaveResults={handleSaveResults}
 onResultSessionChange={setResultEntrySessionId}
 onEditSession={handleEditSession}
 onDeleteSession={handleDeleteSession}
 isCreating={createSession.isPending}
 />
 </TabsContent>

 <TabsContent value="school-exams" className="mt-6">
 <SchoolExamsTab
 students={students}
 schoolExams={schoolExams}
 onSave={handleSaveSchoolExam}
 onDelete={handleDeleteSchoolExam}
 />
 </TabsContent>

 <TabsContent value="analysis" className="mt-6">
 <UnifiedAnalysisTab
 examTypes={examTypes || []}
 sessions={allSessions}
 statistics={statistics || null}
 isLoading={statsLoading}
 onSessionChange={setStatsSessionId}
 selectedSessionId={statsSessionId}
 />
 </TabsContent>

 <TabsContent value="advanced" className="mt-6">
 <AdvancedAnalyticsTab examTypes={examTypes || []} />
 </TabsContent>

 <TabsContent value="student-dashboard" className="mt-6">
 {selectedStudentForDashboard ? (
 <StudentSelfServiceDashboard
 studentId={selectedStudentForDashboard}
 studentName={students.find((s) => s.id === selectedStudentForDashboard)?.name || ''}
 />
 ) : (
 <div className="bg-card border rounded-lg p-12 text-center">
 <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
 <h3 className="text-lg font-medium mb-2">Öğrenci Seçin</h3>
 <p className="text-muted-foreground mb-6">
 Öğrenci panosu görüntülemek için bir öğrenci seçin
 </p>
 <select
 className="border rounded px-4 py-2 min-w-[300px]"
 value={selectedStudentForDashboard}
 onChange={(e) => setSelectedStudentForDashboard(e.target.value)}
 >
 <option value="">Öğrenci seçin...</option>
 {students.map((student: any) => (
 <option key={student.id} value={student.id}>
 {student.name}
 </option>
 ))}
 </select>
 </div>
 )}
 </TabsContent>
 </Tabs>

 <ExamSessionDialog
 open={sessionDialogOpen}
 onOpenChange={setSessionDialogOpen}
 examTypeId={editingSession?.exam_type_id || ''}
 examTypeName={
 examTypes?.find((t) => t.id === editingSession?.exam_type_id)?.name || ''
 }
 session={editingSession || undefined}
 onSave={handleSaveSession}
 />
 </div>
 );
}
