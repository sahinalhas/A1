export type GuidanceTipCategory =
  | 'PSIKOLOJIK_DANISMANLIK'
  | 'KARIYER_REHBERLIGI'
  | 'OGRENCI_ILETISIMI'
  | 'VELI_GORUSMESI'
  | 'KRIZ_YONETIMI'
  | 'MOTIVASYON'
  | 'SINIF_YONETIMI'
  | 'MEVZUAT'
  | 'TEKNIK_BILGI'
  | 'GENEL';

export type GuidanceTipImportance = 'DUSUK' | 'NORMAL' | 'YUKSEK' | 'KRITIK';

export interface GuidanceTip {
  id: string;
  category: GuidanceTipCategory;
  title: string;
  content: string;
  source: string;
  importance: GuidanceTipImportance;
  isRead: boolean;
  isActive: boolean;
  viewCount: number;
  lastShownAt: string | null;
  generatedAt: string;
  created_at: string;
  updated_at: string;
}

export interface GuidanceTipUserView {
  id: string;
  tipId: string;
  userId: string;
  viewedAt: string;
  dismissed: boolean;
  rating: number | null;
}

export interface GeneratedTipContent {
  title: string;
  content: string;
  category: GuidanceTipCategory;
  importance: GuidanceTipImportance;
}

export const GUIDANCE_TIP_CATEGORIES: { value: GuidanceTipCategory; label: string; description: string }[] = [
  { value: 'PSIKOLOJIK_DANISMANLIK', label: 'Psikolojik Danışmanlık', description: 'Danışmanlık teknikleri ve yaklaşımları' },
  { value: 'KARIYER_REHBERLIGI', label: 'Kariyer Rehberliği', description: 'Mesleki yönlendirme ve kariyer planlaması' },
  { value: 'OGRENCI_ILETISIMI', label: 'Öğrenci İletişimi', description: 'Öğrencilerle etkili iletişim kurma' },
  { value: 'VELI_GORUSMESI', label: 'Veli Görüşmesi', description: 'Veli toplantıları ve görüşme teknikleri' },
  { value: 'KRIZ_YONETIMI', label: 'Kriz Yönetimi', description: 'Acil durumlar ve kriz müdahalesi' },
  { value: 'MOTIVASYON', label: 'Motivasyon', description: 'Öğrenci motivasyonu artırma teknikleri' },
  { value: 'SINIF_YONETIMI', label: 'Sınıf Yönetimi', description: 'Sınıf rehberlik çalışmaları' },
  { value: 'MEVZUAT', label: 'Mevzuat', description: 'MEB mevzuatı ve yasal düzenlemeler' },
  { value: 'TEKNIK_BILGI', label: 'Teknik Bilgi', description: 'Rehberlik alanında teknik bilgiler' },
  { value: 'GENEL', label: 'Genel', description: 'Genel rehberlik bilgileri' },
];
