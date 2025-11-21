/**
 * Student Profile Tabs - Veri Tipi Odaklı Yapı
 * 8 Ana Sekme: Genel Bakış + 7 Veri Kategorisi
 * Profesyonel & Akademik Standartlara Uygun Organizasyon
 * 
 * Tarih: 20 Kasım 2025
 * Yapı: Demografik, Akademik, Psikososyal, Gelişimsel, Sağlık & Destek, Kariyer, İletişim
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_PROFILE_MAIN_TABS } from "@/config/tabs";
import { StudentData } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";

import { OverviewTab } from "./tabs/OverviewTab";
import { DemographicsTab } from "./tabs/DemographicsTab";
import { AcademicTab } from "./tabs/AcademicTab";
import { PsychosocialTab } from "./tabs/PsychosocialTab";
import { DevelopmentalTab } from "./tabs/DevelopmentalTab";
import { HealthSupportTab } from "./tabs/HealthSupportTab";
import { CareerTab } from "./tabs/CareerTab";
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
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
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

      {/* Genel Bakış - Dashboard */}
      <TabsContent value="overview" className="space-y-3">
        <OverviewTab
          student={student}
          studentId={studentId}
          scoresData={scoresData}
          loadingScores={loadingScores}
        />
      </TabsContent>

      {/* Öğrenci Profili */}
      <TabsContent value="demographics" className="space-y-3">
        <DemographicsTab 
          student={student} 
          studentId={studentId}
          onUpdate={onUpdate} 
        />
      </TabsContent>

      {/* Akademik Veriler */}
      <TabsContent value="academic" className="space-y-3">
        <AcademicTab studentId={studentId} onUpdate={onUpdate} />
      </TabsContent>

      {/* Psikososyal Profil */}
      <TabsContent value="psychosocial" className="space-y-3">
        <PsychosocialTab
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Gelişimsel Değerlendirmeler */}
      <TabsContent value="developmental" className="space-y-3">
        <DevelopmentalTab
          studentId={studentId}
          data={data}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Sağlık & Destek Hizmetleri */}
      <TabsContent value="health-support" className="space-y-3">
        <HealthSupportTab
          studentId={studentId}
          student={student}
          specialEducation={data.specialEducation}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* Kariyer & Yaşam Planlama */}
      <TabsContent value="career" className="space-y-3">
        <CareerTab
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </TabsContent>

      {/* İletişim Kayıtları */}
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
