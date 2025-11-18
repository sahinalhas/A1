import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Plus, Download, Upload, Link2, BarChart, Users, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/organisms/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/organisms/DropdownMenu";
import { SurveyDistribution, DistributionStatus } from "@/lib/survey-types";
import SurveyExcelUploadDialog from "./SurveyExcelUploadDialog";
import { useToast } from "@/hooks/utils/toast.utils";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SURVEY_QUERY_KEYS, useDeleteDistribution } from "@/hooks/features/surveys";

interface DistributionsListProps {
  distributions: SurveyDistribution[];
  onNewDistribution: () => void;
  onEdit?: (distribution: SurveyDistribution) => void;
}

const getStatusBadge = (status: DistributionStatus) => {
  const statusStyles = {
    DRAFT: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-blue-100 text-blue-700",
  };

  const statusLabels = {
    DRAFT: "Taslak",
    ACTIVE: "Aktif",
    CLOSED: "Kapalı",
    ARCHIVED: "Arşivlenmiş",
  };

  return (
    <Badge className={statusStyles[status]}>
      {statusLabels[status]}
    </Badge>
  );
};

export default function DistributionsList({ distributions, onNewDistribution, onEdit }: DistributionsListProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteDistribution = useDeleteDistribution();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<SurveyDistribution | null>(null);

  const handleExcelUpload = (distribution: SurveyDistribution) => {
    setSelectedDistribution(distribution);
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
  };

  const handleCopyLink = (distribution: SurveyDistribution) => {
    if (distribution.publicLink) {
      const link = `${window.location.origin}/survey/${distribution.publicLink}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link kopyalandı",
        description: "Anket linki panoya kopyalandı"
      });
    }
  };

  const handleDownloadExcel = async (distribution: SurveyDistribution) => {
    try {
      const { surveyService } = await import('@/services/survey.service');
      const questions = await queryClient.fetchQuery({
        queryKey: SURVEY_QUERY_KEYS.questions(distribution.templateId),
        queryFn: () => surveyService.getTemplateQuestions(distribution.templateId)
      });
      const { loadStudents } = await import('@/lib/storage');
      const { generateExcelTemplate } = await import('@/lib/excel-template-generator');
      
      const students = loadStudents().filter(s => 
        !distribution.targetClasses || 
        distribution.targetClasses.length === 0 || 
        (s.class && distribution.targetClasses.includes(s.class))
      );

      const base64Excel = generateExcelTemplate({
        survey: { 
          id: distribution.templateId,
          title: distribution.title,
          description: distribution.description || '',
          targetAudience: 'STUDENT',
          tags: [],
          created_at: distribution.created_at || new Date().toISOString(),
          updated_at: distribution.updated_at || new Date().toISOString()
        },
        questions,
        students,
        config: (typeof distribution.excelTemplate === 'object' && distribution.excelTemplate !== null) 
          ? distribution.excelTemplate 
          : {
            includeStudentInfo: true,
            includeInstructions: true,
            responseFormat: 'single_sheet' as const,
            includeValidation: true
          },
        distributionTitle: distribution.title
      });

      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Excel}`;
      link.download = `${distribution.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Başarılı",
        description: "Excel şablonu indirildi"
      });
    } catch (error) {
      console.error('Excel download error:', error);
      toast({
        title: "Hata",
        description: "Excel şablonu indirilemedi",
        variant: "destructive"
      });
    }
  };

  const handleViewResults = (distribution: SurveyDistribution) => {
    navigate(`/surveys?tab=analytics&distributionId=${distribution.id}`);
  };

  const handleEdit = (distribution: SurveyDistribution) => {
    if (onEdit) {
      onEdit(distribution);
    }
  };

  const handleDelete = async (distribution: SurveyDistribution) => {
    if (!confirm(`"${distribution.title}" dağıtımını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    await deleteDistribution.mutateAsync(distribution.id);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Anket Dağıtımları</CardTitle>
            <CardDescription>
              Sınıflara dağıtılmış anketler ve durumları
            </CardDescription>
          </div>
          <Button size="sm" onClick={onNewDistribution}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Dağıtım
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anket</TableHead>
              <TableHead>Dağıtım Türü</TableHead>
              <TableHead>Hedef Sınıflar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Yanıt Sayısı</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>Henüz anket dağıtımı bulunmuyor</p>
                    <p className="text-sm">Bir anket şablonu seçip dağıtmaya başlayın</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              distributions.map((distribution) => (
                <TableRow key={distribution.id}>
                  <TableCell className="font-medium">{distribution.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {distribution.distributionType === 'MANUAL_EXCEL' && 'Excel Şablonu'}
                      {distribution.distributionType === 'ONLINE_LINK' && 'Online Link'}
                      {distribution.distributionType === 'HYBRID' && 'Hibrit'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {distribution.targetClasses?.join(', ') || 'Tümü'}
                  </TableCell>
                  <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                  <TableCell>0 / {distribution.targetStudents?.length || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          İşlemler
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownloadExcel(distribution)}>
                          <Download className="mr-2 h-4 w-4" />
                          Excel İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(distribution)}>
                          <Link2 className="mr-2 h-4 w-4" />
                          Link Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExcelUpload(distribution)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Excel Yükle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewResults(distribution)}>
                          <BarChart className="mr-2 h-4 w-4" />
                          Sonuçları Gör
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(distribution)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(distribution)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    {/* Excel Upload Dialog */}
    {selectedDistribution && (
      <SurveyExcelUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        distribution={selectedDistribution}
        onUploadComplete={handleUploadComplete}
      />
    )}
    </>
  );
}
