/**
 * Öğrenci Profili Sekmesi
 * Veri Kategorisi: Demografik Veriler ve Sağlık Profili
 * İçerik: Kimlik bilgileri, iletişim bilgileri, aile yapısı, standartlaştırılmış sağlık profili
 */

import { Student } from "@/lib/storage";
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";
import StandardizedHealthSection from "@/components/features/student-profile/sections/StandardizedHealthSection";
import StandardizedTalentsSection from "@/components/features/student-profile/sections/StandardizedTalentsSection";
import { Separator } from "@/components/atoms";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DemographicsTabProps {
  student: Student;
  studentId: string;
  onUpdate: () => void;
}

export function DemographicsTab({ student, studentId, onUpdate }: DemographicsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <UnifiedIdentitySection student={student} onUpdate={onUpdate} />
      
      <Separator />
      
      <StandardizedHealthSection 
        studentId={studentId}
        onUpdate={onUpdate}
      />

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="border-2 border-amber-100 bg-gradient-to-br from-amber-50/50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Yetenek & İlgi Profili
            </CardTitle>
            <CardDescription>
              Yaratıcı yetenekler, fiziksel beceriler, ilgi alanları ve kulüp aktiviteleri
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="mt-4">
          <StandardizedTalentsSection
            studentId={studentId}
            onUpdate={onUpdate}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
