import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Home } from "lucide-react";
import { HomeVisit, addHomeVisit } from "@/lib/storage";

const homeEnvironments = ["UYGUN", "ORTA", "ZOR_KOŞULLAR", "DEĞERLENDİRİLEMEDİ"] as const;
const familyInteractions = ["OLUMLU", "NORMAL", "GERGİN", "İŞBİRLİKSİZ"] as const;

const homeVisitSchema = z.object({
  date: z.string().min(1, "Ziyaret tarihi gereklidir"),
  time: z.string().min(1, "Ziyaret saati gereklidir"),
  visitDuration: z.string().optional(),
  visitors: z.string().min(1, "Ziyaretçi bilgisi gereklidir"),
  familyPresent: z.string().optional(),
  homeEnvironment: z.enum(homeEnvironments),
  familyInteraction: z.enum(familyInteractions),
  observations: z.string().min(1, "Gözlemler gereklidir"),
  recommendations: z.string().min(1, "Öneriler gereklidir"),
  concerns: z.string().optional(),
  resources: z.string().optional(),
  nextVisitPlanned: z.string().optional(),
});

type HomeVisitFormValues = z.infer<typeof homeVisitSchema>;

interface EvZiyaretleriSectionProps {
  studentId: string;
  homeVisits: HomeVisit[];
  onUpdate: () => void;
}

export default function EvZiyaretleriSection({ studentId, homeVisits, onUpdate }: EvZiyaretleriSectionProps) {
  const form = useForm<HomeVisitFormValues>({
    resolver: zodResolver(homeVisitSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      time: "14:00",
      visitDuration: "",
      visitors: "",
      familyPresent: "",
      homeEnvironment: "UYGUN",
      familyInteraction: "OLUMLU",
      observations: "",
      recommendations: "",
      concerns: "",
      resources: "",
      nextVisitPlanned: "",
    },
  });

  const onSubmit = async (data: HomeVisitFormValues) => {
    const homeVisit: HomeVisit = {
      id: crypto.randomUUID(),
      studentId,
      date: data.date,
      time: data.time,
      visitDuration: Number(data.visitDuration) || 60,
      visitors: data.visitors.split(",").map(v => v.trim()).filter(Boolean),
      familyPresent: data.familyPresent ? data.familyPresent.split(",").map(f => f.trim()).filter(Boolean) : [],
      homeEnvironment: data.homeEnvironment,
      familyInteraction: data.familyInteraction,
      observations: data.observations,
      recommendations: data.recommendations,
      concerns: data.concerns || undefined,
      resources: data.resources || undefined,
      followUpActions: undefined,
      nextVisitPlanned: data.nextVisitPlanned || undefined,
      notes: undefined,
      createdBy: "Sistem",
      createdAt: new Date().toISOString(),
    };

    await addHomeVisit(homeVisit);
    form.reset();
    onUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Ev Ziyareti Kayıtları
        </CardTitle>
        <CardDescription>
          Ev ziyareti gözlemleri ve önerileri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ziyaret Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ziyaret Saati</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visitDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Süre (dakika)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visitors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ziyaretçiler</FormLabel>
                    <FormControl>
                      <Input placeholder="Virgülle ayırın" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="familyPresent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evde Bulunanlar</FormLabel>
                    <FormControl>
                      <Input placeholder="Virgülle ayırın" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ev Ortamı</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Ev ortamını değerlendirin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UYGUN">Uygun</SelectItem>
                        <SelectItem value="ORTA">Orta</SelectItem>
                        <SelectItem value="ZOR_KOŞULLAR">Zor Koşullar</SelectItem>
                        <SelectItem value="DEĞERLENDİRİLEMEDİ">Değerlendirilemedi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="familyInteraction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aile Etkileşimi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aile etkileşimini değerlendirin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OLUMLU">Olumlu</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="GERGİN">Gergin</SelectItem>
                        <SelectItem value="İŞBİRLİKSİZ">İşbirliksiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gözlemler</FormLabel>
                  <FormControl>
                    <EnhancedTextarea 
                      placeholder="Ev ziyareti sırasındaki gözlemlerinizi yazın" 
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

            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Öneriler</FormLabel>
                  <FormControl>
                    <EnhancedTextarea placeholder="Aileye yönelik önerilerinizi yazın" {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concerns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tespit Edilen Sorunlar</FormLabel>
                  <FormControl>
                    <EnhancedTextarea placeholder="Varsa sorunları belirtin" {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sağlanan Kaynaklar/Yardımlar</FormLabel>
                  <FormControl>
                    <EnhancedTextarea placeholder="Aileye sağlanan destek ve kaynaklar" {...field} aiContext="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextVisitPlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sonraki Ziyaret Tarihi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Ev Ziyareti Kaydet
            </Button>
          </form>
        </Form>

        <div className="space-y-3 mt-6">
          <h4 className="font-medium">Ziyaret Geçmişi</h4>
          {homeVisits.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Henüz ev ziyareti kaydı yok.
            </div>
          )}
          {homeVisits.map((visit) => (
            <div
              key={visit.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {new Date(visit.date).toLocaleDateString()} - {visit.time}
                </div>
                <Badge variant="outline">{visit.visitDuration} dk</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Ev Ortamı:</strong> {visit.homeEnvironment}
                </div>
                <div>
                  <strong>Aile Etkileşimi:</strong> {visit.familyInteraction}
                </div>
              </div>
              <div className="text-sm">
                <strong>Ziyaretçiler:</strong> {visit.visitors.join(", ")}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Gözlemler:</strong> {visit.observations}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Öneriler:</strong> {visit.recommendations}
              </div>
              <div className="text-xs text-muted-foreground">
                Kaydeden: {visit.createdBy}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
