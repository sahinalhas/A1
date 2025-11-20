import DevelopmentProfileSection from "@/components/features/student-profile/sections/DevelopmentProfileSection";
import { SocialNetworkMap } from "@/components/features/social/SocialNetworkMap";
import { StudentData } from "@/hooks/features/student-profile";
import { Separator } from "@/components/atoms";
import { motion } from "framer-motion";

interface WellbeingTabProps {
 studentId: string;
 data: StudentData;
 onUpdate: () => void;
}

export function WellbeingTab({
 studentId,
 data,
 onUpdate,
}: WellbeingTabProps) {
 return (
 <div className="space-y-6 page-transition">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
 Gelişim Profili
 </h3>
 <p className="text-sm text-muted-foreground mb-4">
 Çoklu zeka, öğrenme stilleri, sosyal-duygusal beceriler ve kişilik özellikleri
 </p>
 <DevelopmentProfileSection
 studentId={studentId}
 multipleIntelligence={data.multipleIntelligence}
 evaluations360={data.evaluations360}
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
 <p className="text-sm text-muted-foreground mb-4">
 Öğrencinin sosyal çevresi, ilişki ağı ve destek sistemleri
 </p>
 <SocialNetworkMap studentId={studentId} />
 </motion.div>
 </div>
 );
}
