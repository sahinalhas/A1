import { z } from "zod";

export const surveyTemplateSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  tags: z.array(z.string()),
  targetAudience: z.enum([
    "STUDENT",
    "PARENT",
    "TEACHER",
    "ADMINISTRATOR",
    "STAFF",
    "ALUMNI",
    "EXTERNAL_STAKEHOLDER"
  ]),
  questions: z.array(z.object({
    questionText: z.string().min(1, "Soru metni gereklidir"),
    questionType: z.enum(["MULTIPLE_CHOICE", "OPEN_ENDED", "LIKERT", "YES_NO", "RATING", "DROPDOWN"]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
    }).optional(),
  }))
});

export type SurveyTemplateForm = z.infer<typeof surveyTemplateSchema>;

export const targetAudienceLabels: Record<string, string> = {
  STUDENT: "Öğrenci Anketleri",
  PARENT: "Veli Anketleri",
  TEACHER: "Öğretmen Anketleri",
  ADMINISTRATOR: "İdareci Anketleri",
  STAFF: "Personel Anketleri",
  ALUMNI: "Mezun Anketleri",
  EXTERNAL_STAKEHOLDER: "Kurum Dışı Paydaş Anketleri"
};
