/**
 * Smart Academic Dashboard
 * Akademik performans özeti - mevcut akademik sekmelerini organize eder
 * 
 * ÖNEMLİ: Dashboard'daki PersonalizedLearningCard buraya taşındı
 * Her bilgi tek bir yerde - Dashboard'da sadece özet akademik skoru
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_ACADEMIC_TABS } from "@/config/tabs";
import StandardizedAcademicSection from "./StandardizedAcademicSection";
import StudentExamResultsSection from "./StudentExamResultsSection";
import CalismaProgramiSection from "./CalismaProgramiSection";
import IlerlemeTakibiSection from "./IlerlemeTakibiSection";
import AnketlerSection from "./AnketlerSection";
import { PersonalizedLearningCard } from "@/components/features/learning/PersonalizedLearningCard";

interface SmartAcademicDashboardProps {
  studentId: string;
  onUpdate: () => void;
}

export default function SmartAcademicDashboard({
  studentId,
  onUpdate
}: SmartAcademicDashboardProps) {
  return (
    <div className="space-y-6">
      {/* AI Destekli Kişiselleştirilmiş Öğrenme Planı */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Kişiselleştirilmiş Öğrenme Stratejileri</h3>
          <span className="text-sm text-muted-foreground">AI ile özel öğrenme önerileri</span>
        </div>
        <PersonalizedLearningCard studentId={studentId} />
      </div>

      {/* Akademik Alt Sekmeler */}
      <Tabs defaultValue="performans" className="space-y-4">
        <TabsList variant="underline" className="grid w-full grid-cols-2 md:grid-cols-5">
          {STUDENT_ACADEMIC_TABS.map((tabConfig) => (
            <TabsTrigger 
              key={tabConfig.value} 
              value={tabConfig.value}
              icon={tabConfig.icon}
              variant="underline"
            >
              {tabConfig.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="performans" className="space-y-4">
          <StandardizedAcademicSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="sinavlar" className="space-y-4">
          <StudentExamResultsSection studentId={studentId} />
        </TabsContent>

        <TabsContent value="calisma-programi" className="space-y-4">
          <CalismaProgramiSection studentId={studentId} />
        </TabsContent>

        <TabsContent value="ilerleme" className="space-y-4">
          <IlerlemeTakibiSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="anketler" className="space-y-4">
          <AnketlerSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
