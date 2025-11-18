import { Student } from "@/lib/storage";
import { ModernDashboard } from "../components/ModernDashboard";
import { ProfileCompletenessIndicator } from "@/components/features/student-profile/ProfileCompletenessIndicator";
import { PersonalizedLearningCard } from "@/components/features/learning/PersonalizedLearningCard";
import { motion } from "framer-motion";

interface OverviewTabProps {
  student: Student;
  studentId: string;
  scoresData?: any;
  loadingScores?: boolean;
}

export function OverviewTab({
  student,
  studentId,
  scoresData,
  loadingScores,
}: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Profil Bütünlüğü</h3>
          <span className="text-xs text-muted-foreground">
            Eksik alanlar ve veri kalitesi
          </span>
        </div>
        <ProfileCompletenessIndicator
          overall={scoresData?.completeness?.overall ?? 0}
          sections={scoresData?.completeness?.sections || {}}
          eksikAlanlar={scoresData?.completeness?.eksikAlanlar || []}
        />
      </div>

      <ModernDashboard
        student={student}
        studentId={studentId}
        scoresData={scoresData}
        loadingScores={loadingScores}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PersonalizedLearningCard studentId={studentId} />
      </motion.div>
    </div>
  );
}
