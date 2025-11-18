import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/organisms/Form";
import { Heart } from "lucide-react";
import { FamilyParticipation, addFamilyParticipation } from "@/lib/storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const eventTypes = ["VELI_TOPLANTISI", "OKUL_ETKİNLİĞİ", "ÖĞRETMEN_GÖRÜŞMESİ", "PERFORMANS_DEĞERLENDİRME", "DİĞER"] as const;
const participationStatuses = ["KATILDI", "KATILMADI", "GEÇ_KATILDI", "ERKEN_AYRILDI"] as const;
const engagementLevels = ["ÇOK_AKTİF", "AKTİF", "PASİF", "İLGİSİZ"] as const;
const communicationFrequencies = ["GÜNLÜK", "HAFTALIK", "AYLIK", "SADECE_GEREKENDE"] as const;
const contactMethods = ["TELEFON", "EMAIL", "WHATSAPP", "YÜZ_YÜZE", "OKUL_SISTEMI"] as const;

const familyParticipationSchema = z.object({
  eventType: z.enum(eventTypes),
  eventName: z.string().min(1, "Etkinlik adı gereklidir"),
  eventDate: z.string().min(1, "Etkinlik tarihi gereklidir"),
  participationStatus: z.enum(participationStatuses),
  participants: z.string().optional(),
  engagementLevel: z.enum(engagementLevels),
  communicationFrequency: z.enum(communicationFrequencies),
  preferredContactMethod: z.enum(contactMethods),
  parentAvailability: z.string().optional(),
  notes: z.string().optional(),
});

type FamilyParticipationFormValues = z.infer<typeof familyParticipationSchema>;

interface AileKatilimiSectionProps {
  studentId: string;
  familyParticipation: FamilyParticipation[];
  onUpdate: () => void;
}

export default function AileKatilimiSection({ studentId, familyParticipation, onUpdate }: AileKatilimiSectionProps) {
  const form = useForm<FamilyParticipationFormValues>({
    resolver: zodResolver(familyParticipationSchema),
    defaultValues: {
      eventType: "VELI_TOPLANTISI",
      eventName: "",
      eventDate: new Date().toISOString().slice(0, 10),
      participationStatus: "KATILDI",
      participants: "",
      engagementLevel: "AKTİF",
      communicationFrequency: "HAFTALIK",
      preferredContactMethod: "TELEFON",
      parentAvailability: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FamilyParticipationFormValues) => {
    try {
      const familyParticipationData: FamilyParticipation = {
        id: crypto.randomUUID(),
        studentId,
        eventType: data.eventType,
        eventName: data.eventName,
        eventDate: data.eventDate,
        participationStatus: data.participationStatus,
        participants: data.participants 
          ? data.participants.split(",").map(p => p.trim()).filter(Boolean) 
          : undefined,
        engagementLevel: data.engagementLevel,
        communicationFrequency: data.communicationFrequency,
        preferredContactMethod: data.preferredContactMethod,
        parentAvailability: data.parentAvailability || undefined,
        notes: data.notes || undefined,
        recordedBy: "Sistem",
        recordedAt: new Date().toISOString(),
      };

      await addFamilyParticipation(familyParticipationData);
      toast.success("Aile katılım kaydı eklendi");
      form.reset();
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving family participation:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Aile Katılım Durumu
        </CardTitle>
        <CardDescription>
          Okul etkinlikleri ve görüşmelere katılım takibi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Etkinlik Türü" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VELI_TOPLANTISI">Veli Toplantısı</SelectItem>
                        <SelectItem value="OKUL_ETKİNLİĞİ">Okul Etkinliği</SelectItem>
                        <SelectItem value="ÖĞRETMEN_GÖRÜŞMESİ">Öğretmen Görüşmesi</SelectItem>
                        <SelectItem value="PERFORMANS_DEĞERLENDİRME">Performans Değerlendirme</SelectItem>
                        <SelectItem value="DİĞER">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Etkinlik Adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" placeholder="Etkinlik Tarihi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="participationStatus"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Katılım Durumu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KATILDI">Katıldı</SelectItem>
                        <SelectItem value="KATILMADI">Katılmadı</SelectItem>
                        <SelectItem value="GEÇ_KATILDI">Geç Katıldı</SelectItem>
                        <SelectItem value="ERKEN_AYRILDI">Erken Ayrıldı</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Katılan aile üyeleri (virgülle ayırın)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="engagementLevel"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Katılım Düzeyi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ÇOK_AKTİF">Çok Aktif</SelectItem>
                        <SelectItem value="AKTİF">Aktif</SelectItem>
                        <SelectItem value="PASİF">Pasif</SelectItem>
                        <SelectItem value="İLGİSİZ">İlgisiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="communicationFrequency"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="İletişim Sıklığı" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GÜNLÜK">Günlük</SelectItem>
                        <SelectItem value="HAFTALIK">Haftalık</SelectItem>
                        <SelectItem value="AYLIK">Aylık</SelectItem>
                        <SelectItem value="SADECE_GEREKENDE">Sadece Gerekende</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferredContactMethod"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tercih Edilen İletişim Yöntemi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TELEFON">Telefon</SelectItem>
                      <SelectItem value="EMAIL">E-mail</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="YÜZ_YÜZE">Yüz Yüze</SelectItem>
                      <SelectItem value="OKUL_SISTEMI">Okul Sistemi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentAvailability"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Veli müsait olduğu zamanlar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <EnhancedTextarea 
                      placeholder="Notlar" 
                      {...field} 
                      aiContext="notes"
                      enableVoice={true}
                      voiceLanguage="tr-TR"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Heart className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Kaydediliyor..." : "Katılım Kaydı Ekle"}
            </Button>
          </form>
        </Form>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium">Katılım Geçmişi</h4>
          {(!familyParticipation || familyParticipation.length === 0) && (
            <div className="text-sm text-muted-foreground">
              Henüz katılım kaydı yok.
            </div>
          )}
          {familyParticipation?.map((participation) => (
            <div
              key={participation.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{participation.eventName}</div>
                <Badge variant="outline">{participation.eventType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {new Date(participation.eventDate).toLocaleDateString()}
                </div>
                <Badge
                  variant={participation.participationStatus === "KATILDI" ? "default" : "secondary"}
                >
                  {participation.participationStatus}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Katılım Düzeyi:</strong> {participation.engagementLevel}
                </div>
                <div>
                  <strong>İletişim:</strong> {participation.communicationFrequency}
                </div>
              </div>
              <div className="text-sm">
                <strong>Tercih Edilen Yöntem:</strong> {participation.preferredContactMethod}
              </div>
              {participation.participants && (
                <div className="text-sm text-muted-foreground">
                  <strong>Katılanlar:</strong> {participation.participants.join(", ")}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Kaydeden: {participation.recordedBy}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
