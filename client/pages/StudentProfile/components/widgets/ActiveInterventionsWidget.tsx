import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Target, CheckCircle } from "lucide-react";
import { getInterventionsByStudent } from "@/lib/api/endpoints/academic.api";

interface ActiveInterventionsWidgetProps {
  studentId: string;
}

export function ActiveInterventionsWidget({ studentId }: ActiveInterventionsWidgetProps) {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterventions();
  }, [studentId]);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const data = await getInterventionsByStudent(studentId);
      const active = Array.isArray(data) 
        ? data.filter(i => i.status === 'Devam' || i.status === 'Planlandı')
        : [];
      setInterventions(active.slice(0, 3));
    } catch (error) {
      console.error('Error loading interventions:', error);
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Aktif Müdahaleler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : interventions.length > 0 ? (
          <div className="space-y-2">
            {interventions.map((intervention, idx) => (
              <div key={idx} className="text-xs">
                <div className="font-medium text-foreground">
                  {intervention.type || intervention.title || 'Müdahale'}
                </div>
                <div className="text-muted-foreground">
                  {intervention.goal || intervention.description || ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Aktif müdahale yok</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
