import CareerFutureSection from "@/components/features/student-profile/sections/CareerFutureSection";
import { motion } from "framer-motion";

interface CareerGoalsTabProps {
 studentId: string;
 studentName: string;
 onUpdate: () => void;
}

export function CareerGoalsTab({
 studentId,
 studentName,
 onUpdate,
}: CareerGoalsTabProps) {
 return (
 <div className="space-y-6 page-transition">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <div className="mb-4">
 <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
 Kariyer & Gelecek Hedefleri
 </h3>
 <p className="text-sm text-muted-foreground">
 Öğrencinin kariyer planlaması, meslek seçimi, yetkinlikleri ve gelecek hedefleri
 </p>
 </div>
 <CareerFutureSection
 studentId={studentId}
 studentName={studentName}
 onUpdate={onUpdate}
 />
 </motion.div>
 </div>
 );
}
