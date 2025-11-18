import EnhancedHealthSection from "@/components/features/student-profile/sections/EnhancedHealthSection";
import OzelEgitimSection from "@/components/features/student-profile/sections/OzelEgitimSection";
import DevelopmentProfileSection from "@/components/features/student-profile/sections/DevelopmentProfileSection";
import CareerFutureSection from "@/components/features/student-profile/sections/CareerFutureSection";
import { SocialNetworkMap } from "@/components/features/social/SocialNetworkMap";
import { StudentData } from "@/hooks/features/student-profile";
import { Separator } from "@/components/atoms";
import { motion } from "framer-motion";

interface WellbeingTabProps {
  studentId: string;
  studentName: string;
  data: StudentData;
  onUpdate: () => void;
}

export function WellbeingTab({
  studentId,
  studentName,
  data,
  onUpdate,
}: WellbeingTabProps) {
  return (
    <div className="space-y-6 page-transition">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Sağlık Bilgileri
        </h3>
        <EnhancedHealthSection studentId={studentId} onUpdate={onUpdate} />
      </div>

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Özel Eğitim & Destek
        </h3>
        <OzelEgitimSection
          studentId={studentId}
          specialEducation={data.specialEducation || []}
          onUpdate={onUpdate}
        />
      </motion.div>

      <Separator />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Sosyal Ağ Analizi
        </h3>
        <SocialNetworkMap studentId={studentId} />
      </motion.div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Gelişim Profili
        </h3>
        <DevelopmentProfileSection
          studentId={studentId}
          multipleIntelligence={data.multipleIntelligence}
          evaluations360={data.evaluations360}
          onUpdate={onUpdate}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Kariyer & Gelecek Planlama
        </h3>
        <CareerFutureSection
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
}
