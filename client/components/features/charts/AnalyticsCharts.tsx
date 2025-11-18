import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Progress } from "@/components/atoms/Progress";
import { AlertTriangle, TrendingUp, TrendingDown, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHART_COLORS, RISK_COLORS, PERFORMANCE_COLORS } from "@/lib/config/theme.config";
import { optimizeChartData } from "@/lib/analytics-cache";

// =================== TİP TANIMLARI ===================

interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
  trend?: "up" | "down" | "stable";
}

interface TrendData {
  date: string;
  value: number;
  previous?: number;
  target?: number;
}

interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  target?: number;
}

// =================== TEMEL GRAFİK BİLEŞENLERİ ===================

export function SuccessMetricCard({ 
  title, 
  value, 
  total, 
  trend, 
  icon: Icon,
  description,
  showAsPercentage = true
}: {
  title: string;
  value: number;
  total?: number;
  trend?: "up" | "down" | "stable";
  icon?: any;
  description?: string;
  showAsPercentage?: boolean;
}) {
  const percentage = total ? Math.round((value / total) * 100) : value;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {total ? `${value}/${total}` : showAsPercentage ? `%${percentage}` : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            trend === "up" ? "text-green-600" : 
            trend === "down" ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : null}
            {trend === "up" ? "Yükseliş" : trend === "down" ? "Düşüş" : "Sabit"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const RiskDistributionChart = React.memo(({ data }: { data: ChartDataPoint[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${value} öğrenci`, 'Sayı']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export const PerformanceTrendChart = React.memo(({ 
  data, 
  title = "Performans Trendi",
  dataKey = "value",
  color = CHART_COLORS.primary 
}: { 
  data: TrendData[];
  title?: string;
  dataKey?: string;
  color?: string;
}) => {
  const optimizedData = React.useMemo(() => 
    optimizeChartData(data, 100)
  , [data]);

  const hasTarget = React.useMemo(() => 
    optimizedData.some(d => d.target)
  , [optimizedData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={optimizedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [value.toFixed(2), 'Değer']}
              labelFormatter={(label) => `Tarih: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              isAnimationActive={false}
            />
            {hasTarget && (
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={CHART_COLORS.muted}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export const ClassComparisonChart = React.memo(({ data }: { data: ComparisonData[] }) => {
  const optimizedData = React.useMemo(() => 
    optimizeChartData(data, 50)
  , [data]);

  const hasTarget = React.useMemo(() => 
    optimizedData.some(d => d.target)
  , [optimizedData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sınıf Karşılaştırması
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={optimizedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill={CHART_COLORS.primary} name="Mevcut Dönem" isAnimationActive={false} />
            <Bar dataKey="previous" fill={CHART_COLORS.muted} name="Önceki Dönem" isAnimationActive={false} />
            {hasTarget && (
              <Bar dataKey="target" fill={CHART_COLORS.success} name="Hedef" isAnimationActive={false} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export function SuccessPredictionGauge({ 
  value, 
  studentName,
  details 
}: { 
  value: number;
  studentName: string;
  details?: {
    factors: string[];
    recommendations: string[];
  };
}) {
  const percentage = Math.round(value * 100);
  const gaugeData = [{ value: percentage, fill: getSuccessColor(value) }];
  
  function getSuccessColor(score: number): string {
    if (score >= 0.8) return CHART_COLORS.success;
    if (score >= 0.6) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
  }

  function getSuccessLabel(score: number): string {
    if (score >= 0.8) return "Yüksek Başarı";
    if (score >= 0.6) return "Orta Başarı";
    if (score >= 0.4) return "Risk Altında";
    return "Yüksek Risk";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Başarı Tahmini: {studentName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={90}
            >
              <RadialBar 
                dataKey="value" 
                cornerRadius={10}
                fill={getSuccessColor(value)}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <div className="text-3xl font-bold">{percentage}%</div>
            <div className="text-sm text-muted-foreground">{getSuccessLabel(value)}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge 
            variant={value >= 0.6 ? "default" : "destructive"}
            className="w-full justify-center"
          >
            {getSuccessLabel(value)}
          </Badge>
          
          {details && (
            <div className="mt-4 space-y-2">
              {details.factors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Güçlü Yönler:</h4>
                  <div className="flex flex-wrap gap-1">
                    {details.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {details.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Öneriler:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {details.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const ProgressTimeline = React.memo(({ 
  data,
  title = "İlerleme Zaman Çizelgesi",
  categories = ["academic", "attendance", "study"]
}: {
  data: Array<{
    date: string;
    value: number;
    type: string;
  }>;
  title?: string;
  categories?: string[];
}) => {
  const categoryColors = {
    academic: CHART_COLORS.primary,
    attendance: CHART_COLORS.success,
    study: CHART_COLORS.warning,
    wellbeing: CHART_COLORS.info,
  };

  const categoryLabels = {
    academic: "Akademik",
    attendance: "Devam",
    study: "Çalışma",
    wellbeing: "Genel Durum",
  };

  const groupedData = React.useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const existing = acc.find(d => d.date === item.date);
      if (existing) {
        existing[item.type] = item.value;
      } else {
        acc.push({
          date: item.date,
          [item.type]: item.value,
        });
      }
      return acc;
    }, [] as any[]);
    return optimizeChartData(grouped, 100);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: any) => [
                `${(value * 100).toFixed(1)}%`, 
                categoryLabels[name as keyof typeof categoryLabels] || name
              ]}
            />
            <Legend />
            {categories.map((category) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stackId="1"
                stroke={categoryColors[category as keyof typeof categoryColors]}
                fill={categoryColors[category as keyof typeof categoryColors]}
                fillOpacity={0.6}
                name={categoryLabels[category as keyof typeof categoryLabels]}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export function EarlyWarningIndicator({ 
  warnings,
  maxDisplay = 5 
}: { 
  warnings: Array<{
    studentName: string;
    warningType: string;
    severity: string;
    message: string;
    priority: number;
  }>;
  maxDisplay?: number;
}) {
  const severityColors = {
    "düşük": "bg-blue-100 text-blue-800",
    "orta": "bg-yellow-100 text-yellow-800", 
    "yüksek": "bg-orange-100 text-orange-800",
    "kritik": "bg-red-100 text-red-800",
  };

  const typeIcons = {
    attendance: "",
    academic: "",
    behavioral: "",
    wellbeing: "💝",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Erken Uyarı Sistemi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warnings.slice(0, maxDisplay).map((warning, index) => (
            <div 
              key={index}
              className="flex items-start justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {typeIcons[warning.warningType as keyof typeof typeIcons]}
                  </span>
                  <span className="font-medium text-sm">{warning.studentName}</span>
                  <Badge 
                    className={cn(
                      "text-xs",
                      severityColors[warning.severity as keyof typeof severityColors]
                    )}
                  >
                    {warning.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{warning.message}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Öncelik: {warning.priority}
              </div>
            </div>
          ))}
          
          {warnings.length > maxDisplay && (
            <div className="text-center pt-2">
              <Badge variant="outline">
                +{warnings.length - maxDisplay} daha fazla uyarı
              </Badge>
            </div>
          )}
          
          {warnings.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aktif uyarı bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =================== YARDIMCI FONKSİYONLAR ===================

export function formatPercentage(value: number): string {
  return `%${Math.round(value * 100)}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR');
}

export function getPerformanceColor(value: number): string {
  if (value >= 0.8) return CHART_COLORS.success;
  if (value >= 0.6) return CHART_COLORS.warning;
  return CHART_COLORS.danger;
}

export function getGradeLabel(score: number): string {
  if (score >= 0.9) return "Mükemmel";
  if (score >= 0.8) return "İyi";
  if (score >= 0.7) return "Orta";
  if (score >= 0.6) return "Geçer";
  return "Yetersiz";
}