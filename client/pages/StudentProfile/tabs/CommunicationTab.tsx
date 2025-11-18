import CommunicationCenter from "@/components/features/student-profile/sections/CommunicationCenter";

interface CommunicationTabProps {
  studentId: string;
  studentName: string;
  onUpdate: () => void;
}

export function CommunicationTab({
  studentId,
  studentName,
  onUpdate,
}: CommunicationTabProps) {
  return (
    <div className="space-y-4">
      <CommunicationCenter
        studentId={studentId}
        studentName={studentName}
        onUpdate={onUpdate}
      />
    </div>
  );
}
