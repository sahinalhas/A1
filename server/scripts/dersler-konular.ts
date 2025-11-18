import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'data', 'database.db');
const db = new Database(dbPath);

interface TopicData {
  name: string;
  avgMinutes?: number;
  energyLevel?: 'high' | 'medium' | 'low';
  difficultyScore?: number;
  priority?: number;
}

interface SubjectData {
  name: string;
  category: 'School' | 'LGS' | 'TYT' | 'AYT' | 'YDT';
  topics: (string | TopicData)[];
}

const subjectsData: SubjectData[] = [
  // ==================== OKUL (LİSE) - SADECE DERS ADI ====================
  {
    name: 'Matematik',
    category: 'School',
    topics: []
  },
  {
    name: 'Fizik',
    category: 'School',
    topics: []
  },
  {
    name: 'Kimya',
    category: 'School',
    topics: []
  },
  {
    name: 'Biyoloji',
    category: 'School',
    topics: []
  },
  {
    name: 'Türk Dili ve Edebiyatı',
    category: 'School',
    topics: []
  },
  {
    name: 'Tarih',
    category: 'School',
    topics: []
  },
  {
    name: 'Coğrafya',
    category: 'School',
    topics: []
  },
  {
    name: 'Felsefe',
    category: 'School',
    topics: []
  },
  {
    name: 'İngilizce',
    category: 'School',
    topics: []
  },
  {
    name: 'Din Kültürü ve Ahlak Bilgisi',
    category: 'School',
    topics: []
  },
  {
    name: 'Beden Eğitimi',
    category: 'School',
    topics: []
  },
  {
    name: 'Görsel Sanatlar',
    category: 'School',
    topics: []
  },
  {
    name: 'Müzik',
    category: 'School',
    topics: []
  },

  // ==================== LGS ====================
  {
    name: 'Türkçe',
    category: 'LGS',
    topics: [
      { name: 'Sözcükte Anlam (Gerçek, Yan, Mecaz)', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 5, priority: 8 },
      { name: 'Sözcük Türleri (İsim, Sıfat, Zamir)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Fiiller ve Fiilimsiler', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Cümle Türleri ve Ögeleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Noktalama İşaretleri', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 7 },
      { name: 'Yazım Kuralları', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 7 },
      { name: 'Ses Bilgisi ve Ses Olayları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Söz Sanatları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Metin Türleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Paragraf (Ana Fikir, Yardımcı Fikir)', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Anlatım Bozuklukları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 }
    ]
  },
  {
    name: 'Matematik',
    category: 'LGS',
    topics: [
      { name: 'Çarpanlar ve Katlar (EBOB-EKOK)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Üslü Sayılar', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Kareköklü Sayılar', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Veri Analizi', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 7 },
      { name: 'Basit Olayların Olasılığı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Cebirsel İfadeler ve Özdeşlikler', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Doğrusal Denklemler', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Eşitsizlikler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Üçgenler (Eşlik ve Benzerlik)', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Dönüşüm Geometrisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Geometrik Cisimler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Koni ve Küre', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 }
    ]
  },
  {
    name: 'Fen Bilimleri',
    category: 'LGS',
    topics: [
      { name: 'Mevsimler ve İklim', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'DNA ve Genetik Kod', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Kalıtım', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Basit Makineler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Enerji Dönüşümleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Kimyasal Tepkimeler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Asitler ve Bazlar', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Madde ve Endüstri', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Basınç', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Elektrik Yükleri ve Elektriklenme', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Elektrik Enerjisi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Maddenin Halleri ve Isı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Aydınlanma ve Ses', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 }
    ]
  },
  {
    name: 'T.C. İnkılap Tarihi ve Atatürkçülük',
    category: 'LGS',
    topics: [
      { name: 'Bir Kahraman Doğuyor', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Milli Uyanış', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'I. Dünya Savaşı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Milli Mücadeleye Hazırlık', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Milli Mücadele', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'TBMM\'nin Açılması', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Cephe Savaşları', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Lozan Barış Antlaşması', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'İnkılap Hareketleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Atatürk İlkeleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 10 }
    ]
  },
  {
    name: 'Din Kültürü ve Ahlak Bilgisi',
    category: 'LGS',
    topics: [
      { name: 'Kader İnancı', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Zekat ve Sadaka', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Hz. Musa (a.s.)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Hz. Yusuf (a.s.)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Hz. Muhammed\'in Örnekliği', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Kur\'an-ı Kerim ve Özellikleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 }
    ]
  },
  {
    name: 'İngilizce',
    category: 'LGS',
    topics: [
      { name: 'Friendship (Arkadaşlık)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Teen Life (Genç Yaşamı)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'In the Kitchen (Mutfakta)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Communication (İletişim)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'The Internet', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Adventures (Maceralar)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Tourism (Turizm)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Chores (Ev İşleri)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Tenses (Zamanlar)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Modal Verbs', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 }
    ]
  },

  // ==================== TYT ====================
  {
    name: 'Türkçe',
    category: 'TYT',
    topics: [
      { name: 'Sözcükte Anlam İlişkileri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Cümlede Anlam', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Paragrafta Anlatım Teknikleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Paragrafta Düşünceyi Geliştirme Yolları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Paragrafta Yapı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Paragrafta Ana Düşünce', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Ses Bilgisi ve Ses Olayları', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 },
      { name: 'Yazım Kuralları', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 7 },
      { name: 'Noktalama İşaretleri', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 7 },
      { name: 'Sözcük Yapısı (Kök, Gövde, Ek)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Sözcük Türleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Fiiller ve Fiilde Çatı', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Fiilimsi (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil)', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Anlatım Bozuklukları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 }
    ]
  },
  {
    name: 'Matematik',
    category: 'TYT',
    topics: [
      { name: 'Sayılar (Tam, Rasyonel, Reel)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Kümeler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Çarpanlar ve Katlar (EBOB-EKOK)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Üslü ve Köklü Sayılar', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Mutlak Değer', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Oran-Orantı ve Problemler', avgMinutes: 150, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Birinci Dereceden Denklemler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'İkinci Dereceden Denklemler', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Eşitsizlikler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Fonksiyonlar', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Polinomlar ve Çarpanlara Ayırma', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Permütasyon ve Kombinasyon', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Olasılık', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Logaritma', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Diziler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Sayı Problemleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Yüzde ve Kar-Zarar Problemleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Karışım Problemleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Hareket ve İşçi Problemleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 }
    ]
  },
  {
    name: 'Geometri',
    category: 'TYT',
    topics: [
      { name: 'Doğruda Açılar', avgMinutes: 60, energyLevel: 'low', difficultyScore: 3, priority: 5 },
      { name: 'Üçgende Açılar', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 4, priority: 6 },
      { name: 'Üçgenler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Üçgende Alan', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Dörtgenler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Çember ve Daire', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Analitik Geometri', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Katı Cisimler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      { name: 'Vektörler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 4, priority: 5 }
    ]
  },
  {
    name: 'Fizik',
    category: 'TYT',
    topics: [
      { name: 'Fizik Bilimine Giriş', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Vektörler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 4, priority: 5 },
      { name: 'Madde ve Özellikleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Hareket (Düzgün ve Düzgün Hızlanan)', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Bağıl Hareket', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Newton Hareket Yasaları', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Enerji (İş, Güç, Kinetik, Potansiyel)', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'İtme ve Momentum', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Basınç ve Kaldırma Kuvveti', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Elektrostatik', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Elektrik ve Manyetizma', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Dalgalar (Ses ve Işık)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 }
    ]
  },
  {
    name: 'Kimya',
    category: 'TYT',
    topics: [
      { name: 'Kimya Bilimi', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Atom ve Periyodik Sistem', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Kimyasal Bağlar', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Maddenin Halleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Karışımlar ve Çözelti', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Kimyasal Tepkimeler', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Kimyasal Hesaplamalar', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Asit-Baz-Tuz', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Mol Kavramı', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Kimya Her Yerde', avgMinutes: 60, energyLevel: 'low', difficultyScore: 3, priority: 4 }
    ]
  },
  {
    name: 'Biyoloji',
    category: 'TYT',
    topics: [
      { name: 'Yaşam Bilimi Biyoloji', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Hücre', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Hücre Zarı ve Madde Geçişi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Hücre Bölünmeleri (Mitoz-Mayoz)', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Kalıtım (Mendel Genetiği)', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Ekosistem Ekolojisi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Besin Zinciri ve Madde Döngüleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Çevre Sorunları', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 }
    ]
  },
  {
    name: 'Tarih',
    category: 'TYT',
    topics: [
      { name: 'İslam Tarihi ve Uygarlığı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Türk-İslam Devletleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Osmanlı Kuruluş ve Yükselme', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Osmanlı Duraklama ve Gerileme', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Osmanlı Islahat Hareketleri', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 }
    ]
  },
  {
    name: 'Coğrafya',
    category: 'TYT',
    topics: [
      { name: 'Harita Bilgisi ve Koordinat Sistemi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'İklim Elemanları ve İklim Tipleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Yerşekilleri ve Oluşumu', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Su Kaynakları', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      { name: 'Türkiye\'nin Coğrafi Bölgeleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Nüfus ve Yerleşme', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Ekonomik Faaliyetler', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 }
    ]
  },
  {
    name: 'Felsefe',
    category: 'TYT',
    topics: [
      { name: 'Felsefeye Giriş', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Bilgi Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Varlık Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Ahlak Felsefesi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Bilim Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 7 }
    ]
  },
  {
    name: 'Din Kültürü ve Ahlak Bilgisi',
    category: 'TYT',
    topics: [
      { name: 'Kur\'an ve Yorumu', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 },
      { name: 'Hz. Muhammed', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'İnanç Esasları', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'İbadetler', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Ahlak ve Din', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 }
    ]
  },

  // ==================== AYT ====================
  {
    name: 'Matematik',
    category: 'AYT',
    topics: [
      { name: 'Fonksiyonlar', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Polinomlar', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'İkinci Dereceden Denklemler', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Trigonometri', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Diziler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Üstel ve Logaritmik Fonksiyonlar', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 9 },
      { name: 'Limit ve Süreklilik', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Türev ve Uygulamaları', avgMinutes: 240, energyLevel: 'high', difficultyScore: 10, priority: 10 },
      { name: 'İntegral ve Uygulamaları', avgMinutes: 240, energyLevel: 'high', difficultyScore: 10, priority: 10 },
      { name: 'Olasılık ve İstatistik', avgMinutes: 150, energyLevel: 'medium', difficultyScore: 7, priority: 8 }
    ]
  },
  {
    name: 'Geometri',
    category: 'AYT',
    topics: [
      { name: 'Dönüşüm Geometrisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Üçgenler', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Çokgenler', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Çember ve Daire', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Katı Cisimler', avgMinutes: 150, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Analitik Geometri', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 9 },
      { name: 'Konik Kesitler', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 7 }
    ]
  },
  {
    name: 'Fizik',
    category: 'AYT',
    topics: [
      { name: 'Kuvvet ve Hareket', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'İş, Güç ve Enerji', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Çembersel Hareket', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Düzgün Dairesel Hareket', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Elektrik ve Manyetizma', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Dalgalar ve Optik', avgMinutes: 150, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Modern Fizik', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 8 },
      { name: 'Atom Fiziği', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 7 }
    ]
  },
  {
    name: 'Kimya',
    category: 'AYT',
    topics: [
      { name: 'Kimyanın Temel Kanunları', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Atom ve Periyodik Sistem', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Kimyasal Bağlar', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Gazlar', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Çözeltiler ve Derişim', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Asit-Baz Dengesi', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 9 },
      { name: 'Elektrokimya', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Organik Kimya', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 9 }
    ]
  },
  {
    name: 'Biyoloji',
    category: 'AYT',
    topics: [
      { name: 'Hücre Bölünmesi ve Kalıtım', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Genetik (DNA, RNA, Protein Sentezi)', avgMinutes: 180, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Bitki Biyolojisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Hayvan Biyolojisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Dolaşım Sistemleri', avgMinutes: 150, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Sinir Sistemi', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Hormonlar', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Ekosistem', avgMinutes: 90, energyLevel: 'low', difficultyScore: 6, priority: 6 }
    ]
  },
  {
    name: 'Türk Dili ve Edebiyatı',
    category: 'AYT',
    topics: [
      { name: 'İslamiyet Öncesi Türk Edebiyatı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Geçiş Dönemi Edebiyatı', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 4, priority: 6 },
      { name: 'Divan Edebiyatı', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 8 },
      { name: 'Halk Edebiyatı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Tanzimat Dönemi Edebiyatı', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Milli Edebiyat Dönemi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Cumhuriyet Dönemi Edebiyatı', avgMinutes: 150, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Modern Türk Edebiyatı', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Şiir Analizi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Nesir (Roman, Hikaye, Tiyatro)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Edebi Akımlar', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 }
    ]
  },
  {
    name: 'Tarih',
    category: 'AYT',
    topics: [
      { name: 'İslam Tarihi ve Uygarlığı', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Türk-İslam Devletleri', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Osmanlı Devleti (13-15. Yüzyıl)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Osmanlı Devleti (16-18. Yüzyıl)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'I. Dünya Savaşı ve Sonuçları', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Kurtuluş Savaşı', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Atatürk Dönemi', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'II. Dünya Savaşı ve Sonrası', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 }
    ]
  },
  {
    name: 'Coğrafya',
    category: 'AYT',
    topics: [
      { name: 'Doğa ve İnsan', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Yerşekilleri', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'İklim', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Türkiye\'nin Fiziki Coğrafyası', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Beşeri Coğrafya', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Ekonomik Coğrafya', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Türkiye\'nin Beşeri Özellikleri', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 6, priority: 8 }
    ]
  },
  {
    name: 'Felsefe',
    category: 'AYT',
    topics: [
      { name: 'Felsefe ve Mantık', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Bilgi Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Varlık Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Ahlak Felsefesi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Bilim Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Siyaset Felsefesi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      { name: 'Sanat Felsefesi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      { name: 'Din Felsefesi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      { name: 'İlk Çağ Felsefesi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Orta Çağ Felsefesi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: '16-19. Yüzyıl Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: '20. Yüzyıl Felsefesi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 }
    ]
  },
  {
    name: 'Mantık',
    category: 'AYT',
    topics: [
      { name: 'Mantığa Giriş', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Klasik Mantık', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Mantık ve Dil', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Sembolik Mantık', avgMinutes: 150, energyLevel: 'high', difficultyScore: 9, priority: 8 },
      { name: 'Önermeler ve Çıkarımlar', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 }
    ]
  },
  {
    name: 'Psikoloji',
    category: 'AYT',
    topics: [
      { name: 'Psikoloji Bilimini Tanıyalım', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Psikolojinin Temel Süreçleri', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Algı ve Dikkat', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Öğrenme ve Bellek', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Düşünme ve Dil', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Zeka ve Yaratıcılık', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Motivasyon ve Duygu', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 },
      { name: 'Ruh Sağlığının Temelleri', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 }
    ]
  },
  {
    name: 'Sosyoloji',
    category: 'AYT',
    topics: [
      { name: 'Sosyolojiye Giriş', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Birey ve Toplum', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Toplumsal Yapı', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Toplumsal Değişme ve Gelişme', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Toplum ve Kültür', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Toplumsal Kurumlar (Aile, Eğitim, Din)', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Toplumsal Tabakalaşma', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      { name: 'Kentleşme ve Kentsel Sorunlar', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 6 }
    ]
  },
  {
    name: 'Din Kültürü ve Ahlak Bilgisi',
    category: 'AYT',
    topics: [
      { name: 'Hz. Muhammed (S.A.V)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Kur\'an\'a Göre Hz. Muhammed', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Peygamberlik ve Hz. Muhammed', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'İslam ve İbadetler', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'İslam Ahlakı', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Din ve Hayat', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 6 },
      { name: 'Din, Kültür ve Medeniyet', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 6 }
    ]
  },

  // ==================== YDT ====================
  {
    name: 'İngilizce',
    category: 'YDT',
    topics: [
      // Tenses (Zamanlar)
      { name: 'Simple Present Tense', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 9 },
      { name: 'Present Continuous Tense', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 9 },
      { name: 'Present Perfect Tense', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Present Perfect Continuous', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Simple Past Tense', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 9 },
      { name: 'Past Continuous Tense', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 8 },
      { name: 'Past Perfect Tense', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Past Perfect Continuous', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 6 },
      { name: 'Future Tenses (Will, Going to)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 5, priority: 8 },
      { name: 'Future Continuous', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      { name: 'Future Perfect', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 6 },
      
      // Prepositions (Edatlar)
      { name: 'Time Prepositions (in, on, at)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 8 },
      { name: 'Place Prepositions', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 8 },
      { name: 'Movement Prepositions', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 5, priority: 7 },
      { name: 'Dependent Prepositions', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      
      // Conjunctions (Bağlaçlar)
      { name: 'Coordinating Conjunctions', avgMinutes: 60, energyLevel: 'low', difficultyScore: 4, priority: 8 },
      { name: 'Subordinating Conjunctions', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Correlative Conjunctions', avgMinutes: 60, energyLevel: 'medium', difficultyScore: 5, priority: 6 },
      
      // Modal Verbs
      { name: 'Modal Verbs (Can, Could, May, Might)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Modal Verbs (Must, Should, Ought to)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      
      // Other Grammar
      { name: 'Passive Voice', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Reported Speech (Indirect Speech)', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 8 },
      { name: 'Conditionals (If Clauses Type 0-3)', avgMinutes: 150, energyLevel: 'high', difficultyScore: 9, priority: 10 },
      { name: 'Relative Clauses', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Causative Verbs (Have/Get Something Done)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 },
      { name: 'Wish Clauses', avgMinutes: 90, energyLevel: 'high', difficultyScore: 8, priority: 7 },
      { name: 'Gerund and Infinitive', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Quantifiers (Some, Any, Much, Many)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 7 },
      { name: 'Articles (A, An, The)', avgMinutes: 60, energyLevel: 'low', difficultyScore: 5, priority: 7 },
      
      // Vocabulary
      { name: 'Phrasal Verbs', avgMinutes: 120, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Idioms and Expressions', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 8 },
      { name: 'Collocations', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Synonyms and Antonyms', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 9 },
      { name: 'Word Formation', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 7 },
      
      // Reading & Skills
      { name: 'Reading Comprehension', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Cloze Test (Sentence Completion)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Paragraph Completion', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Dialogue Completion', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Finding Irrelevant Sentence', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Paraphrasing (Similar Meaning)', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 7, priority: 7 }
    ]
  },
  {
    name: 'Almanca',
    category: 'YDT',
    topics: [
      { name: 'Temel Dil Bilgisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Zamanlar ve Fiil Çekimleri', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Artikel Kullanımı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Cümle Yapısı ve Sözdizimi', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Okuma Anlama', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Kelime Bilgisi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 }
    ]
  },
  {
    name: 'Fransızca',
    category: 'YDT',
    topics: [
      { name: 'Temel Dil Bilgisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Fiil Çekimleri ve Zamanlar', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Artikel Kullanımı', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 },
      { name: 'Cümle Yapısı', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Okuma Anlama', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Kelime Bilgisi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 }
    ]
  },
  {
    name: 'Arapça',
    category: 'YDT',
    topics: [
      { name: 'Temel Dil Bilgisi', avgMinutes: 120, energyLevel: 'medium', difficultyScore: 7, priority: 9 },
      { name: 'Fiil Çekimleri', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 9 },
      { name: 'Cümle Yapısı', avgMinutes: 120, energyLevel: 'high', difficultyScore: 7, priority: 9 },
      { name: 'Okuma Anlama', avgMinutes: 150, energyLevel: 'high', difficultyScore: 8, priority: 10 },
      { name: 'Kelime Bilgisi', avgMinutes: 90, energyLevel: 'medium', difficultyScore: 6, priority: 8 }
    ]
  }
];

console.log('🚀 Veritabanına dersler ve konular ekleniyor...\n');

db.exec('BEGIN TRANSACTION');

try {
  const findSubject = db.prepare(`
    SELECT id FROM subjects WHERE name = ? AND category = ?
  `);

  const insertSubject = db.prepare(`
    INSERT INTO subjects (id, name, category, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);

  const findTopic = db.prepare(`
    SELECT id FROM topics WHERE subjectId = ? AND name = ?
  `);

  const insertTopic = db.prepare(`
    INSERT INTO topics (
      id, subjectId, name, "order", avgMinutes, energyLevel, 
      difficultyScore, priority, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  let subjectInserted = 0;
  let subjectSkipped = 0;
  let topicInserted = 0;
  let topicSkipped = 0;

  for (const subjectData of subjectsData) {
    let subjectId: string;
    const existingSubject = findSubject.get(subjectData.name, subjectData.category) as { id: string } | undefined;
    
    if (existingSubject) {
      subjectId = existingSubject.id;
      subjectSkipped++;
      console.log(`⏭️  ${subjectData.category} - ${subjectData.name} (zaten mevcut)`);
    } else {
      subjectId = uuidv4();
      insertSubject.run(subjectId, subjectData.name, subjectData.category);
      subjectInserted++;
      console.log(`✅ ${subjectData.category} - ${subjectData.name} (eklendi)`);
    }
    
    // Sadece School kategorisi DEĞİLSE konuları ekle
    if (subjectData.category !== 'School') {
      subjectData.topics.forEach((topicData, index) => {
        const topicName = typeof topicData === 'string' ? topicData : topicData.name;
        const avgMinutes = typeof topicData === 'object' ? topicData.avgMinutes || 60 : 60;
        const energyLevel = typeof topicData === 'object' ? topicData.energyLevel || 'medium' : 'medium';
        const difficultyScore = typeof topicData === 'object' ? topicData.difficultyScore : undefined;
        const priority = typeof topicData === 'object' ? topicData.priority : undefined;
        
        const existingTopic = findTopic.get(subjectId, topicName) as { id: string } | undefined;
        
        if (existingTopic) {
          topicSkipped++;
          console.log(`   ⏭️  ${topicName} (zaten mevcut)`);
        } else {
          const topicId = uuidv4();
          insertTopic.run(
            topicId, 
            subjectId, 
            topicName, 
            index + 1,
            avgMinutes,
            energyLevel,
            difficultyScore,
            priority
          );
          topicInserted++;
          console.log(`   📝 ${topicName} (${avgMinutes} dk - eklendi)`);
        }
      });
    } else {
      console.log(`   ℹ️   Okul dersi - konu eklenmedi`);
    }
    
    console.log('');
  }

  db.exec('COMMIT');
  
  console.log('✨ İşlem tamamlandı!');
  console.log(`📊 Yeni eklenen: ${subjectInserted} ders, ${topicInserted} konu`);
  console.log(`⏭️  Atlanan: ${subjectSkipped} ders, ${topicSkipped} konu`);
  
  const stats = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM subjects 
    WHERE category IS NOT NULL 
    GROUP BY category
  `).all();
  
  console.log('\n📈 Veritabanı toplam:');
  stats.forEach((stat: any) => {
    const topicCountForCategory = db.prepare(`
      SELECT COUNT(*) as count 
      FROM topics t 
      JOIN subjects s ON t.subjectId = s.id 
      WHERE s.category = ?
    `).get(stat.category) as any;
    
    console.log(`   ${stat.category}: ${stat.count} ders, ${topicCountForCategory.count} konu`);
  });

} catch (error) {
  db.exec('ROLLBACK');
  console.error('❌ Hata oluştu:', error);
  throw error;
} finally {
  db.close();
}