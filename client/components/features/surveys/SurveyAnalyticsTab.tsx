import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  CheckCircle,
  FileText
} from "lucide-react";
import { SurveyDistribution } from "@/lib/survey-types";
import QuestionAnalyticsCard from "./analytics/QuestionAnalyticsCard";

interface SurveyAnalyticsTabProps {
  distributions: SurveyDistribution[];
}

interface AnalyticsData {
  distributionInfo: {
    id: string;
    title: string;
    templateTitle: string;
    status: string;
    totalTargets: number;
    totalResponses: number;
    responseRate: string;
  };
  overallStats: {
    averageCompletionTime: string;
    mostSkippedQuestion: any;
    satisfactionScore: string;
  };
  questionAnalytics: any[];
}

interface DistributionStats {
  totalResponses: number;
  completionRate: string;
  responsesByDay: { [key: string]: number };
  demographicBreakdown: any;
  submissionTypes: { [key: string]: number };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-100 text-green-700">Aktif</Badge>;
    case 'CLOSED':
      return <Badge className="bg-blue-100 text-blue-700">Kapandı</Badge>;
    case 'DRAFT':
      return <Badge variant="outline">Taslak</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export default function SurveyAnalyticsTab({ distributions }: SurveyAnalyticsTabProps) {
  const [selectedDistribution, setSelectedDistribution] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null);
  const [loading, setLoading] = useState(false);

  const activeDistributions = distributions.filter(d => 
    d.status === 'ACTIVE' || d.status === 'CLOSED'
  );

  useEffect(() => {
    if (selectedDistribution) {
      loadAnalytics();
    }
  }, [selectedDistribution]);

  const loadAnalytics = async () => {
    if (!selectedDistribution) return;

    try {
      setLoading(true);
      
      const analyticsResponse = await fetch(`/api/survey-analytics/${selectedDistribution}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsData(analyticsData);
      }

      const statsResponse = await fetch(`/api/survey-statistics/${selectedDistribution}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDistributionStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setLoading(false);
    }
  };

  if (activeDistributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anket Analizleri</CardTitle>
          <CardDescription>
            Analiz yapabilmek için aktif veya tamamlanmış anket dağıtımlarınız olmalı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart className="mx-auto h-12 w-12 mb-4" />
            <p>Henüz analiz edilecek anket dağıtımı bulunmuyor</p>
            <p className="text-sm">Önce anket dağıtımları oluşturun ve yanıtları toplayın</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Anket Analizi Seçimi</CardTitle>
          <CardDescription>
            Analiz yapmak istediğiniz anket dağıtımını seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDistribution} onValueChange={setSelectedDistribution}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Anket dağıtımı seçin..." />
            </SelectTrigger>
            <SelectContent>
              {activeDistributions.map((distribution) => (
                <SelectItem key={distribution.id} value={distribution.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{distribution.title}</span>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(distribution.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(distribution.created_at)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDistribution && (
        <>
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="text-lg">Analiz sonuçları yükleniyor...</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            analyticsData && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Yanıt</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.distributionInfo.totalResponses}</div>
                      <p className="text-xs text-muted-foreground">
                        Hedef: {analyticsData.distributionInfo.totalTargets}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Yanıt Oranı</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.distributionInfo.responseRate}</div>
                      <p className="text-xs text-muted-foreground">
                        Katılım oranı
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Memnuniyet</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analyticsData.overallStats.satisfactionScore !== 'N/A' ? 
                          analyticsData.overallStats.satisfactionScore : '-'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Genel memnuniyet
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Durum</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {getStatusBadge(analyticsData.distributionInfo.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Anket durumu
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{analyticsData.distributionInfo.title}</CardTitle>
                    <CardDescription>
                      Şablon: {analyticsData.distributionInfo.templateTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {analyticsData.overallStats.mostSkippedQuestion && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground">En Çok Atlanan Soru</h4>
                          <p className="text-sm">{analyticsData.overallStats.mostSkippedQuestion.questionText}</p>
                          <p className="text-xs text-red-600">
                            {analyticsData.overallStats.mostSkippedQuestion.skipRate} atlanma oranı
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Ortalama Tamamlama Süresi</h4>
                        <p className="text-sm">{analyticsData.overallStats.averageCompletionTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Soru Bazlı Analiz</CardTitle>
                    <CardDescription>
                      Her sorunun detaylı istatistikleri
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.questionAnalytics.map((question) => (
                        <QuestionAnalyticsCard key={question.questionId} question={question} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {distributionStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>İstatistikler</CardTitle>
                      <CardDescription>
                        Ek analizler ve demografik bilgiler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Gönderim Türleri</h4>
                          {Object.entries(distributionStats.submissionTypes).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-sm">{type === 'ONLINE' ? 'Online' : 'Excel Yükleme'}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>

                        {Object.keys(distributionStats.demographicBreakdown.byClass).length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Sınıf Bazlı Dağılım</h4>
                            {Object.entries(distributionStats.demographicBreakdown.byClass).map(([className, count]) => (
                              <div key={className} className="flex justify-between items-center">
                                <span className="text-sm">{className}</span>
                                <span className="font-medium">{count as number}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
