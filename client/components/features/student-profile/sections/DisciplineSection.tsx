
import { useEffect } from "react";
import type { Student } from "@/lib/types/student.types";
import { upsertStudent } from "@/lib/api/endpoints/students.api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/organisms/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { EnhancedTextarea } from "@/components/molecules/EnhancedTextarea";

const disciplineSchema = z.object({
  disiplinCezalari: z.string().optional(),
});

type DisciplineFormValues = z.infer<typeof disciplineSchema>;

interface DisciplineSectionProps {
  student: Student;
  onUpdate: () => void;
}

export default function DisciplineSection({ student, onUpdate }: DisciplineSectionProps) {
  const form = useForm<DisciplineFormValues>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      disiplinCezalari: (student as any).disiplinCezalari || "",
    },
  });

  useEffect(() => {
    form.reset({
      disiplinCezalari: (student as any).disiplinCezalari || "",
    });
  }, [student, form]);

  const onSubmit = async (data: DisciplineFormValues) => {
    try {
      const updatedStudent: Student = {
        ...student,
        ...data,
      };
      
      await upsertStudent(updatedStudent);
      toast.success("Disiplin bilgileri kaydedildi");
      onUpdate();
    } catch (error) {
      toast.error("Kayıt sırasında hata oluştu");
      console.error("Error saving discipline info:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Disiplin Geçmişi
            </CardTitle>
            <CardDescription>
              Öğrencinin aldığı disiplin cezaları ve davranış kayıtları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="disiplinCezalari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Disiplin Cezaları ve Kayıtları
                  </FormLabel>
                  <FormControl>
                    <EnhancedTextarea 
                      {...field} 
                      className="min-h-[150px]" 
                      placeholder="Tarih, ceza türü, açıklama ve alınan önlemler...&#10;&#10;Örnek:&#10;15.09.2024 - Yazılı Uyarı: Devamsızlık (3 gün izinsiz)&#10;22.10.2024 - Sözlü Uyarı: Ödev eksikliği"
                      aiContext="notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
