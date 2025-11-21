/**
 * Communication Center
 * Tüm görüşme ve iletişim kayıtlarını tek merkezde toplar
 * NOT: GorusmelerSection, VeliGorusmeleriSection ve diğer iletişim component'lerini birleştirir
 * 
 * ÖNEMLİ: Dashboard'daki ProfileUpdateTimeline buraya taşındı
 * Her bilgi tek bir yerde - Dashboard'da sadece özet bilgi
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { STUDENT_COMMUNICATION_TABS } from "@/config/tabs";
import UnifiedMeetingsSection from "./UnifiedMeetingsSection";
import EvZiyaretleriSection from "./EvZiyaretleriSection";
import { useState } from "react";

interface CommunicationCenterProps {
 studentId: string;
 studentName?: string;
 onUpdate: () => void;
}

export default function CommunicationCenter({
 studentId,
 studentName ="Öğrenci",
 onUpdate
}: CommunicationCenterProps) {
 const [homeVisitsData, setHomeVisitsData] = useState<any[]>([]);

 return (
 <div className="space-y-6">
 <Tabs defaultValue="tum-gorusmeler" className="space-y-4">
 <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-border/40 shadow-sm">
 {STUDENT_COMMUNICATION_TABS.map((tabConfig) => {
 const Icon = tabConfig.icon;
 return (
 <TabsTrigger 
 key={tabConfig.value} 
 value={tabConfig.value}
 className="gap-2"
 >
 {Icon && <Icon className="h-4 w-4" />}
 <span className="hidden sm:inline">{tabConfig.label}</span>
 </TabsTrigger>
 );
 })}
 </TabsList>

 <TabsContent value="tum-gorusmeler" className="space-y-4">
 <UnifiedMeetingsSection
 studentId={studentId}
 onUpdate={onUpdate}
 />
 </TabsContent>

 <TabsContent value="ev-ziyaretleri" className="space-y-4">
 <EvZiyaretleriSection
 studentId={studentId}
 homeVisits={homeVisitsData}
 onUpdate={onUpdate}
 />
 </TabsContent>
 </Tabs>
 </div>
 );
}
