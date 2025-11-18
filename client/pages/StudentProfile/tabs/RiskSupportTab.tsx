import { Student } from "@/lib/storage";
import EnhancedRiskDashboard from "@/components/features/student-profile/sections/EnhancedRiskDashboard";

interface RiskSupportTabProps {
  studentId: string;
  student: Student;
  onUpdate: () => void;
}

export function RiskSupportTab({
  studentId,
  student,
  onUpdate,
}: RiskSupportTabProps) {
  return (
    <div className="space-y-4">
      <EnhancedRiskDashboard
        studentId={studentId}
        student={student}
        onUpdate={onUpdate}
      />
    </div>
  );
}
