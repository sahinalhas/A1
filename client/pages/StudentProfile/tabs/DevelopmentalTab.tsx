/**
 * Gelişimsel Değerlendirmeler Sekmesi
 */

import { StudentData } from "@/hooks/features/student-profile";

interface DevelopmentalTabProps {
  studentId: string;
  data: StudentData;
  onUpdate: () => void;
}

export function DevelopmentalTab({ studentId, data, onUpdate }: DevelopmentalTabProps) {
  return (
    <div className="space-y-6">
      {/* Boş sekme */}
    </div>
  );
}
