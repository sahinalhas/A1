import {
 LayoutDashboard,
 GraduationCap,
 ShieldAlert,
 MessageCircle,
 Bot,
 Heart,
 TrendingUp,
 ClipboardList,
 BookOpen,
 Trophy,
 PieChart,
 Users,
 Home,
 Calendar,
} from "lucide-react";
import { TabConfig } from "./types";

/**
 * Öğrenci Profili Ana Tab Yapılandırması
 * Optimized: 6 Ana Sekme - Mantıksal İş Akışı
 */
export const STUDENT_PROFILE_MAIN_TABS: TabConfig[] = [
 {
 value:"overview",
 label:"Genel Bakış",
 icon: LayoutDashboard,
 description:"360° durum özeti, trendler, hızlı aksiyonlar ve önemli bilgiler",
 variant:"pills"
 },
 {
 value:"identity-family",
 label:"Kimlik & Aile",
 icon: Users,
 description:"Öğrenci ve aile bilgileri, iletişim, sosyoekonomik durum",
 variant:"pills"
 },
 {
 value:"academics",
 label:"Akademik",
 icon: GraduationCap,
 description:"Notlar, sınavlar, devam, öğrenme stratejisi ve ilerleme",
 variant:"pills"
 },
 {
 value:"wellbeing",
 label:"İyilik Hali & Gelişim",
 icon: Heart,
 description:"Sağlık, sosyal-duygusal, kişilik, motivasyon ve kariyer",
 variant:"pills"
 },
 {
 value:"risk-support",
 label:"Risk & Müdahale",
 icon: ShieldAlert,
 description:"Risk faktörleri, davranış takibi ve müdahale planları",
 variant:"pills"
 },
 {
 value:"communication",
 label:"İletişim & Kayıtlar",
 icon: MessageCircle,
 description:"Görüşmeler, notlar, ev ziyaretleri, belgeler ve AI araçları",
 variant:"pills"
 },
];

/**
 * Akademik Sekme Alt Tab Yapılandırması
 */
export const STUDENT_ACADEMIC_TABS: TabConfig[] = [
 {
 value:"performans",
 label:"Akademik Performans",
 icon: TrendingUp,
 },
 {
 value:"sinavlar",
 label:"Sınavlar & Değerlendirme",
 icon: ClipboardList,
 },
 {
 value:"calisma-programi",
 label:"Çalışma Programı",
 icon: BookOpen,
 },
 {
 value:"ilerleme",
 label:"İlerleme & Başarılar",
 icon: Trophy,
 },
 {
 value:"anketler",
 label:"Anketler",
 icon: PieChart,
 },
];

/**
 * İletişim Merkezi Alt Tab Yapılandırması
 */
export const STUDENT_COMMUNICATION_TABS: TabConfig[] = [
 {
 value:"tum-gorusmeler",
 label:"Tüm Görüşmeler",
 icon: MessageCircle,
 },
 {
 value:"ev-ziyaretleri",
 label:"Ev Ziyaretleri",
 icon: Home,
 },
 {
 value:"aile-katilimi",
 label:"Aile Katılımı",
 icon: Users,
 },
 {
 value:"gecmis",
 label:"İletişim Geçmişi",
 icon: Calendar,
 },
 {
 value:"ai-araclari",
 label:"AI Araçları",
 icon: Bot,
 },
];

/**
 * Semantic Color System - Tab Renk Paleti
 */
export const STUDENT_TAB_COLORS = {
 overview: {
 gradient:"from-indigo-500 via-violet-500 to-purple-600",
 bg:"bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30",
 border:"border-indigo-200/50 dark:border-indigo-800/50",
 },
"identity-family": {
 gradient:"from-blue-500 to-cyan-500",
 bg:"bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/30 dark:to-cyan-950/30",
 border:"border-blue-200/50 dark:border-blue-800/50",
 },
 academics: {
 gradient:"from-emerald-500 to-teal-500",
 bg:"bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30",
 border:"border-emerald-200/50 dark:border-emerald-800/50",
 },
 wellbeing: {
 gradient:"from-green-500 to-lime-500",
 bg:"bg-gradient-to-r from-green-50/80 to-lime-50/80 dark:from-green-950/30 dark:to-lime-950/30",
 border:"border-green-200/50 dark:border-green-800/50",
 },
"risk-support": {
 gradient:"from-red-500 to-orange-500",
 bg:"bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30",
 border:"border-red-200/50 dark:border-red-800/50",
 },
 communication: {
 gradient:"from-violet-500 to-fuchsia-500",
 bg:"bg-gradient-to-r from-violet-50/80 to-fuchsia-50/80 dark:from-violet-950/30 dark:to-fuchsia-950/30",
 border:"border-violet-200/50 dark:border-violet-800/50",
 },
 ai: {
 gradient:"from-indigo-500 to-purple-500",
 bg:"bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30",
 border:"border-indigo-200/50 dark:border-indigo-800/50",
 },
} as const;
