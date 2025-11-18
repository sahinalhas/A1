import { Student } from "@/lib/storage";
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";

interface IdentityFamilyTabProps {
  student: Student;
  onUpdate: () => void;
}

export function IdentityFamilyTab({ student, onUpdate }: IdentityFamilyTabProps) {
  return (
    <div className="space-y-4">
      <UnifiedIdentitySection student={student} onUpdate={onUpdate} />
    </div>
  );
}
