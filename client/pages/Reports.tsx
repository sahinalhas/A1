import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth, PermissionGuard, getExportPermissions } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { PageHeader } from "@/components/molecules/PageHeader";
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from "@/components/atoms/Select";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/components/organisms/Dialog";

// Analytics Components
import PredictiveAnalysis from "@/components/features/analytics/PredictiveAnalysis";
import ComparativeReports from "@/components/features/analytics/ComparativeReports";
import ProgressCharts from "@/components/features/analytics/ProgressCharts";
import EarlyWarningSystem from "@/components/features/analytics/EarlyWarningSystem";

// AI Components
import BulkAnalysisDashboard from "@/components/features/ai/BulkAnalysisDashboard";

// Chart Components
import {
 SuccessMetricCard,
 RiskDistributionChart,
 PerformanceTrendChart,
 ClassComparisonChart,
 EarlyWarningIndicator,
} from "@/components/features/charts/AnalyticsCharts";

// Analytics Functions
import { 
 exportAnalyticsData,
} from "@/lib/analytics";

import { 
 getReportsOverview,
 invalidateAnalyticsCache,
 type ReportsOverview,
} from "@/lib/api/endpoints/analytics.api";

import { 
 BarChart3, 
 TrendingUp, 
 Users,
 AlertTriangle,
 Award,
 Calendar,
 Download,
 Filter,
 Settings,
 RefreshCw,
 FileText,
 Mail,
 Brain,
} from "lucide-react";

// =================== OVERVIEW DASHBOARD ===================

function OverviewDashboard({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
 const { hasPermission } = useAuth();
 
 const { data: reportsData, isLoading: loading, error } = useQuery({
 queryKey: ['reports-overview'],
 queryFn: getReportsOverview,
 staleTime: 10 * 60 * 1000, // 10 dakika - daha uzun cache
 gcTime: 60 * 60 * 1000, // 1 saat - daha uzun garbage collection
 refetchOnWindowFocus: false,
 refetchOnMount: false, // Tekrar mount olduğunda yeniden yükleme
 });

 const overallStats = useMemo(() => {
 if (!reportsData) {
 return {
 totalStudents: 0,
 averageSuccessRate: 0,
 highSuccessCount: 0,
 atRiskCount: 0,
 criticalWarnings: 0,
 activeWarnings: 0,
 };
 }
 
 const avgSuccess = reportsData.studentAnalytics.length > 0
 ? reportsData.studentAnalytics.reduce((sum, s) => sum + s.successProbability, 0) / reportsData.studentAnalytics.length
 : 0;
 
 return {
 totalStudents: reportsData.totalStudents,
 averageSuccessRate: Math.round(avgSuccess),
 highSuccessCount: reportsData.riskDistribution.düşük,
 atRiskCount: reportsData.riskDistribution.yüksek + reportsData.riskDistribution.kritik,
 criticalWarnings: reportsData.topWarnings.filter(w => w.severity === 'kritik').length,
 activeWarnings: reportsData.topWarnings.length,
 };
 }, [reportsData]);

 const riskDistribution = useMemo(() => {
 if (!reportsData) return [];
 
 return [
 { name:"Düşük", value: reportsData.riskDistribution.düşük },
 { name:"Orta", value: reportsData.riskDistribution.orta },
 { name:"Yüksek", value: reportsData.riskDistribution.yüksek + reportsData.riskDistribution.kritik },
 ];
 }, [reportsData]);

 const classComparisonData = useMemo(() => {
 if (!reportsData) return [];
 
 return reportsData.classComparisons.map(cls => ({
 category: cls.className,
 current: cls.averageGPA,
 previous: cls.averageGPA * 0.95,
 target: 3.5,
 }));
 }, [reportsData]);

 if (loading) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="text-center">
 <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
 <p className="text-muted-foreground">Raporlar yükleniyor...</p>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="text-center">
 <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
 <p className="text-destructive">Rapor verileri yüklenirken bir hata oluştu</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* Ana İstatistikler */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <SuccessMetricCard
 title="Toplam Öğrenci"
 value={overallStats.totalStudents}
 icon={Users}
 description="Sisteme kayıtlı öğrenci sayısı"
 showAsPercentage={false}
 />
 
 <SuccessMetricCard
 title="Ortalama Başarı"
 value={Math.round(overallStats.averageSuccessRate)}
 icon={Award}
 description="Genel başarı tahmini ortalaması"
 trend="up"
 />
 
 <SuccessMetricCard
 title="Yüksek Başarı"
 value={overallStats.highSuccessCount}
 total={overallStats.totalStudents}
 icon={TrendingUp}
 description="Yüksek başarı gösteren öğrenci"
 trend="up"
 />
 
 <SuccessMetricCard
 title="Risk Altında"
 value={overallStats.atRiskCount}
 icon={AlertTriangle}
 description="Yakın takip gerektiren öğrenci"
 trend="down"
 />
 </div>

 {/* Uyarı Özeti */}
 {overallStats.activeWarnings > 0 && (
 <Card className="border-orange-200 bg-orange-50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-orange-800">
 <AlertTriangle className="h-5 w-5" />
 Aktif Uyarılar
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-center justify-between">
 <div>
 <div className="text-2xl font-bold text-orange-800">
 {overallStats.activeWarnings}
 </div>
 <div className="text-sm text-orange-600">
 {overallStats.criticalWarnings > 0 && (
 <span className="font-medium">
 {overallStats.criticalWarnings} kritik uyarı
 </span>
 )}
 </div>
 </div>
 <Button variant="outline" size="sm" onClick={() => setActiveTab('warnings')}>
 Detayları Görüntüle
 </Button>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Grafikler */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <RiskDistributionChart data={riskDistribution} />
 <ClassComparisonChart data={classComparisonData} />
 </div>

 {/* Son Uyarılar */}
 {reportsData && reportsData.topWarnings.length > 0 && (
 <EarlyWarningIndicator warnings={reportsData.topWarnings} maxDisplay={5} />
 )}
 </div>
 );
}

// =================== EXPORT & SETTINGS ===================

function ExportSettings() {
 const { user, hasPermission } = useAuth();
 const navigate = useNavigate();
 const [exportFormat, setExportFormat] = useState<"json" |"csv">("json");
 const [reportType, setReportType] = useState<string>("all");
 const [includePersonalData, setIncludePersonalData] = useState(false);
 
 const exportPermissions = useMemo(() => {
 return user ? getExportPermissions(user.role) : { canExportAll: false, canExportFiltered: false, allowedFormats: [] };
 }, [user]);

 const handleExport = async () => {
 if (!exportPermissions.canExportFiltered && !exportPermissions.canExportAll) {
 alert('Bu işlem için yetkiniz bulunmamaktadır.');
 return;
 }

 if (!exportPermissions.allowedFormats.includes(exportFormat)) {
 alert(`${exportFormat.toUpperCase()} formatında dışa aktarma izniniz bulunmamaktadır.`);
 return;
 }
 
 try {
 const rawData = await exportAnalyticsData({
 includePersonalData: includePersonalData && hasPermission('view_sensitive_data'),
 });
 
 const dataString = exportFormat ==="json" 
 ? JSON.stringify(rawData, null, 2)
 : convertToCSV(rawData);
 
 const blob = new Blob([dataString], { 
 type: exportFormat ==="json" ?"application/json" :"text/csv" 
 });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 } catch (error) {
 console.error("Export failed:", error);
 alert('Rapor ihracı sırasında hata oluştu.');
 }
 };
 
 function convertToCSV(data: any[]): string {
 if (data.length === 0) return '';
 const headers = Object.keys(data[0]);
 const csvRows = [
 headers.join(','),
 ...data.map(row => headers.map(field => JSON.stringify(row[field] || '')).join(','))
 ];
 return csvRows.join('\n');
 }

 return (
 <div className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Download className="h-5 w-5" />
 Rapor İhracı
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium">Rapor Türü</label>
 <Select value={reportType} onValueChange={setReportType}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Raporlar</SelectItem>
 <SelectItem value="predictive">Prediktif Analiz</SelectItem>
 <SelectItem value="comparative">Karşılaştırmalı</SelectItem>
 <SelectItem value="progress">İlerleme Takibi</SelectItem>
 <SelectItem value="warnings">Erken Uyarılar</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div>
 <label className="text-sm font-medium">Format</label>
 <Select 
 value={exportFormat} 
 onValueChange={(value) => setExportFormat(value as"json" |"csv")}
 disabled={!exportPermissions.canExportFiltered}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {exportPermissions.allowedFormats.includes('json') && (
 <SelectItem value="json">JSON</SelectItem>
 )}
 {exportPermissions.allowedFormats.includes('csv') && (
 <SelectItem value="csv">CSV</SelectItem>
 )}
 </SelectContent>
 </Select>
 </div>
 </div>
 
 {hasPermission('view_sensitive_data') && (
 <div className="flex items-center space-x-2">
 <input 
 type="checkbox" 
 id="includePersonalData"
 checked={includePersonalData}
 onChange={(e) => setIncludePersonalData(e.target.checked)}
 />
 <label htmlFor="includePersonalData" className="text-sm">
 Kişisel verileri dahil et
 </label>
 </div>
 )}
 
 <div className="flex gap-2">
 <Button 
 onClick={handleExport} 
 className="gap-2"
 disabled={!exportPermissions.canExportFiltered && !exportPermissions.canExportAll}
 >
 <Download className="h-4 w-4" />
 Raporu İndir
 </Button>
 <PermissionGuard permission="export_all_data">
 <Button 
 variant="outline" 
 className="gap-2"
 onClick={() => {
 alert('E-posta gönderme özelliği yakında eklenecek. Şu an için raporu indirip manuel olarak gönderebilirsiniz.');
 }}
 >
 <Mail className="h-4 w-4" />
 E-posta Gönder
 </Button>
 </PermissionGuard>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Settings className="h-5 w-5" />
 Rapor Ayarları
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <div className="font-medium text-sm">Otomatik Rapor</div>
 <div className="text-sm text-muted-foreground">
 Haftalık otomatik rapor oluşturma
 </div>
 </div>
 <Badge variant="outline">Kapalı</Badge>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <div className="font-medium text-sm">Uyarı Bildirimleri</div>
 <div className="text-sm text-muted-foreground">
 Kritik uyarılar için e-posta bildirimi
 </div>
 </div>
 <Badge variant="default">Açık</Badge>
 </div>
 
 <div className="flex items-center justify-between">
 <div>
 <div className="font-medium text-sm">Veri Saklama</div>
 <div className="text-sm text-muted-foreground">
 Analitik verilerin saklama süresi
 </div>
 </div>
 <Badge variant="outline">12 Ay</Badge>
 </div>
 </div>
 
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => navigate('/ayarlar')}
 >
 Ayarları Düzenle
 </Button>
 </CardContent>
 </Card>
 </div>
 );
}

// =================== MAIN REPORTS PAGE ===================

export default function Reports() {
 const { user, hasPermission } = useAuth();
 const [activeTab, setActiveTab] = useState("overview");
 const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["overview"]));
 const [refreshKey, setRefreshKey] = useState(0);
 const [filtersOpen, setFiltersOpen] = useState(false);

 const handleTabChange = (tab: string) => {
 setActiveTab(tab);
 setLoadedTabs(prev => new Set(prev).add(tab));
 };

 const handleRefresh = () => {
 setRefreshKey(prev => prev + 1);
 setLoadedTabs(new Set([activeTab])); // Sadece aktif sekmeyi yenile
 };

 const exportPermissions = useMemo(() => {
 return user ? getExportPermissions(user.role) : { canExportAll: false, canExportFiltered: false, allowedFormats: [] };
 }, [user]);

 const handleHeaderExport = async () => {
 if (!exportPermissions.canExportFiltered && !exportPermissions.canExportAll) {
 alert('Bu işlem için yetkiniz bulunmamaktadır.');
 return;
 }

 if (!exportPermissions.allowedFormats || exportPermissions.allowedFormats.length === 0) {
 alert('İzin verilen dışa aktarma formatı bulunamadı.');
 return;
 }

 const format = exportPermissions.allowedFormats[0] as"json" |"csv";
 
 try {
 const rawData = await exportAnalyticsData({
 includePersonalData: hasPermission('view_sensitive_data'),
 });
 
 const dataString = format ==="json" 
 ? JSON.stringify(rawData, null, 2)
 : convertToCSV(rawData);
 
 const mimeType = format ==="json" ?"application/json" :"text/csv";
 const blob = new Blob([dataString], { type: mimeType });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 } catch (error) {
 console.error("Export failed:", error);
 alert('Rapor ihracı sırasında hata oluştu.');
 }
 };
 
 function convertToCSV(data: any[]): string {
 if (data.length === 0) return '';
 const headers = Object.keys(data[0]);
 const csvRows = [
 headers.join(','),
 ...data.map(row => headers.map(field => JSON.stringify(row[field] || '')).join(','))
 ];
 return csvRows.join('\n');
 }
 
 if (!user) {
 return (
 <div className="flex items-center justify-center min-h-96">
 <div className="text-center">
 <h2 className="text-xl font-semibold mb-2">Giriş Gerekli</h2>
 <p className="text-muted-foreground">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
 </div>
 </div>
 );
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="w-full max-w-7xl mx-auto py-6 space-y-6"
 >
 <PageHeader
 icon={BarChart3}
 title="Analiz & Raporlama"
 subtitle="Öğrenci başarı analizleri, karşılaştırmalı raporlar ve erken uyarı sistemi"
 actions={
 <div className="flex gap-2">
 <Button 
 variant="outline" 
 size="sm"
 onClick={handleRefresh}
 className="gap-2"
 >
 <RefreshCw className="h-4 w-4" />
 Yenile
 </Button>
 <Button 
 variant="outline" 
 size="sm"
 className="gap-2"
 onClick={() => setFiltersOpen(true)}
 >
 <Filter className="h-4 w-4" />
 Filtreler
 </Button>
 <Button 
 size="sm"
 className="gap-2"
 onClick={handleHeaderExport}
 disabled={!exportPermissions.canExportFiltered && !exportPermissions.canExportAll}
 >
 <Download className="h-4 w-4" />
 Rapor İndir
 </Button>
 </div>
 }
 />

 {/* Ana İçerik */}
 <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
 <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
 <TabsTrigger value="overview">
 Genel Bakış
 </TabsTrigger>
 <TabsTrigger value="predictive">
 Prediktif Analiz
 </TabsTrigger>
 <TabsTrigger value="comparative">
 Karşılaştırmalı
 </TabsTrigger>
 <TabsTrigger value="progress">
 İlerleme
 </TabsTrigger>
 <TabsTrigger value="warnings">
 Erken Uyarı
 </TabsTrigger>
 <TabsTrigger value="ai-analysis">
 AI Analiz
 </TabsTrigger>
 <TabsTrigger value="settings">
 Ayarlar
 </TabsTrigger>
 </TabsList>

 {activeTab ==="overview" && (
 <div className="mt-4">
 <OverviewDashboard setActiveTab={setActiveTab} />
 </div>
 )}

 {activeTab ==="predictive" && (
 <div className="mt-4">
 <PermissionGuard 
 permission="view_predictive_analysis"
 fallback={
 <div className="text-center py-12 text-muted-foreground">
 <p>Bu özelliğe erişim yetkiniz bulunmamaktadır.</p>
 </div>
 }
 >
 {loadedTabs.has("predictive") && <PredictiveAnalysis key={refreshKey} />}
 </PermissionGuard>
 </div>
 )}

 {activeTab ==="comparative" && (
 <div className="mt-4">
 <PermissionGuard 
 permission="view_comparative_reports"
 fallback={
 <div className="text-center py-12 text-muted-foreground">
 <p>Bu özelliğe erişim yetkiniz bulunmamaktadır.</p>
 </div>
 }
 >
 {loadedTabs.has("comparative") && <ComparativeReports key={refreshKey} />}
 </PermissionGuard>
 </div>
 )}

 {activeTab ==="progress" && (
 <div className="mt-4">
 <PermissionGuard 
 permission="view_progress_charts"
 fallback={
 <div className="text-center py-12 text-muted-foreground">
 <p>Bu özelliğe erişim yetkiniz bulunmamaktadır.</p>
 </div>
 }
 >
 {loadedTabs.has("progress") && <ProgressCharts key={refreshKey} />}
 </PermissionGuard>
 </div>
 )}

 {activeTab ==="warnings" && (
 <div className="mt-4">
 <PermissionGuard 
 permission="view_early_warnings"
 fallback={
 <div className="text-center py-12 text-muted-foreground">
 <p>Bu özelliğe erişim yetkiniz bulunmamaktadır.</p>
 </div>
 }
 >
 {loadedTabs.has("warnings") && <EarlyWarningSystem key={refreshKey} />}
 </PermissionGuard>
 </div>
 )}

 {activeTab ==="ai-analysis" && (
 <div className="mt-4">
 {loadedTabs.has("ai-analysis") && <BulkAnalysisDashboard key={refreshKey} />}
 </div>
 )}

 {activeTab ==="settings" && (
 <div className="mt-4">
 <ExportSettings />
 </div>
 )}
 </Tabs>

 {/* Filtreler Dialog */}
 <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Rapor Filtreleri</DialogTitle>
 <DialogDescription>
 Raporları filtrelemek için aşağıdaki seçenekleri kullanın
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Tarih Aralığı</label>
 <Select defaultValue="30days">
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="7days">Son 7 Gün</SelectItem>
 <SelectItem value="30days">Son 30 Gün</SelectItem>
 <SelectItem value="90days">Son 90 Gün</SelectItem>
 <SelectItem value="1year">Son 1 Yıl</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Sınıf</label>
 <Select defaultValue="all">
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tüm Sınıflar</SelectItem>
 <SelectItem value="9">9. Sınıf</SelectItem>
 <SelectItem value="10">10. Sınıf</SelectItem>
 <SelectItem value="11">11. Sınıf</SelectItem>
 <SelectItem value="12">12. Sınıf</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Risk Düzeyi</label>
 <Select defaultValue="all">
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tümü</SelectItem>
 <SelectItem value="low">Düşük</SelectItem>
 <SelectItem value="medium">Orta</SelectItem>
 <SelectItem value="high">Yüksek</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="flex justify-end gap-2">
 <Button variant="outline" onClick={() => setFiltersOpen(false)}>
 İptal
 </Button>
 <Button onClick={() => {
 setFiltersOpen(false);
 handleRefresh();
 }}>
 Filtreleri Uygula
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </motion.div>
 );
}