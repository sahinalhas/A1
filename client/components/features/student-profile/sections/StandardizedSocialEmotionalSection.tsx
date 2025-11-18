import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/organisms/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/organisms/Form";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Slider } from "@/components/atoms/Slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";
import { MultiSelect } from "@/components/molecules/MultiSelect";
import { Heart } from "lucide-react";
import { SOCIAL_SKILLS } from "@shared/constants/student-profile-taxonomy";
import { useStandardizedProfileSection } from "@/hooks/state/standardized-profile-section.state";

const socialEmotionalSchema = z.object({
  assessmentDate: z.string(),
  strongSocialSkills: z.array(z.string()),
  developingSocialSkills: z.array(z.string()),
  empathyLevel: z.number().min(1).max(10),
  selfAwarenessLevel: z.number().min(1).max(10),
  emotionRegulationLevel: z.number().min(1).max(10),
  conflictResolutionLevel: z.number().min(1).max(10),
  leadershipLevel: z.number().min(1).max(10),
  teamworkLevel: z.number().min(1).max(10),
  communicationLevel: z.number().min(1).max(10),
  friendCircleSize: z.enum(['YOK', 'AZ', 'ORTA', 'GENİŞ']).optional(),
  friendCircleQuality: z.enum(['ZAYIF', 'ORTA', 'İYİ', 'ÇOK_İYİ']).optional(),
  socialRole: z.enum(['LİDER', 'AKTİF_ÜYE', 'TAKİPÇİ', 'GÖZLEMCİ', 'İZOLE']).optional(),
  bullyingStatus: z.enum(['YOK', 'MAĞDUR', 'FAİL', 'HER_İKİSİ', 'GÖZLEMCİ']).optional(),
  additionalNotes: z.string().optional(),
});

type SocialEmotionalFormValues = z.infer<typeof socialEmotionalSchema>;

interface StandardizedSocialEmotionalSectionProps {
  studentId: string;
  socialEmotionalData?: any;
  onUpdate: () => void;
}

export default function StandardizedSocialEmotionalSection({ 
  studentId, 
  socialEmotionalData,
  onUpdate 
}: StandardizedSocialEmotionalSectionProps) {
  const form = useForm<SocialEmotionalFormValues>({
    resolver: zodResolver(socialEmotionalSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().slice(0, 10),
      strongSocialSkills: [],
      developingSocialSkills: [],
      empathyLevel: 5,
      selfAwarenessLevel: 5,
      emotionRegulationLevel: 5,
      conflictResolutionLevel: 5,
      leadershipLevel: 5,
      teamworkLevel: 5,
      communicationLevel: 5,
      friendCircleSize: undefined,
      friendCircleQuality: undefined,
      socialRole: undefined,
      bullyingStatus: undefined,
      additionalNotes: "",
    },
  });

  const { isSubmitting, onSubmit } = useStandardizedProfileSection({
    studentId,
    sectionName: 'Sosyal-duygusal profil',
    apiEndpoint: 'social-emotional',
    form,
    defaultValues: form.getValues(),
    onUpdate,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Standartlaştırılmış Sosyal-Duygusal Profil
        </CardTitle>
        <CardDescription>
          Ölçülebilir SEL yetkinlikleri ve sosyal etkileşim becerileri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assessmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Değerlendirme Tarihi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="strongSocialSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Güçlü Sosyal Beceriler</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={SOCIAL_SKILLS}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Güçlü becerileri seçin"
                        groupByCategory
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="developingSocialSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geliştirilmesi Gereken Beceriler</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={SOCIAL_SKILLS}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Gelişim alanlarını seçin"
                        groupByCategory
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                SEL Yetkinlik Seviyeleri (1-10 Ölçeği)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="empathyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empati Seviyesi: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Başkalarının duygularını anlama</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selfAwarenessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Öz-farkındalık: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Kendi duygularını tanıma</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emotionRegulationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duygu Düzenleme: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Duygularını kontrol edebilme</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conflictResolutionLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Çatışma Çözme: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Anlaşmazlıkları çözme becerisi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leadershipLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liderlik: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Grup yönetme ve yönlendirme</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamworkLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Takım Çalışması: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>İşbirliği yapabilme</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="communicationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İletişim: {field.value}/10</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Etkili iletişim kurma</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Sosyal Bağlam Değerlendirmesi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="friendCircleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arkadaş Çevresi Büyüklüğü</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YOK">Yok</SelectItem>
                          <SelectItem value="AZ">Az (1-2 arkadaş)</SelectItem>
                          <SelectItem value="ORTA">Orta (3-5 arkadaş)</SelectItem>
                          <SelectItem value="GENİŞ">Geniş (6+ arkadaş)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="friendCircleQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arkadaşlık İlişkisi Kalitesi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ZAYIF">Zayıf</SelectItem>
                          <SelectItem value="ORTA">Orta</SelectItem>
                          <SelectItem value="İYİ">İyi</SelectItem>
                          <SelectItem value="ÇOK_İYİ">Çok İyi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sosyal Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LİDER">Lider</SelectItem>
                          <SelectItem value="AKTİF_ÜYE">Aktif Üye</SelectItem>
                          <SelectItem value="TAKİPÇİ">Takipçi</SelectItem>
                          <SelectItem value="GÖZLEMCİ">Gözlemci</SelectItem>
                          <SelectItem value="İZOLE">İzole</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bullyingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zorbalık Durumu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YOK">Yok</SelectItem>
                          <SelectItem value="MAĞDUR">Mağdur</SelectItem>
                          <SelectItem value="FAİL">Fail</SelectItem>
                          <SelectItem value="HER_İKİSİ">Her İkisi</SelectItem>
                          <SelectItem value="GÖZLEMCİ">Gözlemci</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ek Notlar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Sosyal-duygusal gelişim hakkında ek gözlemler..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
