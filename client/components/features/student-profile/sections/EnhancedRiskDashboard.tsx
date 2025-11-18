/**
 * Enhanced Risk Dashboard
 * Otomatik risk hesaplama, davranış analizi, koruyucu faktörler, müdahale planları
 * NOT: Manuel risk girişi YOK - tüm risk bilgileri otomatik hesaplanır
 * 
 * ÖNEMLİ: Dashboard'daki EnhancedRiskCard buraya taşındı
 * Her bilgi tek bir yerde - Dashboard'da sadece özet risk skoru
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import UnifiedRiskSection from "./UnifiedRiskSection";
import { EnhancedRiskCard } from "@/components/features/analytics/EnhancedRiskCard";
import { Student } from "@/lib/storage";

interface EnhancedRiskDashboardProps {
  studentId: string;
  student: Student;
  onUpdate: () => void;
}

export default function EnhancedRiskDashboard({
  studentId,
  student,
  onUpdate
}: EnhancedRiskDashboardProps) {
  return (
    <div className="space-y-6">
      {/* AI Destekli Detaylı Risk Analizi */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Gelişmiş Risk Değerlendirmesi</h3>
          <span className="text-sm text-muted-foreground">AI destekli detaylı analiz</span>
        </div>
        <EnhancedRiskCard studentId={studentId} />
      </div>

      {/* Birleştirilmiş Risk Bölümleri */}
      <UnifiedRiskSection
        studentId={studentId}
        student={student}
        onUpdate={onUpdate}
      />
    </div>
  );
}
