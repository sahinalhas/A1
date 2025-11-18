/**
 * Unified Identity Section
 * Temel kimlik bilgileri, veli iletişim, adres bilgileri
 * NOT: Acil iletişim bilgileri Health Section'a taşındı
 * NOT: Risk bilgisi manuel değil, otomatik hesaplanıyor
 */

import { useEffect } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
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
  FormDescription,
} from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  Hash,
  Home,
  Map,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/atoms/Badge";

const unifiedIdentitySchema = z.object({
  name: z.string().min(1, "Ad zorunludur"),
  surname: z.string().min(1, "Soyad zorunludur"),
  tcIdentityNo: z.string().optional(),
  studentNumber: z.string().optional(),
  class: z.string().optional(),
  gender: z.enum(["K", "E"]).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  parentEmail: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  parentOccupation: z.string().optional(),
  parentEducation: z.string().optional(),
  secondParentName: z.string().optional(),
  secondParentContact: z.string().optional(),
  secondParentRelation: z.string().optional(),
  numberOfSiblings: z.number().optional(),
  motherOccupation: z.string().optional(),
  fatherOccupation: z.string().optional(),
});

type UnifiedIdentityFormValues = z.infer<typeof unifiedIdentitySchema>;

interface UnifiedIdentitySectionProps {
  student: Student;
  onUpdate: () => void;
}

export default function UnifiedIdentitySection({ student, onUpdate }: UnifiedIdentitySectionProps) {
  const form = useForm<UnifiedIdentityFormValues>({
    resolver: zodResolver(unifiedIdentitySchema),
    defaultValues: {
      name: student.name || "",
      surname: student.surname || "",
      tcIdentityNo: student.tcIdentityNo || "",
      studentNumber: student.studentNumber || "",
      class: student.class || "",
      gender: student.gender,
      birthDate: student.birthDate || "",
      birthPlace: student.birthPlace || "",
      phone: student.phone || "",
      email: student.email || "",
      province: student.province || "",
      district: student.district || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentContact: student.parentContact || "",
      parentEmail: (student as any).parentEmail || "",
      parentOccupation: (student as any).parentOccupation || "",
      parentEducation: (student as any).parentEducation || "",
      secondParentName: (student as any).secondParentName || "",
      secondParentContact: (student as any).secondParentContact || "",
      secondParentRelation: (student as any).secondParentRelation || "",
      numberOfSiblings: student.numberOfSiblings,
      motherOccupation: student.motherOccupation || "",
      fatherOccupation: student.fatherOccupation || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: student.name || "",
      surname: student.surname || "",
      tcIdentityNo: student.tcIdentityNo || "",
      studentNumber: student.studentNumber || "",
      class: student.class || "",
      gender: student.gender,
      birthDate: student.birthDate || "",
      birthPlace: student.birthPlace || "",
      phone: student.phone || "",
      email: student.email || "",
      province: student.province || "",
      district: student.district || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentContact: student.parentContact || "",
      parentEmail: (student as any).parentEmail || "",
      parentOccupation: (student as any).parentOccupation || "",
      parentEducation: (student as any).parentEducation || "",
      secondParentName: (student as any).secondParentName || "",
      secondParentContact: (student as any).secondParentContact || "",
      secondParentRelation: (student as any).secondParentRelation || "",
      numberOfSiblings: student.numberOfSiblings,
      motherOccupation: student.motherOccupation || "",
      fatherOccupation: student.fatherOccupation || "",
    });
  }, [student, form]);

  const onSubmit = async (data: UnifiedIdentityFormValues) => {
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
        numberOfSiblings: typeof data.numberOfSiblings === "number" ? data.numberOfSiblings : undefined,
      };

      await upsertStudent(updatedStudent);
      toast.success("Öğrenci bilgileri kaydedildi");
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving student:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Temel Kimlik Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Temel Kimlik Bilgileri
            </CardTitle>
            <CardDescription>
              Öğrencinin temel tanımlayıcı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Ad *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Öğrenci adı" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Soyad *
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Öğrenci soyadı" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tcIdentityNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      TC Kimlik No
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="11 haneli TC kimlik no" maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      Okul Numarası
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: 1001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Sınıf
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Örn: 9/A" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cinsiyet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="K">Kız</SelectItem>
                        <SelectItem value="E">Erkek</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Doğum Tarihi
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Doğum Yeri
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="İl/İlçe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim & Adres Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-primary" />
              İletişim & Adres
            </CardTitle>
            <CardDescription>
              Öğrenci iletişim bilgileri ve ev adresi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* İletişim */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Telefon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        E-posta
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-10" placeholder="ornek@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Adres */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Adres Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        İl
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Örn: İstanbul" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        İlçe
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Örn: Kadıköy" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Açık Adres</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-10" placeholder="Mahalle, sokak, bina no, daire..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Veli Bilgileri */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Aile Bilgileri
            </CardTitle>
            <CardDescription>
              Birincil veli ve aile yapısı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Birincil Veli (Anne/Baba)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Veli Adı Soyadı
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Anne/baba adı soyadı" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Veli Telefon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        Veli E-posta
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-10" placeholder="ornek@email.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Meslek
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Meslek" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentEducation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eğitim Durumu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="İlkokul">İlkokul</SelectItem>
                          <SelectItem value="Ortaokul">Ortaokul</SelectItem>
                          <SelectItem value="Lise">Lise</SelectItem>
                          <SelectItem value="Ön Lisans">Ön Lisans</SelectItem>
                          <SelectItem value="Lisans">Lisans</SelectItem>
                          <SelectItem value="Yüksek Lisans">Yüksek Lisans</SelectItem>
                          <SelectItem value="Doktora">Doktora</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">İkinci Veli / Acil Durum İletişim</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="secondParentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Adı Soyadı
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="İkinci veli/acil kişi" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondParentContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Telefon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="h-10" placeholder="+90 5XX XXX XX XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondParentRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yakınlık Derecesi</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Anne">Anne</SelectItem>
                          <SelectItem value="Baba">Baba</SelectItem>
                          <SelectItem value="Büyükanne">Büyükanne</SelectItem>
                          <SelectItem value="Büyükbaba">Büyükbaba</SelectItem>
                          <SelectItem value="Teyze/Hala">Teyze/Hala</SelectItem>
                          <SelectItem value="Amca/Dayı">Amca/Dayı</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Aile Yapısı</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="motherOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Anne Mesleği
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Anne mesleği" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatherOccupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Baba Mesleği
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10" placeholder="Baba mesleği" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfSiblings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Kardeş Sayısı
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="h-10"
                          placeholder="0"
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="min-w-[200px]">
            Kaydet
          </Button>
        </div>
      </form>
    </Form>
  );
}