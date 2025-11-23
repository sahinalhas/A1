# 📚 Konu Takibi Sistemi - Kapsamlı Geliştirme Planı

**Tarih:** 23 Kasım 2025  
**Amaç:** Öğrencilerin konu bazlı çalışma performansını kaydetmek, izlemek ve analiz etmek.

---

## 🎯 GENEL BAKIŞ

### Sistemin Amacı
- Öğrenciler hangi konularda çalıştıklarını ve performanslarını kaydetmek
- Konu bazında ustalık seviyesi takibi (5 seviye: Başlanmadı → Uzman)
- Güçlü/zayıf konuları otomatik tespit etmek
- Sınıf geneli performans karşılaştırması yapmak
- Hedef sınavlara göre (LGS, TYT, AYT, YDT) esnek filtreleme

### Kullanım Senaryosu
1. **Rehber öğretmen** konu bazlı çalışma planı hazırlar
2. **Öğrenci** o hafta planlanan konuları çalışır
3. **Rehber** öğrenci geldiğinde performansı girer (kaç soru, kaç doğru/yanlış, zorluk)
4. **Sistem** otomatik ustalık seviyesi hesaplar
5. **Rehber** öğrenci profilinde detaylı analiz görür
6. **Rehber** raporlar sayfasında sınıf geneli karşılaştırma yapar

---

## 🗄️ 1. VERİTABANI ŞEMASI

### Yeni Tablo: `topic_performance`

```sql
CREATE TABLE topic_performance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  date TEXT NOT NULL,
  questions_solved INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  duration_minutes INTEGER,
  difficulty_feedback TEXT CHECK(difficulty_feedback IN ('very_easy', 'easy', 'medium', 'hard', 'very_hard')),
  notes TEXT,
  mastery_level INTEGER DEFAULT 0,
  success_rate REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX idx_topic_performance_student ON topic_performance(student_id);
CREATE INDEX idx_topic_performance_topic ON topic_performance(topic_id);
CREATE INDEX idx_topic_performance_date ON topic_performance(date DESC);
```

### Öğrenci Tablosuna Ekleme: `target_exams`

```sql
ALTER TABLE students ADD COLUMN target_exams TEXT DEFAULT '[]';
-- JSON array: ["TYT", "AYT"] gibi
```

**Alan Açıklamaları:**
- `questions_solved`: Toplam çözülen soru sayısı
- `correct_answers`: Doğru cevap sayısı
- `wrong_answers`: Yanlış cevap sayısı
- `duration_minutes`: Çalışma süresi (dakika)
- `difficulty_feedback`: Öğrencinin zorluk geribildirimi
- `mastery_level`: Ustalık seviyesi (0-100)
- `success_rate`: Başarı yüzdesi (otomatik hesaplanan)
- `target_exams`: Öğrencinin hedef sınavları (LGS, TYT, AYT, YDT)

---

## 🔧 2. BACKEND API

### Dizin Yapısı
```
server/features/topic-performance/
├── types/
│   └── topic-performance.types.ts
├── repository/
│   └── topic-performance.repository.ts
├── services/
│   ├── topic-performance.service.ts
│   └── mastery-calculator.service.ts
├── routes/
│   └── topic-performance.routes.ts
└── index.ts
```

### API Endpoint'leri

#### Performans Yönetimi
- `POST /api/topic-performance` - Yeni performans kaydı oluştur
- `GET /api/topic-performance/student/:studentId` - Öğrencinin tüm performans kayıtları
- `GET /api/topic-performance/topic/:topicId/student/:studentId` - Belirli konuya ait kayıtlar
- `PUT /api/topic-performance/:id` - Performans kaydı güncelle
- `DELETE /api/topic-performance/:id` - Performans kaydı sil

#### Analitik
- `GET /api/topic-performance/analytics/student/:studentId` - Öğrenci analitikleri
  - Ustalık dağılımı (kaç konu başlanmadı, devam ediyor, uzman)
  - Güçlü/zayıf konular listesi (en iyi 5, en kötü 5)
  - Ders bazında ortalama başarı oranı
  - Zaman içinde ilerleme trendi

- `GET /api/topic-performance/analytics/class` - Sınıf geneli analitik
  - Query params: `?examType=TYT&grade=11&section=A`
  - Sınıf ortalaması
  - Hangi konularda sınıf zayıf (heatmap verisi)
  - Öğrenci karşılaştırma verisi

- `GET /api/topic-performance/mastery-summary/:studentId` - Ustalık özeti
  - Sınav tipine göre (LGS, TYT, AYT, YDT) ayrı ayrı
  - Her ders için toplam/tamamlanan konu sayısı

#### Hedef Sınav Yönetimi
- `PUT /api/students/:id/target-exams` - Öğrencinin hedef sınavlarını güncelle
  - Body: `{ targetExams: ["TYT", "AYT"] }`

### Servis Katmanı Fonksiyonları

#### topic-performance.service.ts
```typescript
- createPerformanceRecord(data): Promise<TopicPerformance>
- getStudentPerformances(studentId, filters?): Promise<TopicPerformance[]>
- getTopicPerformanceHistory(studentId, topicId): Promise<TopicPerformance[]>
- updatePerformanceRecord(id, data): Promise<void>
- deletePerformanceRecord(id): Promise<void>
- getStudentAnalytics(studentId): Promise<StudentAnalytics>
- getClassAnalytics(filters): Promise<ClassAnalytics>
```

#### mastery-calculator.service.ts
```typescript
- calculateMasteryLevel(performances: TopicPerformance[]): number
- calculateSuccessRate(correct, total): number
- getDifficultyWeight(difficulty): number
- getStudyFrequencyBonus(performances): number
- identifyWeakTopics(studentId): Promise<Topic[]>
- identifyStrongTopics(studentId): Promise<Topic[]>
```

---

## 🎨 3. FRONTEND - KONU PLANLAYICI (Hızlı Giriş)

### Dosya: `client/components/features/student-profile/TopicPlanner.tsx`

### Değişiklikler
1. Her konunun yanında **"✓ Sonuç Gir"** butonu ekle
2. Butona tıklayınca **QuickPerformanceDialog** componenti açılır
3. Dialog içinde hızlı form:
   - Konu adı (otomatik doldurulmuş, readonly)
   - Kaç soru çözdü? (number input)
   - Kaç doğru? (number input)
   - Kaç yanlış? (number input - otomatik hesaplanabilir)
   - Süre (dakika) (number input)
   - Zorluk: Radio buttons (Çok Kolay | Kolay | Orta | Zor | Çok Zor)
   - Not (textarea, opsiyonel)
   - [Kaydet] [İptal] butonları

### Yeni Component
```
client/components/features/topic-performance/
└── QuickPerformanceDialog.tsx
```

### Özellikler
- Form validasyonu (doğru sayısı toplam sorudan fazla olamaz)
- Otomatik hesaplama (doğru girince yanlış otomatik hesaplanır)
- Başarı yüzdesi önizlemesi
- Kaydet sonrası toast bildirimi
- Plan listesi refresh edilir

---

## 📊 4. FRONTEND - ÖĞRENCİ PROFİLİ (Detaylı Takip)

### Dosya: `client/pages/StudentProfile/StudentProfile.tsx`

### Yeni Sekme: "Konu Takibi"
- Diğer sekmelerle (Academic, Counseling, etc.) yan yana
- Tab label: "Konu Takibi" veya "📚 Konu Takibi"

### Component Yapısı
```
client/components/features/topic-performance/
├── TopicTrackingTab.tsx (Ana container)
├── PerformanceEntryForm.tsx (Manuel veri giriş formu)
├── MasterySummaryCard.tsx (Genel durum kartı)
├── TopicMasteryList.tsx (Konu listesi + ustalık göstergesi)
├── ProgressChart.tsx (Zaman içinde ilerleme grafiği)
├── SubjectHeatmap.tsx (Ders bazlı heatmap)
└── TopTopicsCard.tsx (En iyi/en kötü 5 konu)
```

### TopicTrackingTab.tsx İçeriği

#### Üst Bölüm: Filtreler ve Özet
```
┌─────────────────────────────────────────────────────┐
│ Hedef Sınavlar: [TYT ✓] [AYT ✓] [YDT] [LGS]       │
│ Sınav Tipi Filtresi: [Tümü ▼] | Ders: [Tümü ▼]    │
│ [+ Performans Gir] butonu                           │
└─────────────────────────────────────────────────────┘
```

#### Orta Bölüm: Özet Kartlar (Grid Layout)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Başlanmadı   │   Tanıdık    │     Orta     │     İyi      │
│   🔴 45      │   🟠 38      │   🟡 24      │   🟢 18      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Alt Bölüm: Sekmeler
- **Konular** (TopicMasteryList): Tüm konular ve ustalık seviyeleri
- **Grafikler** (ProgressChart + SubjectHeatmap): Görselleştirmeler
- **Analiz** (TopTopicsCard): Güçlü/zayıf konular

### MasterySummaryCard.tsx
- Toplam konu sayısı
- Ustalık seviyelerine göre dağılım (Pie chart veya bar chart)
- Ortalama başarı oranı
- En son ne zaman çalışıldı

### TopicMasteryList.tsx
```
┌─────────────────────────────────────────────────────────┐
│ Matematik - TYT                                          │
│ ├─ Üçgenler (Eşlik ve Benzerlik) ███████░░ 70% İyi     │
│ ├─ Denklemler                     ████░░░░░ 40% Orta    │
│ ├─ Fonksiyonlar                   ██░░░░░░░ 20% Tanıdık│
│ └─ İntegral                       ░░░░░░░░░  0% -       │
└─────────────────────────────────────────────────────────┘
```

Her satırda:
- Konu adı
- Progress bar (renk kodlu)
- Yüzde
- Seviye etiketi
- [Detay] butonu (performans geçmişini gösterir)

### ProgressChart.tsx
- Line chart (Recharts kullanarak)
- X ekseni: Tarih
- Y ekseni: Ortalama başarı yüzdesi
- Farklı dersler için farklı çizgiler

### SubjectHeatmap.tsx
- Grid layout (satır: dersler, sütun: konular veya zaman)
- Renk yoğunluğu: Ustalık seviyesini gösterir
- Tooltip: Konu adı ve detaylı bilgi

---

## 📈 5. FRONTEND - RAPORLAR SAYFASI (Toplu Analiz)

### Dosya: `client/pages/Reports.tsx`

### Yeni Sekme: "Konu Performansı"
- Mevcut sekmelerin yanına eklenir
- Tab label: "Konu Performansı" veya "📚 Konu Performansı"

### Component Yapısı
```
client/components/features/reports/
├── TopicPerformanceReport.tsx (Ana container)
├── ClassHeatmap.tsx (Sınıf geneli heatmap)
├── StudentComparisonTable.tsx (Öğrenci karşılaştırma)
└── ClassTrendChart.tsx (Sınıf geneli trend grafiği)
```

### TopicPerformanceReport.tsx İçeriği

#### Üst Bölüm: Filtreler
```
┌─────────────────────────────────────────────────────┐
│ Sınıf: [11-A ▼] | Sınav Tipi: [TYT ▼]             │
│ Tarih Aralığı: [01.09.2025] - [23.11.2025]        │
│ [Filtrele] [Excel'e Aktar]                         │
└─────────────────────────────────────────────────────┘
```

#### Orta Bölüm: Sınıf Geneli Heatmap
```
ClassHeatmap:
- Satırlar: Konular
- Sütunlar: Öğrenciler veya Dersler
- Renkler: Kırmızı (zayıf) → Yeşil (güçlü)
- Tıklanabilir hücreler (detay gösterir)
```

#### Alt Bölüm: İstatistikler ve Tablolar
```
Sekmeler:
- Özet İstatistikler (ortalama başarı, en zor konu, vb.)
- Öğrenci Karşılaştırması (tablo)
- Trend Grafikleri (çizgi grafik)
```

### StudentComparisonTable.tsx
```
┌──────────────┬───────────┬───────────┬───────────┬──────────┐
│ Öğrenci      │ Matematik │   Fizik   │   Kimya   │ Ortalama │
├──────────────┼───────────┼───────────┼───────────┼──────────┤
│ Ahmet Y.     │   85%     │   72%     │   68%     │   75%    │
│ Ayşe K.      │   90%     │   88%     │   82%     │   87%    │
│ Mehmet T.    │   65%     │   70%     │   75%     │   70%    │
└──────────────┴───────────┴───────────┴───────────┴──────────┘
```

---

## 🧮 6. USTALIK SEVİYESİ HESAPLAMA

### Algoritma: `mastery-calculator.service.ts`

```typescript
function calculateMasteryLevel(performances: TopicPerformance[]): number {
  if (performances.length === 0) return 0;
  
  // 1. En son performansları al (son 5 kayıt)
  const recentPerformances = performances.slice(-5);
  
  // 2. Başarı oranı hesapla
  const avgSuccessRate = recentPerformances.reduce((sum, p) => {
    return sum + (p.correct_answers / p.questions_solved * 100);
  }, 0) / recentPerformances.length;
  
  // 3. Zorluk ağırlığı uygula
  const difficultyWeight = getDifficultyWeight(recentPerformances);
  
  // 4. Çalışma sıklığı bonusu
  const frequencyBonus = getStudyFrequencyBonus(performances);
  
  // 5. Final ustalık skoru
  let mastery = avgSuccessRate * difficultyWeight * frequencyBonus;
  
  // 6. 0-100 aralığına sınırla
  return Math.min(100, Math.max(0, Math.round(mastery)));
}

function getDifficultyWeight(performances: TopicPerformance[]): number {
  const weights = {
    very_easy: 0.5,
    easy: 0.7,
    medium: 1.0,
    hard: 1.3,
    very_hard: 1.5
  };
  
  const avgWeight = performances.reduce((sum, p) => {
    return sum + (weights[p.difficulty_feedback] || 1.0);
  }, 0) / performances.length;
  
  return avgWeight;
}

function getStudyFrequencyBonus(performances: TopicPerformance[]): number {
  // Son 30 günde kaç kez çalışıldı?
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCount = performances.filter(p => 
    new Date(p.date) >= thirtyDaysAgo
  ).length;
  
  // Bonus: 0-10 kez: 0.8, 10-20 kez: 1.0, 20+ kez: 1.2
  if (recentCount >= 20) return 1.2;
  if (recentCount >= 10) return 1.0;
  return 0.8;
}
```

### Ustalık Seviyeleri ve Renkler

| Seviye | Aralık | Renk | Tailwind Class | Açıklama |
|--------|--------|------|----------------|----------|
| Başlanmadı | 0-20 | Kırmızı | `bg-red-500` | Henüz çalışılmamış veya çok az ilerleme |
| Tanıdık | 21-40 | Turuncu | `bg-orange-500` | Temel kavramlar öğrenildi |
| Orta | 41-60 | Sarı | `bg-yellow-500` | Orta düzey hakimiyet |
| İyi | 61-80 | Açık Yeşil | `bg-lime-500` | İyi seviyede hakimiyet |
| Uzman | 81-100 | Koyu Yeşil | `bg-green-600` | Tam hakimiyet |

---

## 🎯 7. HEDEF SINAV YÖNETİMİ

### Öğrenci Profilinde Hedef Sınav Seçimi

**Konum:** Öğrenci Profil Sayfası → Üst Bilgiler Bölümü

```
┌─────────────────────────────────────────────────────┐
│ Ahmet Yılmaz - 11-A                                 │
│ Hedef Sınavlar: [✓ TYT] [✓ AYT] [ ] YDT [ ] LGS   │
└─────────────────────────────────────────────────────┘
```

### Filtreleme Mantığı

#### Konu Takibi Sekmesinde
```typescript
// Varsayılan: Sadece hedef sınavların konuları
const filteredTopics = topics.filter(topic => 
  student.targetExams.includes(topic.category)
);

// Toggle açıksa: Tüm konular
if (showAllTopics) {
  filteredTopics = topics;
}
```

#### Filtre UI
```
┌─────────────────────────────────────────────────────┐
│ Göster: [●] Hedef Sınavlar (TYT, AYT)              │
│         [ ] Tüm Konular                             │
│                                                      │
│ Sınav Tipi: [Tümü ▼] [TYT] [AYT] [YDT] [LGS]      │
└─────────────────────────────────────────────────────┘
```

### Raporlar Sayfasında
- Filtre: "Sınav Tipi" dropdown menüsü
- Sadece o sınav tipine çalışan öğrenciler listelenir
- Örn: "TYT seçildiğinde, hedef sınavlarında TYT olan tüm öğrenciler"

---

## 🎨 8. GÖRSEL TASARIM REHBERİ

### Renk Paleti

**Ustalık Seviyeleri:**
```css
--mastery-not-started: #EF4444;   /* Kırmızı */
--mastery-familiar: #F97316;      /* Turuncu */
--mastery-medium: #EAB308;        /* Sarı */
--mastery-good: #84CC16;          /* Açık Yeşil */
--mastery-expert: #22C55E;        /* Koyu Yeşil */
```

**Zorluk Seviyeleri:**
```css
--difficulty-very-easy: #DBEAFE;  /* Çok Açık Mavi */
--difficulty-easy: #93C5FD;       /* Açık Mavi */
--difficulty-medium: #60A5FA;     /* Orta Mavi */
--difficulty-hard: #3B82F6;       /* Koyu Mavi */
--difficulty-very-hard: #1E40AF;  /* Çok Koyu Mavi */
```

### UI Componentleri

**Progress Bar (Ustalık Göstergesi):**
```tsx
<div className="w-full bg-gray-200 rounded-full h-3">
  <div 
    className={`h-3 rounded-full transition-all ${getMasteryColor(level)}`}
    style={{ width: `${level}%` }}
  />
</div>
```

**Badge (Seviye Etiketi):**
```tsx
<Badge className={getMasteryBadgeClass(level)}>
  {getMasteryLabel(level)}
</Badge>
```

**Heatmap Cell:**
```tsx
<div 
  className={`w-12 h-12 rounded ${getMasteryHeatColor(level)}`}
  title={`${topic.name}: ${level}%`}
/>
```

### İkonlar (Lucide React)

- **Performans Giriş:** `PlusCircle`, `ClipboardEdit`
- **Başarı:** `TrendingUp`, `Award`
- **Zayıf Konular:** `AlertTriangle`, `TrendingDown`
- **Zorluk:** `Zap` (kolay), `Flame` (zor)
- **Süre:** `Clock`
- **Soru:** `FileQuestion`
- **Analitik:** `BarChart3`, `PieChart`

---

## 📋 9. GELIŞTIRME ADIMLARI (Sıralı)

### Faz 1: Veritabanı ve Backend (Backend Developer)
- [ ] 1.1. `topic_performance` tablosu oluştur (schema)
- [ ] 1.2. `students` tablosuna `target_exams` alanı ekle
- [ ] 1.3. Repository oluştur (`topic-performance.repository.ts`)
- [ ] 1.4. Servis oluştur (`topic-performance.service.ts`)
- [ ] 1.5. Ustalık hesaplama servisi (`mastery-calculator.service.ts`)
- [ ] 1.6. API routes oluştur (`topic-performance.routes.ts`)
- [ ] 1.7. API'yi ana `index.ts`'e bağla
- [ ] 1.8. Hedef sınav güncelleme endpoint'i (`PUT /api/students/:id/target-exams`)

### Faz 2: Hızlı Performans Girişi (Frontend Developer)
- [ ] 2.1. `QuickPerformanceDialog.tsx` componenti oluştur
- [ ] 2.2. `TopicPlanner.tsx`'e "Sonuç Gir" butonu ekle
- [ ] 2.3. Dialog'u butona bağla
- [ ] 2.4. Form validasyonu ekle
- [ ] 2.5. API entegrasyonu (POST `/api/topic-performance`)
- [ ] 2.6. Başarılı kayıt sonrası toast ve refresh

### Faz 3: Öğrenci Profili - Konu Takibi Sekmesi (Frontend Developer)
- [ ] 3.1. `TopicTrackingTab.tsx` ana component oluştur
- [ ] 3.2. `MasterySummaryCard.tsx` oluştur (özet kartlar)
- [ ] 3.3. `TopicMasteryList.tsx` oluştur (konu listesi)
- [ ] 3.4. `ProgressChart.tsx` oluştur (zaman grafiği)
- [ ] 3.5. `SubjectHeatmap.tsx` oluştur (heatmap)
- [ ] 3.6. `TopTopicsCard.tsx` oluştur (en iyi/kötü 5)
- [ ] 3.7. `PerformanceEntryForm.tsx` oluştur (manuel giriş)
- [ ] 3.8. Hedef sınav seçici ekle (checkboxes)
- [ ] 3.9. Filtre mantığı ekle (hedef sınavlar/tümü)
- [ ] 3.10. API entegrasyonu (GET analytics)
- [ ] 3.11. StudentProfile.tsx'e sekme ekle

### Faz 4: Raporlar Sayfası - Toplu Analiz (Frontend Developer)
- [ ] 4.1. `TopicPerformanceReport.tsx` ana component oluştur
- [ ] 4.2. `ClassHeatmap.tsx` oluştur (sınıf heatmap)
- [ ] 4.3. `StudentComparisonTable.tsx` oluştur (karşılaştırma)
- [ ] 4.4. `ClassTrendChart.tsx` oluştur (trend grafiği)
- [ ] 4.5. Filtre bölümü (sınıf, sınav tipi, tarih)
- [ ] 4.6. API entegrasyonu (GET class analytics)
- [ ] 4.7. Excel export özelliği
- [ ] 4.8. Reports.tsx'e sekme ekle

### Faz 5: Test ve İyileştirme (QA & Developer)
- [ ] 5.1. Backend endpoint'leri test et (Postman/Thunder Client)
- [ ] 5.2. Frontend componentleri test et (manuel UI test)
- [ ] 5.3. Ustalık hesaplama doğruluğunu kontrol et
- [ ] 5.4. Heatmap renk geçişlerini kontrol et
- [ ] 5.5. Responsive tasarımı test et (mobil/tablet)
- [ ] 5.6. Hata durumları test et (validation, empty states)
- [ ] 5.7. Performans optimizasyonu (lazy loading, memoization)
- [ ] 5.8. Progress tracker güncelle ve tamamla

---

## 🔍 10. TEKNİK NOTLAR

### Kullanılacak Teknolojiler
- **Backend:** Express.js, Better-SQLite3
- **Frontend:** React, TypeScript
- **UI Kütüphaneleri:** Radix UI, Tailwind CSS
- **Grafikler:** Recharts
- **Form Yönetimi:** React Hook Form + Zod
- **State Management:** React Query (Tanstack Query)

### API Response Formatları

**TopicPerformance:**
```typescript
{
  id: string;
  studentId: string;
  topicId: string;
  date: string;
  questionsSolved: number;
  correctAnswers: number;
  wrongAnswers: number;
  durationMinutes: number;
  difficultyFeedback: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  notes?: string;
  masteryLevel: number;
  successRate: number;
  createdAt: string;
}
```

**StudentAnalytics:**
```typescript
{
  studentId: string;
  totalTopics: number;
  masteryDistribution: {
    notStarted: number;    // 0-20
    familiar: number;      // 21-40
    medium: number;        // 41-60
    good: number;          // 61-80
    expert: number;        // 81-100
  };
  averageSuccessRate: number;
  strongTopics: Topic[];   // Top 5
  weakTopics: Topic[];     // Bottom 5
  subjectAverages: {
    subjectId: string;
    subjectName: string;
    averageSuccessRate: number;
    masteryLevel: number;
  }[];
  progressTrend: {
    date: string;
    averageSuccessRate: number;
  }[];
}
```

**ClassAnalytics:**
```typescript
{
  classInfo: {
    grade: number;
    section: string;
    examType: string;
  };
  studentCount: number;
  topicCount: number;
  classAverageSuccess: number;
  weakTopics: {
    topicId: string;
    topicName: string;
    averageSuccess: number;
    studentCount: number;
  }[];
  heatmapData: {
    topicId: string;
    topicName: string;
    students: {
      studentId: string;
      studentName: string;
      masteryLevel: number;
    }[];
  }[];
  studentComparison: {
    studentId: string;
    studentName: string;
    subjects: {
      subjectId: string;
      subjectName: string;
      averageSuccess: number;
    }[];
    overallAverage: number;
  }[];
}
```

### Performans Optimizasyonu
- **Pagination:** Konu listesi için (varsayılan: 50 konu/sayfa)
- **Caching:** Analytics verisi için (5 dakika cache)
- **Lazy Loading:** Grafikler ve heatmap için
- **Debouncing:** Filtre değişikliklerinde (500ms)
- **Memoization:** Ustalık hesaplamalarında

### Erişilebilirlik
- Renk körlüğü desteği (pattern/texture ekleme)
- Klavye navigasyonu
- Screen reader uyumluluğu (ARIA labels)
- Yüksek kontrast mod desteği

---

## 📝 11. KULLANICI DOKÜMANTASYONU (İçerik Taslağı)

### Rehber Öğretmen İçin Kılavuz

**Konu Performansı Nasıl Girilir?**
1. Öğrenci profil sayfasını açın
2. "Konu Bazlı Plan" sekmesine gidin
3. Çalışılan konunun yanındaki "✓ Sonuç Gir" butonuna tıklayın
4. Formu doldurun:
   - Kaç soru çözdü
   - Kaç doğru/yanlış
   - Ne kadar süre harcadı
   - Zorluk seviyesi
5. Kaydet butonuna tıklayın

**Öğrencinin İlerlemesini Nasıl Takip Ederim?**
1. Öğrenci profil sayfasını açın
2. "Konu Takibi" sekmesine gidin
3. Özet kartlarda genel durumu görün
4. "Konular" alt sekmesinde detaylı liste
5. "Grafikler" alt sekmesinde görsel analiz

**Sınıf Genelini Nasıl Analiz Ederim?**
1. "Raporlar" sayfasını açın
2. "Konu Performansı" sekmesine gidin
3. Filtreleri ayarlayın (sınıf, sınav tipi)
4. Heatmap'te sınıf geneli göreceksiniz
5. Karşılaştırma tablosunda öğrenciler yan yana

---

## ✅ 12. TAMAMLANMA KRİTERLERİ

Sistem aşağıdaki kriterleri karşıladığında tamamlanmış sayılacak:

- [x] Veritabanı şeması oluşturuldu ve migration çalışıyor
- [x] Backend API tüm endpoint'leriyle çalışıyor
- [x] Ustalık seviyesi doğru hesaplanıyor
- [x] Konu planlayıcıda hızlı giriş çalışıyor
- [x] Öğrenci profilinde konu takibi sekmesi eksiksiz
- [x] Raporlar sayfasında toplu analiz çalışıyor
- [x] Hedef sınav filtreleme doğru çalışıyor
- [x] Grafikler ve heatmap doğru gösteriliyor
- [x] Responsive tasarım mobil/tablet'te uyumlu
- [x] Hata yönetimi ve validation eksiksiz
- [x] Loading states ve empty states eklendi
- [x] Toast bildirimleri çalışıyor

---

## 🚀 13. GELECEKTEKİ İYİLEŞTİRMELER (v2.0)

Bu özellikler ilk versiyondan sonra eklenebilir:

1. **Akıllı Öneri Sistemi**
   - Zayıf konular için otomatik çalışma planı önerisi
   - "Bu haftaya şu konuları eklemeni öneriyorum" bildirimi

2. **Spaced Repetition**
   - Unutma eğrisine göre tekrar hatırlatmaları
   - "Üçgenler konusunu 3 gün önce çalıştın, tekrar zamanı"

3. **Gamification**
   - Rozet sistemi ("5 konu uzman seviyede!")
   - Günlük/haftalık hedefler
   - Liderboard (sınıf içi)

4. **AI Entegrasyonu**
   - Performans verilerine göre kişiselleştirilmiş öneriler
   - "Bu konuda zorlanıyorsun, şu kaynaklara bakabilirsin"

5. **Ebeveyn Paneli**
   - Velilerin çocuklarının konu takibini görmesi
   - Haftalık ilerleme e-posta özeti

6. **Mobil Uygulama**
   - Öğrenciler kendi performanslarını girebilir
   - Push bildirimleri

---

**Son Güncelleme:** 23 Kasım 2025  
**Tahmini Tamamlanma Süresi:** 4-5 gün (1 backend + 3 frontend + 1 test)  
**Durum:** 📝 Planlama Tamamlandı - Geliştirme Başlıyor
