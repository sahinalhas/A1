/**
 * Unified Risk Section
 * Tüm risk bilgilerini tek bir yerde gösterir
 */

import { Card, CardContent } from "@/components/organisms/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { useUnifiedRisk } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";
import RiskDegerlendirmeSection from "./RiskDegerlendirmeSection";
import DavranisTakibiSection from "./DavranisTakibiSection";
import DisciplineSection from "./DisciplineSection";
import RiskProtectiveProfileSection from "./RiskProtectiveProfileSection";

interface UnifiedRiskSectionProps {
 studentId: string;
 student: Student;
 onUpdate?: () => void;
}

export default function UnifiedRiskSection({ studentId, student, onUpdate }: UnifiedRiskSectionProps) {
 const { data: riskData, isLoading } = useUnifiedRisk(studentId, student);

 if (isLoading) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="text-center text-muted-foreground">Risk bilgileri yükleniyor...</div>
 </CardContent>
 </Card>
 );
 }

 if (!riskData) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="text-center text-muted-foreground">Risk bilgisi bulunamadı</div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Tabs defaultValue="degerlendirme" className="space-y-6">
 <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 <TabsTrigger value="degerlendirme" className="gap-2">
 <AlertTriangle className="h-4 w-4" />
 <span className="hidden sm:inline">Risk Değerlendirme</span>
 </TabsTrigger>
 <TabsTrigger value="davranis" className="gap-2">
 <Shield className="h-4 w-4" />
 <span className="hidden sm:inline">Davranış Takibi</span>
 </TabsTrigger>
 <TabsTrigger value="koruyucu" className="gap-2">
 <TrendingUp className="h-4 w-4" />
 <span className="hidden sm:inline">Koruyucu Faktörler</span>
 </TabsTrigger>
 </TabsList>

 <TabsContent value="degerlendirme">
 <RiskDegerlendirmeSection
 studentId={studentId}
 riskFactors={riskData.riskFactors as any}
 onUpdate={onUpdate || (() => {})}
 />
 </TabsContent>

 <TabsContent value="davranis" className="space-y-6">
 <DisciplineSection
 student={student}
 onUpdate={onUpdate || (() => {})}
 />
 <DavranisTakibiSection
 studentId={studentId}
 behaviorIncidents={[]} // Will be loaded inside the component
 onUpdate={onUpdate || (() => {})}
 />
 </TabsContent>

 <TabsContent value="koruyucu">
 <RiskProtectiveProfileSection
 studentId={studentId}
 onUpdate={onUpdate || (() => {})}
 />
 </TabsContent>
 </Tabs>
 );
}
