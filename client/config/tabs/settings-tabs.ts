import { Globe, Bell, Sparkles, BookOpen, Shield, Archive, Target } from "lucide-react";
import { TabConfig } from "./types";

/**
 * Ayarlar Sayfası Tab Yapılandırması
 */
export const SETTINGS_TABS: TabConfig[] = [
 {
 value:"genel",
 label:"Genel",
 icon: Globe,
 description:"Genel uygulama ayarları"
 },
 {
 value:"bildirim",
 label:"Bildirim",
 icon: Bell,
 description:"Bildirim tercihleri ve ayarları"
 },
 {
 value:"ai",
 label:"AI",
 icon: Sparkles,
 description:"Yapay zeka entegrasyonu ve ayarları"
 },
 {
 value:"dersler",
 label:"Dersler",
 icon: BookOpen,
 description:"Ders ve konu yönetimi"
 },
 {
 value:"guvenlik",
 label:"Güvenlik",
 icon: Shield,
 description:"Güvenlik ve gizlilik ayarları"
 },
 {
 value:"yedekleme",
 label:"Yedek",
 icon: Archive,
 description:"Veri yedekleme ve geri yükleme"
 },
 {
 value:"rehberlik-standartlari",
 label:"Standartlar",
 icon: Target,
 description:"Rehberlik standartları ve hedefler"
 }
];
