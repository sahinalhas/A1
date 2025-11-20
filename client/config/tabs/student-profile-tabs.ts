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
 Target,
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
 description:"Özet skorlar, profil tamamlama durumu ve hızlı aksiyonlar (Detaylar diğer sekmelerde)",
 variant:"pills"
 },
 {
 value:"identity-family",
 label:"Kimlik & Aile",
 icon: Users,
 description:"Temel kimlik, iletişim, adres, veli bilgileri, sağlık profili ve özel eğitim",
 variant:"pills"
 },
 {
 value:"academics",
 label:"Akademik Performans",
 icon: GraduationCap,
 description:"Akademik skor, notlar, sınavlar, çalışma programı, ilerleme ve AI öğrenme stratejileri",
 variant:"pills"
 },
 {
 value:"wellbeing",
 label:"Gelişim & Sosyal",
 icon: Heart,
 description:"Sosyal-duygusal profil, çoklu zeka, öğrenme stili, yetenek & ilgi alanları",
 variant:"pills"
 },
 {
 value:"risk-support",
 label:"Risk & Destek",
 icon: ShieldAlert,
 description:"AI risk analizi, davranış kayıtları, koruyucu faktörler ve müdahale planları",
 variant:"pills"
 },
 {
 value:"career-goals",
 label:"Kariyer & Hedefler",
 icon: Target,
 description:"Meslek hedefleri, üniversite planlaması, yetkinlikler ve gelecek vizyonu",
 variant:"pills"
 },
 {
 value:"communication",
 label:"Görüşmeler & İletişim",
 icon: MessageCircle,
 description:"Tüm görüşme kayıtları (veli, bireysel, grup), ev ziyaretleri ve iletişim geçmişi",
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
"career-goals": {
 gradient:"from-amber-500 to-yellow-500",
 bg:"bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/30 dark:to-yellow-950/30",
 border:"border-amber-200/50 dark:border-amber-800/50",
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
