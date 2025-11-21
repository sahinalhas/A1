/**
 * Sağlık & Destek Hizmetleri Sekmesi
 * Not: İçerik temizlendi
 */

import { Card, CardContent } from "@/components/organisms/Card";
import { Info } from "lucide-react";

interface HealthSupportTabProps {
  studentId: string;
  student: any;
  onUpdate: () => void;
}

export function HealthSupportTab({
  studentId,
  student,
  onUpdate,
}: HealthSupportTabProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Bu sekme şu anda içerik barındırmamaktadır.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
