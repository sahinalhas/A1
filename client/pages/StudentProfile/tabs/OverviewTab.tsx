
import { ProfileDashboard } from "../components/ProfileDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { 
  TrendingUp, 
  Heart, 
  ShieldAlert, 
  Target,
  ArrowRight,
  Info,
  Sparkles,
  MessageCircle,
  Users,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { Student } from "@/lib/storage";
import ProfileUpdateTimeline from "@/components/features/live-profile/ProfileUpdateTimeline";
import { useEffect, useState } from "react";
import { getNotesByStudent } from "@/lib/api/endpoints/notes.api";

interface OverviewTabProps {
  student: Student;
  studentId: string;
  scoresData?: any;
  loadingScores?: boolean;
}

export function OverviewTab({
  student,
  studentId,
  scoresData,
  loadingScores,
}: OverviewTabProps) {
  // Hızlı özetler için skorları hesapla
  const academicScore = scoresData?.akademikSkor || 0;
  const socialScore = scoresData?.sosyalDuygusalSkor || 0;
  const riskScore = scoresData?.riskSkoru || 0;
  const motivationScore = scoresData?.motivasyonSkor || 0;

  // Görüşme sayıları
  const [meetingStats, setMeetingStats] = useState({
    veli: 0,
    bireysel: 0,
    grup: 0
  });

  useEffect(() => {
    loadMeetingStats();
  }, [studentId]);

  const loadMeetingStats = async () => {
    try {
      const notes = await getNotesByStudent(studentId);
      const veli = notes.filter(n => n.type === 'Veli').length;
      const bireysel = notes.filter(n => n.type === 'Bireysel').length;
      const grup = notes.filter(n => n.type === 'Grup').length;
      
      setMeetingStats({ veli, bireysel, grup });
    } catch (error) {
      console.error('Error loading meeting stats:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Çok İyi";
    if (score >= 60) return "İyi";
    if (score >= 40) return "Orta";
    return "Gelişmeli";
  };

  return (
    <div className="space-y-6">
      {/* Bilgilendirme */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bu sekme öğrencinin genel durumunu özetler. Detaylı bilgiler için ilgili sekmeleri ziyaret edin.
        </AlertDescription>
      </Alert>

      {/* Hızlı Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Akademik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(academicScore)}`}>
              {Math.round(academicScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(academicScore)}
            </p>
            <Button asChild variant="link" size="sm" className="mt-2 p-0 h-auto">
              <Link to="#academics" className="flex items-center gap-1">
                Detaylar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Sosyal-Duygusal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(socialScore)}`}>
              {Math.round(socialScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(socialScore)}
            </p>
            <Button asChild variant="link" size="sm" className="mt-2 p-0 h-auto">
              <Link to="#wellbeing" className="flex items-center gap-1">
                Detaylar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Risk Seviyesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${riskScore > 60 ? 'text-red-600' : riskScore > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
              {Math.round(riskScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {riskScore > 60 ? 'Yüksek' : riskScore > 30 ? 'Orta' : 'Düşük'}
            </p>
            <Button asChild variant="link" size="sm" className="mt-2 p-0 h-auto">
              <Link to="#risk-support" className="flex items-center gap-1">
                Detaylar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Motivasyon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(motivationScore)}`}>
              {Math.round(motivationScore)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(motivationScore)}
            </p>
            <Button asChild variant="link" size="sm" className="mt-2 p-0 h-auto">
              <Link to="#wellbeing" className="flex items-center gap-1">
                Detaylar <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Görüşme İstatistikleri */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            Görüşme & İletişim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Veli:</span>
              <span className="text-sm font-semibold">{meetingStats.veli}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Bireysel:</span>
              <span className="text-sm font-semibold">{meetingStats.bireysel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Grup:</span>
              <span className="text-sm font-semibold">{meetingStats.grup}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil Tamamlama ve Canlı Senkronizasyon */}
      <ProfileDashboard
        studentId={studentId}
        scores={scoresData}
        isLoading={loadingScores}
      />

      {/* Hızlı Aksiyonlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Hızlı Aksiyonlar
          </CardTitle>
          <CardDescription>
            Sık kullanılan işlemler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="h-auto flex-col py-4">
              <Link to="/gorusmeler">
                <div className="text-sm font-medium">Görüşme Ekle</div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-4">
              <Link to={`/ai-asistan?student=${studentId}`}>
                <div className="text-sm font-medium">AI Analiz</div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-4">
              <Link to={`#academics`}>
                <div className="text-sm font-medium">Not Gir</div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-4">
              <Link to={`#communication`}>
                <div className="text-sm font-medium">Veli İletişim</div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profil Güncelleme Geçmişi */}
      <ProfileUpdateTimeline studentId={studentId} maxItems={5} />
    </div>
  );
}
