import SmartAcademicDashboard from "@/components/features/student-profile/sections/SmartAcademicDashboard";

interface AcademicsTabProps {
  studentId: string;
  onUpdate: () => void;
}

export function AcademicsTab({ studentId, onUpdate }: AcademicsTabProps) {
  return (
    <div className="space-y-4">
      <SmartAcademicDashboard studentId={studentId} onUpdate={onUpdate} />
    </div>
  );
}
