import CommunicationCenter from "@/components/features/student-profile/sections/CommunicationCenter";
import CareerFutureSection from "@/components/features/student-profile/sections/CareerFutureSection";
import { Separator } from "@/components/atoms";
import { motion } from "framer-motion";

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
 <div className="space-y-6">
 <CommunicationCenter
 studentId={studentId}
 studentName={studentName}
 onUpdate={onUpdate}
 />
 
 <Separator />
 
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 >
 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
 Kariyer & Gelecek Hedefleri
 </h3>
 <CareerFutureSection
 studentId={studentId}
 studentName={studentName}
 onUpdate={onUpdate}
 />
 </motion.div>
 </div>
 );
}
