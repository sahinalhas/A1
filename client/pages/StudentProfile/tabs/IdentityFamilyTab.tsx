import { Student } from "@/lib/storage";
import UnifiedIdentitySection from "@/components/features/student-profile/sections/UnifiedIdentitySection";
import EnhancedHealthSection from "@/components/features/student-profile/sections/EnhancedHealthSection";
import OzelEgitimSection from "@/components/features/student-profile/sections/OzelEgitimSection";
import { Separator } from "@/components/atoms";
import { motion } from "framer-motion";

interface IdentityFamilyTabProps {
 student: Student;
 studentId: string;
 specialEducation?: any[];
 onUpdate: () => void;
}

export function IdentityFamilyTab({ student, studentId, specialEducation, onUpdate }: IdentityFamilyTabProps) {
 return (
 <div className="space-y-6">
 <UnifiedIdentitySection student={student} onUpdate={onUpdate} />
 
 <Separator />
 
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
 Sağlık Bilgileri
 </h3>
 <EnhancedHealthSection studentId={studentId} onUpdate={onUpdate} />
 </motion.div>
 
 <Separator />
 
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 >
 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
 Özel Eğitim & Destek
 </h3>
 <OzelEgitimSection
 studentId={studentId}
 specialEducation={specialEducation || []}
 onUpdate={onUpdate}
 />
 </motion.div>
 </div>
 );
}
