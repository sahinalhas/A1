import WeeklySchedule from "@/components/features/student-profile/WeeklySchedule";
import TopicPlanner from "@/components/features/student-profile/TopicPlanner";

interface CalismaProgramiSectionProps {
  studentId: string;
}

export default function CalismaProgramiSection({ studentId }: CalismaProgramiSectionProps) {
  return (
    <div className="grid gap-4">
      <WeeklySchedule sid={studentId} />
      <TopicPlanner sid={studentId} />
    </div>
  );
}
