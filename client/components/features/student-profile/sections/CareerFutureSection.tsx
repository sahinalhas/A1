/**
 * Career & Future Section
 * Kariyer analizi, yol haritası, hedefler - unified view
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import CareerGuidanceSection from "./CareerGuidanceSection";
import HedeflerPlanlamaSection from "./HedeflerPlanlamaSection";

const KARIYER_TABS = [
  { value: "rehberlik", label: "Kariyer Rehberliği" },
  { value: "hedefler", label: "Hedefler & Planlama" },
] as const;

interface CareerFutureSectionProps {
  studentId: string;
  studentName: string;
  onUpdate: () => void;
}

export default function CareerFutureSection({
  studentId,
  studentName,
  onUpdate
}: CareerFutureSectionProps) {
  return (
    <Tabs defaultValue="rehberlik" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        {KARIYER_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="rehberlik" className="space-y-4">
        <CareerGuidanceSection
          studentId={studentId}
          studentName={studentName}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="hedefler" className="space-y-4">
        <HedeflerPlanlamaSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}