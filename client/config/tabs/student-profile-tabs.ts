import {
  LayoutDashboard,
  GraduationCap,
  MessageCircle,
  UserCircle,
  Heart,
  Brain,
  Sparkles,
  Cross,
  Target,
} from "lucide-react";
import { TabConfig } from "./types";

/**
 * Öğrenci Profili Ana Tab Yapılandırması
 * Veri Tipi Odaklı Yapı: 8 Sekme (Genel Bakış + 7 Veri Kategorisi)
 * Profesyonel & Akademik Standartlara Uygun Organizasyon
 */
export const STUDENT_PROFILE_MAIN_TABS: TabConfig[] = [
  {
    value: "overview",
    label: "Genel Bakış",
    icon: LayoutDashboard,
    description: "Özet skorlar, profil tamamlama durumu ve hızlı aksiyonlar",
    variant: "pills"
  },
  {
    value: "demographics",
    label: "Demografik Bilgiler",
    icon: UserCircle,
    description: "Kimlik bilgileri, iletişim bilgileri ve aile yapısı",
    variant: "pills"
  },
  {
    value: "academic",
    label: "Akademik Veriler",
    icon: GraduationCap,
    description: "Notlar, sınavlar, devamsızlık ve akademik performans",
    variant: "pills"
  },
  {
    value: "psychosocial",
    label: "Psikososyal Profil",
    icon: Heart,
    description: "Sosyal-duygusal gelişim, davranış ve akran ilişkileri",
    variant: "pills"
  },
  {
    value: "developmental",
    label: "Gelişimsel Değerlendirmeler",
    icon: Sparkles,
    description: "Çoklu zeka, öğrenme stili, yetenek ve ilgi alanları",
    variant: "pills"
  },
  {
    value: "health-support",
    label: "Sağlık & Destek",
    icon: Cross,
    description: "Sağlık durumu, özel eğitim, risk analizi ve müdahale planları",
    variant: "pills"
  },
  {
    value: "career",
    label: "Kariyer & Yaşam",
    icon: Target,
    description: "Kariyer hedefleri, üniversite planlaması ve gelecek vizyonu",
    variant: "pills"
  },
  {
    value: "communication",
    label: "İletişim Kayıtları",
    icon: MessageCircle,
    description: "Görüşme kayıtları, veli iletişimi ve profesyonel notlar",
    variant: "pills"
  },
];

/**
 * Semantic Color System - Tab Renk Paleti
 */
export const STUDENT_TAB_COLORS = {
  overview: {
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    bg: "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30",
    border: "border-indigo-200/50 dark:border-indigo-800/50",
  },
  demographics: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
  },
  academic: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
  },
  psychosocial: {
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-gradient-to-r from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-rose-950/30",
    border: "border-pink-200/50 dark:border-pink-800/50",
  },
  developmental: {
    gradient: "from-purple-500 to-violet-500",
    bg: "bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-950/30 dark:to-violet-950/30",
    border: "border-purple-200/50 dark:border-purple-800/50",
  },
  "health-support": {
    gradient: "from-red-500 to-orange-500",
    bg: "bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30",
    border: "border-red-200/50 dark:border-red-800/50",
  },
  career: {
    gradient: "from-amber-500 to-yellow-500",
    bg: "bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/30 dark:to-yellow-950/30",
    border: "border-amber-200/50 dark:border-amber-800/50",
  },
  communication: {
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "bg-gradient-to-r from-violet-50/80 to-fuchsia-50/80 dark:from-violet-950/30 dark:to-fuchsia-950/30",
    border: "border-violet-200/50 dark:border-violet-800/50",
  },
} as const;
