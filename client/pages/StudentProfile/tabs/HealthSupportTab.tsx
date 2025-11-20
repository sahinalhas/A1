/**
 * Sağlık & Destek Hizmetleri Sekmesi
 * Veri Kategorisi: Sağlık ve Destek Sistemleri
 * İçerik: Sağlık durumu, özel eğitim desteği, risk analizi, müdahale planları
 */

import { Student } from "@/lib/storage";
import { Separator } from "@/components/atoms";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Cross, BookOpen, ShieldAlert } from "lucide-react";
import EnhancedHealthSection from "@/components/features/student-profile/sections/EnhancedHealthSection";
import OzelEgitimSection from "@/components/features/student-profile/sections/OzelEgitimSection";
import EnhancedRiskDashboard from "@/components/features/student-profile/sections/EnhancedRiskDashboard";
import { motion } from "framer-motion";

interface HealthSupportTabProps {
  studentId: string;
  student: Student;
  specialEducation?: any[];
  onUpdate: () => void;
}

export function HealthSupportTab({
  studentId,
  student,
  specialEducation,
  onUpdate,
}: HealthSupportTabProps) {
  return (
    <div className="space-y-6">
      {/* Sağlık Durumu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cross className="h-5 w-5 text-green-600" />
              Sağlık Durumu & Tıbbi Bilgiler
            </CardTitle>
            <CardDescription>
              Kronik hastalıklar, alerji, ilaç kullanımı ve acil durum bilgileri
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <EnhancedHealthSection studentId={studentId} onUpdate={onUpdate} />
        </div>
      </motion.div>

      <Separator />

      {/* Özel Eğitim Desteği */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Özel Eğitim & Destek Hizmetleri
            </CardTitle>
            <CardDescription>
              RAM raporları, BEP, özel gereksinimler ve destek programları
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <OzelEgitimSection
            studentId={studentId}
            specialEducation={specialEducation || []}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>

      <Separator />

      {/* Risk Analizi & Müdahale Planları */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Risk Analizi & Müdahale Sistemleri
            </CardTitle>
            <CardDescription>
              AI risk değerlendirmesi, koruyucu faktörler ve erken müdahale planları
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <EnhancedRiskDashboard
            studentId={studentId}
            student={student}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </div>
  );
}
