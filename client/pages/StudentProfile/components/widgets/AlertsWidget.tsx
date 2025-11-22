import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { AlertCircle, CheckCircle } from "lucide-react";
import { earlyWarningApi } from "@/lib/api/endpoints/early-warning.api";
import { Button } from "@/components/atoms/Button";

interface AlertsWidgetProps {
  studentId: string;
}

export function AlertsWidget({ studentId }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [studentId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await earlyWarningApi.getAlertsByStudent(studentId);
      const activeAlerts = Array.isArray(data) 
        ? data.filter(a => a.status === 'AÇIK' || a.status === 'İNCELENİYOR')
        : [];
      setAlerts(activeAlerts.slice(0, 3));
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (severity?.toLowerCase()) {
      case 'high': case 'critical': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Aktif Uyarılar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Badge variant={getSeverityColor(alert.severity)} className="text-xs mt-0.5">
                  {alert.type || 'Uyarı'}
                </Badge>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {alert.message || alert.description || 'Detay yok'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Aktif uyarı yok</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
