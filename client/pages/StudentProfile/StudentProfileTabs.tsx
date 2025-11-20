/**
 * Student Profile Tabs - Optimized Structure
 * 6 Ana Sekme - Yeni Mantıksal Yapı
 * Bilgi Tekrarı YOK - Rehber Öğretmen İş Akışına Göre Optimize
 * 
 * Tarih: 30 Ekim 2025
 * Optimizasyon: 8 sekme → 6 sekme (%25 azalma)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_PROFILE_MAIN_TABS } from "@/config/tabs";
import { StudentData } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";

import { OverviewTab } from "./tabs/OverviewTab";
import { IdentityFamilyTab } from "./tabs/IdentityFamilyTab";
import { AcademicsTab } from "./tabs/AcademicsTab";
import { WellbeingTab } from "./tabs/WellbeingTab";
import { RiskSupportTab } from "./tabs/RiskSupportTab";
import { CommunicationTab } from "./tabs/CommunicationTab";

interface StudentProfileTabsProps {
 student: Student;
 studentId: string;
 data: StudentData;
 onUpdate: () => void;
 scoresData?: any;
 loadingScores?: boolean;
}

export function StudentProfileTabs({
 student,
 studentId,
 data,
 onUpdate,
 scoresData,
 loadingScores,
}: StudentProfileTabsProps) {
 const studentName = `${student.name} ${student.surname}`;

 return (
 <Tabs defaultValue="overview" className="space-y-4">
 <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 {STUDENT_PROFILE_MAIN_TABS.map((tabConfig) => {
 const Icon = tabConfig.icon;
 return (
 <TabsTrigger
 key={tabConfig.value}
 value={tabConfig.value}
 className="gap-2"
 title={tabConfig.description}
 >
 {Icon && <Icon className="h-4 w-4" />}
 <span className="hidden sm:inline">{tabConfig.label}</span>
 </TabsTrigger>
 );
 })}
 </TabsList>

 <TabsContent value="overview" className="space-y-3">
 <OverviewTab
 student={student}
 studentId={studentId}
 scoresData={scoresData}
 loadingScores={loadingScores}
 />
 </TabsContent>

 <TabsContent value="identity-family" className="space-y-3">
 <IdentityFamilyTab student={student} onUpdate={onUpdate} />
 </TabsContent>

 <TabsContent value="academics" className="space-y-3">
 <AcademicsTab studentId={studentId} onUpdate={onUpdate} />
 </TabsContent>

 <TabsContent value="wellbeing" className="space-y-3">
 <WellbeingTab
 studentId={studentId}
 studentName={studentName}
 data={data}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="risk-support" className="space-y-3">
 <RiskSupportTab
 studentId={studentId}
 student={student}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="communication" className="space-y-3">
 <CommunicationTab
 studentId={studentId}
 studentName={studentName}
 onUpdate={onUpdate}
 />
 </TabsContent>
 </Tabs>
 );
}