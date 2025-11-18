/**
 * Unified Risk Section
 * Tüm risk bilgilerini tek bir yerde gösterir
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { Progress } from "@/components/atoms/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useUnifiedRisk } from "@/hooks/features/student-profile";
import { Student } from "@/lib/storage";
import RiskDegerlendirmeSection from "./RiskDegerlendirmeSection";
import DavranisTakibiSection from "./DavranisTakibiSection";
import DisciplineSection from "./DisciplineSection";
import RiskProtectiveProfileSection from "./RiskProtectiveProfileSection";

interface UnifiedRiskSectionProps {
  studentId: string;
  student: Student;
  onUpdate?: () => void;
}

export default function UnifiedRiskSection({ studentId, student, onUpdate }: UnifiedRiskSectionProps) {
  const { data: riskData, isLoading } = useUnifiedRisk(studentId, student);

  const getRiskColor = (category: string) => {
    switch (category) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-green-100 text-green-700 border-green-300";
    }
  };

  const getRiskLabel = (category: string) => {
    switch (category) {
      case "critical": return "KRİTİK RİSK";
      case "high": return "YÜKSEK RİSK";
      case "medium": return "ORTA RİSK";
      default: return "DÜŞÜK RİSK";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Risk bilgileri yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  if (!riskData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Risk bilgisi bulunamadı</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detaylı Risk Sekmeleri */}
      <Tabs defaultValue="degerlendirme" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="degerlendirme">
            Risk Değerlendirme
          </TabsTrigger>
          <TabsTrigger value="davranis">
            Davranış Takibi
          </TabsTrigger>
          <TabsTrigger value="koruyucu">
            Koruyucu Faktörler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="degerlendirme">
          <RiskDegerlendirmeSection
            studentId={studentId}
            riskFactors={riskData.riskFactors as any}
            onUpdate={onUpdate || (() => {})}
          />
        </TabsContent>

        <TabsContent value="davranis" className="space-y-6">
          <DisciplineSection
            student={student}
            onUpdate={onUpdate || (() => {})}
          />
          <DavranisTakibiSection
            studentId={studentId}
            behaviorIncidents={[]} // Will be loaded inside the component
            onUpdate={onUpdate || (() => {})}
          />
        </TabsContent>

        <TabsContent value="koruyucu">
          <RiskProtectiveProfileSection
            studentId={studentId}
            onUpdate={onUpdate || (() => {})}
          />
        </TabsContent>
      </Tabs>

      {/* Risk Özeti */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Birleştirilmiş Risk Değerlendirmesi
              </CardTitle>
              <CardDescription>
                Tüm risk kaynaklarından birleştirilmiş analiz
              </CardDescription>
            </div>
            <Badge className={getRiskColor(riskData.riskCategory)}>
              {getRiskLabel(riskData.riskCategory)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Risk Skoru */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Birleşik Risk Skoru</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(riskData.enhancedRisk?.trend)}
                <span className="text-2xl font-bold">{riskData.unifiedRiskScore}/100</span>
              </div>
            </div>
            <Progress 
              value={riskData.unifiedRiskScore} 
              className={`h-3 ${
                riskData.unifiedRiskScore >= 80 ? "bg-red-200" :
                riskData.unifiedRiskScore >= 60 ? "bg-orange-200" :
                riskData.unifiedRiskScore >= 35 ? "bg-yellow-200" :
                "bg-green-200"
              }`}
            />
          </div>

          {/* Müdahale Önceliği */}
          <Alert variant={getPriorityColor(riskData.interventionPriority) as any}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Müdahale Önceliği:</strong> {getRiskLabel(riskData.interventionPriority)}
              {riskData.interventionPriority === "critical" && (
                <span className="ml-2">- Acil müdahale gerekli!</span>
              )}
              {riskData.interventionPriority === "high" && (
                <span className="ml-2">- Yakın takip ve müdahale önerilir</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Risk Faktörleri Özeti */}
          {riskData.riskFactors && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Akademik</div>
                <div className="text-sm font-medium">{riskData.riskFactors.academicRiskLevel}</div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Davranışsal</div>
                <div className="text-sm font-medium">{riskData.riskFactors.behavioralRiskLevel}</div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Devamsızlık</div>
                <div className="text-sm font-medium">{riskData.riskFactors.attendanceRiskLevel}</div>
              </div>
              <div className="border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Sosyal-Duygusal</div>
                <div className="text-sm font-medium">{riskData.riskFactors.socialEmotionalRiskLevel}</div>
              </div>
            </div>
          )}

          {/* AI Risk Faktörleri */}
          {riskData.enhancedRisk?.factors && riskData.enhancedRisk.factors.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">AI Tespit Edilen Risk Faktörleri:</div>
              <div className="space-y-1">
                {riskData.enhancedRisk.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant={
                      factor.impact === "high" ? "destructive" :
                      factor.impact === "medium" ? "default" : "secondary"
                    } className="text-xs shrink-0">
                      {factor.impact === "high" ? "Yüksek" :
                       factor.impact === "medium" ? "Orta" : "Düşük"}
                    </Badge>
                    <span className="text-gray-700">{factor.factor}: {factor.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Bu risk skoru, manuel değerlendirme, risk faktör analizi, AI tabanlı değerlendirme ve 
              koruyucu faktör profilinden birleştirilmiştir. Detaylı bilgi için alt sekmelere bakınız.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
