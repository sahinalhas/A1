/**
 * Development Profile Section
 * Gelişim ve kişilik profili - sosyal-duygusal, çoklu zeka, yetenekler, motivasyon
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import StandardizedSocialEmotionalSection from "./StandardizedSocialEmotionalSection";
import KisilikProfiliSection from "./KisilikProfiliSection";
import StandardizedTalentsSection from "./StandardizedTalentsSection";
import MotivationProfileSection from "./MotivationProfileSection";
import Degerlendirme360Section from "./Degerlendirme360Section";

const GELISIM_TABS = [
  { value: "sosyal-duygusal", label: "Sosyal-Duygusal" },
  { value: "coklu-zeka", label: "Çoklu Zeka" },
  { value: "degerlendirme-360", label: "360 Derece Değerlendirme" },
  { value: "yetenekler", label: "Yetenekler & İlgiler" },
  { value: "motivasyon", label: "Motivasyon" },
] as const;

interface DevelopmentProfileSectionProps {
  studentId: string;
  multipleIntelligence: any;
  evaluations360: any[];
  onUpdate: () => void;
}

export default function DevelopmentProfileSection({
  studentId,
  multipleIntelligence,
  evaluations360,
  onUpdate
}: DevelopmentProfileSectionProps) {
  return (
    <Tabs defaultValue="sosyal-duygusal" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        {GELISIM_TABS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="sosyal-duygusal" className="space-y-4">
        <StandardizedSocialEmotionalSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="coklu-zeka" className="space-y-4">
        <KisilikProfiliSection
          studentId={studentId}
          multipleIntelligence={multipleIntelligence}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="degerlendirme-360" className="space-y-4">
        <Degerlendirme360Section
          studentId={studentId}
          evaluations360={evaluations360}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="yetenekler" className="space-y-4">
        <StandardizedTalentsSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="motivasyon" className="space-y-4">
        <MotivationProfileSection
          studentId={studentId}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}
