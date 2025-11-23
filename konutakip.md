# 📚 Konu Takibi Sistemi - Kapsamlı Geliştirme Planı

**Tarih:** 23 Kasım 2025  
**Amaç:** Öğrencilerin konu bazlı çalışma performansını kaydetmek, spaced repetition ile tekrar planlamak ve haftalık görüşmelerde kullanmak.

---

## 🎯 GENEL BAKIŞ

### Sistemin Amacı
- Öğrencilerin konu bazlı performansını kaydetmek ve izlemek
- Spaced repetition algoritması ile tekrar planı otomatik oluşturmak
- Haftalık görüşmelerde kullanılacak akıllı plan önermek
- Rozet sistemi ile öğrenciyi motive etmek
- Şık PDF çıktısı ile haftalık program dağıtmak
- Konu bazında ustalık seviyesi takibi (5 seviye: Başlanmadı → Uzman)

### Kullanım Senaryosu (Haftalık Görüşme)

```
📅 Pazartesi 09:00 - Ahmet'in Görüşme Saati

1. [PERFORMANS GİRİŞİ]
   - Geçen hafta verilen konuların sonuçlarını gir
   - "Üçgenler: 20 soru, 17 doğru, 3 yanlış, 45 dakika, Orta zorluk"
   - Sistem otomatik ustalık seviyesi hesaplar

2. [SİSTEM ÖNERİSİ GÖRÜR]
   📋 BU HAFTA İÇİN PLAN ÖNERİSİ:
   
   ✨ YENİ KONULAR (3-5 konu):
   - Denklemler (TYT Matematik)
   - Fonksiyonlar (TYT Matematik)
   
   🔄 TEKRAR KONULARı (Spaced Repetition):
   - İntegral (%80 başarı, 15 gün önce → pekiştirme zamanı!)
   - Türev (%75 başarı, 7 gün önce → tekrar et)
   
   🏆 MOTIVASYON:
   - 7 günlük streak! 🔥
   - "Matematik Ustası" rozetine 2 konu kaldı
   - Bu hafta 3 rozet kazanabilir!

3. [PLAN ONAYLAMA]
   - Önerileri gözden geçir
   - İstersen ekle/çıkar
   - Onaylayınca PDF oluştur

4. [PDF VER]
   - Şık tasarımlı haftalık çalışma planı
   - QR kod ile öğrenci ilerlemesini görebilir (ileriki faz)
   - Rozetler ve motivasyon mesajları

5. [ÖĞRENCİ GİTTİ]
   - Planını aldı, bu hafta çalışacak
   - Bir sonraki hafta geldiğinde döngü tekrarlanır
```

### Kullanıcı Akışı (Şu An vs İleride)

**Şu An (Tek Kullanıcı - Sadece Sen):**
- Sen giriş yapıyorsun
- Tüm öğrencilerin performansını sen giriyorsun
- PDF yazdırıp öğrencilere dağıtıyorsun

**İleriki Aşama (Multi-User):**
- Öğretmenler kendi hesabıyla giriş
- Öğrenciler kendi performanslarını girebilir
- Veliler çocuğunun ilerlemesini görebilir
- Mobil app desteği

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

### Yeni Tablo: `weekly_plans`

```sql
CREATE TABLE weekly_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  week_start_date TEXT NOT NULL,
  week_end_date TEXT NOT NULL,
  new_topics TEXT NOT NULL,
  review_topics TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'completed')),
  pdf_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_weekly_plans_student ON weekly_plans(student_id);
CREATE INDEX idx_weekly_plans_date ON weekly_plans(week_start_date DESC);
```

### Yeni Tablo: `badges`

```sql
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE student_badges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE INDEX idx_student_badges_student ON student_badges(student_id);
```

### Öğrenci Tablosuna Ekleme

```sql
ALTER TABLE students ADD COLUMN target_exams TEXT DEFAULT '[]';
ALTER TABLE students ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN last_activity_date TEXT;
```

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
│   ├── mastery-calculator.service.ts
│   ├── spaced-repetition.service.ts
│   └── badge.service.ts
├── routes/
│   └── topic-performance.routes.ts
└── index.ts

server/features/weekly-plans/
├── types/
│   └── weekly-plan.types.ts
├── repository/
│   └── weekly-plan.repository.ts
├── services/
│   ├── weekly-plan.service.ts
│   └── pdf-generator.service.ts
├── routes/
│   └── weekly-plan.routes.ts
└── index.ts
```

### API Endpoint'leri

#### Performans Yönetimi
- `POST /api/topic-performance` - Yeni performans kaydı oluştur
- `GET /api/topic-performance/student/:studentId` - Öğrencinin tüm performans kayıtları
- `GET /api/topic-performance/topic/:topicId/student/:studentId` - Belirli konuya ait kayıtlar
- `PUT /api/topic-performance/:id` - Performans kaydı güncelle
- `DELETE /api/topic-performance/:id` - Performans kaydı sil

#### Haftalık Plan
- `POST /api/weekly-plans/generate/:studentId` - Haftalık plan önerisi oluştur
  - Sistem otomatik spaced repetition + yeni konu önerir
  - Response: `{ newTopics: [], reviewTopics: [], badges: [], streak: 7 }`
  
- `POST /api/weekly-plans` - Haftalık planı kaydet (onaylandıktan sonra)
- `GET /api/weekly-plans/student/:studentId` - Öğrencinin tüm planları
- `GET /api/weekly-plans/:id/pdf` - PDF oluştur ve indir
- `PUT /api/weekly-plans/:id` - Planı güncelle

#### Spaced Repetition
- `GET /api/spaced-repetition/due/:studentId` - Tekrar edilmesi gereken konular
  - Query params: `?date=2025-11-23`
  - Response: Algoritma ile hesaplanmış tekrar listesi

#### Rozetler
- `GET /api/badges` - Tüm rozetler
- `GET /api/badges/student/:studentId` - Öğrencinin kazandığı rozetler
- `GET /api/badges/student/:studentId/progress` - Rozet ilerlemesi
  - "10 Konu Uzman" rozetine 2 konu kaldı

#### Analitik
- `GET /api/topic-performance/analytics/student/:studentId` - Öğrenci analitikleri
- `GET /api/topic-performance/analytics/class` - Sınıf geneli analitik
- `GET /api/topic-performance/mastery-summary/:studentId` - Ustalık özeti

#### Hedef Sınav
- `PUT /api/students/:id/target-exams` - Hedef sınavları güncelle

---

## 🧮 3. SPACED REPETITION ALGORİTMASI

### Dosya: `spaced-repetition.service.ts`

```typescript
interface ReviewSchedule {
  topicId: string;
  topicName: string;
  lastStudied: string;
  successRate: number;
  masteryLevel: number;
  nextReviewDate: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

function calculateNextReviewDate(
  lastStudied: Date,
  successRate: number,
  attemptCount: number
): Date {
  let intervalDays: number;
  
  // Başarı oranına göre aralık belirleme
  if (successRate < 60) {
    // Zayıf: 3 gün sonra
    intervalDays = 3;
  } else if (successRate < 80) {
    // Orta: 7 gün sonra
    intervalDays = 7;
  } else if (successRate < 90) {
    // İyi: 14 gün sonra
    intervalDays = 14;
  } else {
    // Uzman: 30 gün sonra
    intervalDays = 30;
  }
  
  // Deneme sayısına göre bonus
  const attemptBonus = Math.min(attemptCount * 2, 14);
  intervalDays += attemptBonus;
  
  const nextDate = new Date(lastStudied);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  
  return nextDate;
}

function getReviewPriority(daysOverdue: number): 'high' | 'medium' | 'low' {
  if (daysOverdue > 7) return 'high';
  if (daysOverdue > 0) return 'medium';
  return 'low';
}

async function getDueTopicsForStudent(
  studentId: string,
  targetDate: Date = new Date()
): Promise<ReviewSchedule[]> {
  // Öğrencinin tüm performans kayıtlarını al
  const performances = await getStudentPerformances(studentId);
  
  // Konu bazında grupla
  const topicGroups = groupByTopic(performances);
  
  const dueTopics: ReviewSchedule[] = [];
  
  for (const [topicId, records] of Object.entries(topicGroups)) {
    const lastRecord = records[records.length - 1];
    const nextReviewDate = calculateNextReviewDate(
      new Date(lastRecord.date),
      lastRecord.successRate,
      records.length
    );
    
    // Tekrar tarihi geldi mi veya geçti mi?
    if (nextReviewDate <= targetDate) {
      const daysOverdue = Math.floor(
        (targetDate.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      dueTopics.push({
        topicId,
        topicName: lastRecord.topic.name,
        lastStudied: lastRecord.date,
        successRate: lastRecord.successRate,
        masteryLevel: lastRecord.masteryLevel,
        nextReviewDate: nextReviewDate.toISOString(),
        priority: getReviewPriority(daysOverdue),
        reason: generateReviewReason(lastRecord.successRate, daysOverdue)
      });
    }
  }
  
  // Önceliğe göre sırala
  return dueTopics.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateReviewReason(successRate: number, daysOverdue: number): string {
  if (daysOverdue > 7) {
    return `${daysOverdue} gün gecikmiş! Unutma riski yüksek.`;
  } else if (successRate < 70) {
    return `%${successRate} başarı - pekiştirme gerekiyor.`;
  } else if (successRate >= 90) {
    return `%${successRate} başarı - ustalığı korumak için tekrar.`;
  } else {
    return `%${successRate} başarı - iyileştirme zamanı.`;
  }
}
```

---

## 🏆 4. ROZET SİSTEMİ

### Rozet Kategorileri ve Örnekleri

```typescript
const DEFAULT_BADGES = [
  // Ustalık Rozetleri
  {
    id: 'master_5',
    name: 'İlk Adım',
    description: '5 konuda uzman seviyesine ulaş',
    icon: '🌱',
    criteriaType: 'mastery_count',
    criteriaValue: 5,
    category: 'mastery'
  },
  {
    id: 'master_10',
    name: 'Matematik Ustası',
    description: '10 konuda uzman seviyesine ulaş',
    icon: '🎓',
    criteriaType: 'mastery_count',
    criteriaValue: 10,
    category: 'mastery'
  },
  {
    id: 'master_25',
    name: 'Konu Kralı',
    description: '25 konuda uzman seviyesine ulaş',
    icon: '👑',
    criteriaType: 'mastery_count',
    criteriaValue: 25,
    category: 'mastery'
  },
  
  // Streak Rozetleri
  {
    id: 'streak_7',
    name: 'Kararlı',
    description: '7 gün üst üste çalış',
    icon: '🔥',
    criteriaType: 'streak',
    criteriaValue: 7,
    category: 'streak'
  },
  {
    id: 'streak_30',
    name: 'Disiplin',
    description: '30 gün üst üste çalış',
    icon: '💪',
    criteriaType: 'streak',
    criteriaValue: 30,
    category: 'streak'
  },
  
  // Soru Rozetleri
  {
    id: 'questions_100',
    name: 'Soru Avcısı',
    description: '100 soru çöz',
    icon: '🎯',
    criteriaType: 'total_questions',
    criteriaValue: 100,
    category: 'questions'
  },
  {
    id: 'questions_500',
    name: 'Soru Makinesi',
    description: '500 soru çöz',
    icon: '⚡',
    criteriaType: 'total_questions',
    criteriaValue: 500,
    category: 'questions'
  },
  
  // Başarı Rozetleri
  {
    id: 'perfect_week',
    name: 'Mükemmel Hafta',
    description: 'Bir hafta %90+ başarı',
    icon: '⭐',
    criteriaType: 'perfect_week',
    criteriaValue: 90,
    category: 'achievement'
  }
];
```

### Rozet İlerleme Hesaplama

```typescript
interface BadgeProgress {
  badge: Badge;
  current: number;
  target: number;
  percentage: number;
  earned: boolean;
  message: string;
}

async function getBadgeProgress(studentId: string): Promise<BadgeProgress[]> {
  const allBadges = await getAllBadges();
  const studentBadges = await getStudentBadges(studentId);
  const studentStats = await getStudentStats(studentId);
  
  return allBadges.map(badge => {
    const earned = studentBadges.some(sb => sb.badgeId === badge.id);
    let current = 0;
    
    switch (badge.criteriaType) {
      case 'mastery_count':
        current = studentStats.expertTopicCount;
        break;
      case 'streak':
        current = studentStats.currentStreak;
        break;
      case 'total_questions':
        current = studentStats.totalQuestionsSolved;
        break;
    }
    
    const percentage = Math.min(100, (current / badge.criteriaValue) * 100);
    const remaining = Math.max(0, badge.criteriaValue - current);
    
    return {
      badge,
      current,
      target: badge.criteriaValue,
      percentage,
      earned,
      message: earned 
        ? `🎉 Kazandın!` 
        : `${remaining} ${badge.criteriaType} kaldı!`
    };
  });
}
```

---

## 📄 5. PDF OLUŞTURMA SERVİSİ

### Dosya: `pdf-generator.service.ts`

**Kullanılacak Kütüphane:** `jspdf` + `jspdf-autotable` (zaten kurulu)

### Şık ve Zarif Tasarım Özellikleri

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

async function generateWeeklyPlanPDF(
  student: Student,
  weeklyPlan: WeeklyPlan,
  reviewTopics: ReviewSchedule[],
  badgeProgress: BadgeProgress[]
): Promise<Buffer> {
  const doc = new jsPDF();
  
  // RENK PALETİ
  const colors = {
    primary: [59, 130, 246],      // Mavi
    secondary: [139, 92, 246],    // Mor
    success: [34, 197, 94],       // Yeşil
    warning: [234, 179, 8],       // Sarı
    danger: [239, 68, 68],        // Kırmızı
    gray: [156, 163, 175],        // Gri
    light: [243, 244, 246],       // Açık gri
    dark: [31, 41, 55]            // Koyu gri
  };
  
  // BAŞLIK BÖLÜMÜ
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Haftalık Çalışma Planı', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.name} ${student.surname}`, 105, 30, { align: 'center' });
  
  // TARİH VE SINIAV BİLGİSİ
  let y = 50;
  doc.setTextColor(...colors.dark);
  doc.setFontSize(10);
  doc.text(`📅 ${formatDate(weeklyPlan.weekStartDate)} - ${formatDate(weeklyPlan.weekEndDate)}`, 20, y);
  doc.text(`🎯 Hedef Sınavlar: ${student.targetExams.join(', ')}`, 120, y);
  
  // STREAK VE MOTIVASYON
  y += 15;
  doc.setFillColor(...colors.warning);
  doc.roundedRect(15, y - 8, 180, 15, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`🔥 ${student.currentStreak} Günlük Streak! Harikasın!`, 105, y, { align: 'center' });
  
  // YENİ KONULAR
  y += 25;
  doc.setTextColor(...colors.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('✨ Bu Haftanın Konuları', 20, y);
  
  y += 10;
  const newTopics = JSON.parse(weeklyPlan.newTopics);
  autoTable(doc, {
    startY: y,
    head: [['Ders', 'Konu', 'Sınav Tipi']],
    body: newTopics.map(t => [t.subject, t.name, t.category]),
    theme: 'grid',
    headStyles: {
      fillColor: colors.primary,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: colors.light
    }
  });
  
  // TEKRAR KONULARı
  y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.dark);
  doc.text('🔄 Tekrar Edilecek Konular (Spaced Repetition)', 20, y);
  
  y += 10;
  if (reviewTopics.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Konu', 'Son Başarı', 'Neden Tekrar?']],
      body: reviewTopics.map(t => [
        t.topicName,
        `%${t.successRate}`,
        t.reason
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: colors.secondary,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        2: { cellWidth: 70 }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(...colors.gray);
    doc.text('Bu hafta tekrar konusu yok. Yeni konulara odaklan!', 20, y + 5);
  }
  
  // ROZET İLERLEMESİ
  y = doc.lastAutoTable.finalY + 15 || y + 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.dark);
  doc.text('🏆 Rozet İlerlemen', 20, y);
  
  y += 10;
  const nearBadges = badgeProgress
    .filter(b => !b.earned && b.percentage >= 50)
    .slice(0, 3);
  
  nearBadges.forEach((badge, index) => {
    const boxY = y + (index * 25);
    
    // Progress bar arka plan
    doc.setFillColor(...colors.light);
    doc.roundedRect(20, boxY, 170, 20, 3, 3, 'F');
    
    // Progress bar dolgu
    const progressWidth = (badge.percentage / 100) * 170;
    doc.setFillColor(...colors.success);
    doc.roundedRect(20, boxY, progressWidth, 20, 3, 3, 'F');
    
    // Metin
    doc.setTextColor(...colors.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${badge.badge.icon} ${badge.badge.name}`, 25, boxY + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(badge.message, 25, boxY + 15);
    
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`%${Math.round(badge.percentage)}`, 180, boxY + 12, { align: 'right' });
  });
  
  // FOOTER
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...colors.primary);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Rehber360 - Başarıya Giden Yol', 105, pageHeight - 10, { align: 'center' });
  
  // QR KOD (İleriki faz için placeholder)
  doc.setFontSize(8);
  doc.text('QR kod ile ilerlemeni takip et (yakında!)', 105, pageHeight - 5, { align: 'center' });
  
  return Buffer.from(doc.output('arraybuffer'));
}
```

---

## 🎨 6. FRONTEND - KONU PLANLAYICI (Haftalık Görüşme Ekranı)

### Dosya: `client/components/features/student-profile/TopicPlanner.tsx`

### Yeni Bölümler

#### 1. Geçen Hafta Performans Girişi
- Her konunun yanında "✓ Sonuç Gir" butonu
- `QuickPerformanceDialog` componenti açılır

#### 2. Bu Hafta Plan Önerisi (YENİ!)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Bu Haftanın Planı</CardTitle>
    <Button onClick={generateWeeklyPlan}>
      <Sparkles /> Plan Öner
    </Button>
  </CardHeader>
  
  <CardContent>
    {/* Yeni Konular */}
    <div className="mb-6">
      <h3>✨ Yeni Konular</h3>
      <TopicSelector 
        selectedTopics={newTopics}
        onChange={setNewTopics}
      />
    </div>
    
    {/* Sistem Önerisi: Tekrar Konuları */}
    <div className="mb-6">
      <h3>🔄 Tekrar Önerilen Konular</h3>
      {reviewTopics.map(topic => (
        <ReviewTopicCard 
          topic={topic}
          reason={topic.reason}
          priority={topic.priority}
          onToggle={toggleReviewTopic}
        />
      ))}
    </div>
    
    {/* Rozet ve Motivasyon */}
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
      <h3>🏆 Bu Hafta Kazanılabilir Rozetler</h3>
      {nearBadges.map(badge => (
        <BadgeProgressCard badge={badge} />
      ))}
      
      <div className="mt-4">
        <Flame className="inline" /> {student.currentStreak} günlük streak!
      </div>
    </div>
    
    {/* Aksiyon Butonları */}
    <div className="flex gap-4 mt-6">
      <Button onClick={savePlan}>
        <Save /> Planı Kaydet
      </Button>
      <Button onClick={generatePDF} variant="outline">
        <FileDown /> PDF İndir
      </Button>
    </div>
  </CardContent>
</Card>
```

### Yeni Component'ler
```
client/components/features/topic-performance/
├── QuickPerformanceDialog.tsx
├── ReviewTopicCard.tsx (tekrar önerisi kartı)
├── BadgeProgressCard.tsx (rozet ilerleme kartı)
└── WeeklyPlanGenerator.tsx (ana component)
```

---

## 📊 7. FRONTEND - ÖĞRENCİ PROFİLİ (Detaylı Takip)

### Dosya: `client/pages/StudentProfile/StudentProfile.tsx`

### Yeni Sekme: "Konu Takibi"

Önceki plandaki özelliklere ek olarak:

#### Ek Özellikler:
- **Streak Göstergesi:** GitHub-style calendar heatmap
- **Rozet Vitrin:** Kazanılan rozetler showcase
- **Tekrar Planı:** Yaklaşan tekrar konuları

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
    <TabsTrigger value="topics">Konular</TabsTrigger>
    <TabsTrigger value="badges">Rozetler</TabsTrigger>
    <TabsTrigger value="history">Haftalık Planlar</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* MasterySummaryCard */}
    {/* ProgressChart */}
    {/* StreakCalendar (YENİ!) */}
  </TabsContent>
  
  <TabsContent value="badges">
    <BadgeShowcase 
      earnedBadges={earnedBadges}
      progress={badgeProgress}
    />
  </TabsContent>
  
  <TabsContent value="history">
    <WeeklyPlanHistory plans={weeklyPlans} />
  </TabsContent>
</Tabs>
```

---

## 📈 8. FRONTEND - RAPORLAR SAYFASI

Önceki plandaki özellikler aynı kalıyor, ek olarak:
- Rozet dağılımı grafiği
- Sınıf geneli streak istatistiği

---

## 🧮 9. USTALIK SEVİYESİ HESAPLAMA

Önceki plandaki algoritma aynen kalıyor.

---

## 🎯 10. HEDEF SINAV YÖNETİMİ

Önceki plandaki filtre mantığı aynen kalıyor.

---

## 📋 11. GELIŞTIRME ADIMLARI (Öncelikli Sıra)

### Faz 1: Veritabanı ve Backend (2 gün)
- [ ] 1.1. `topic_performance` tablosu oluştur
- [ ] 1.2. `weekly_plans` tablosu oluştur
- [ ] 1.3. `badges` ve `student_badges` tabloları oluştur
- [ ] 1.4. `students` tablosuna `target_exams`, `current_streak`, `longest_streak` ekle
- [ ] 1.5. Default badges verilerini seed et
- [ ] 1.6. Repository oluştur (`topic-performance.repository.ts`)
- [ ] 1.7. Repository oluştur (`weekly-plan.repository.ts`)
- [ ] 1.8. Servis: `topic-performance.service.ts`
- [ ] 1.9. Servis: `mastery-calculator.service.ts`
- [ ] 1.10. Servis: `spaced-repetition.service.ts` (KRİTİK!)
- [ ] 1.11. Servis: `badge.service.ts`
- [ ] 1.12. Servis: `weekly-plan.service.ts`
- [ ] 1.13. Servis: `pdf-generator.service.ts` (ŞIK TASARIM!)
- [ ] 1.14. API routes: Performans endpoint'leri
- [ ] 1.15. API routes: Haftalık plan endpoint'leri
- [ ] 1.16. API routes: Rozet endpoint'leri
- [ ] 1.17. API routes: Spaced repetition endpoint
- [ ] 1.18. Tüm API'leri ana `index.ts`'e bağla

### Faz 2: Haftalık Plan Özelliği (Frontend) (2 gün)
- [ ] 2.1. `WeeklyPlanGenerator.tsx` ana component oluştur
- [ ] 2.2. `QuickPerformanceDialog.tsx` (performans girişi)
- [ ] 2.3. `ReviewTopicCard.tsx` (tekrar önerisi kartı)
- [ ] 2.4. `BadgeProgressCard.tsx` (rozet ilerleme)
- [ ] 2.5. `TopicSelector.tsx` (yeni konu seçici)
- [ ] 2.6. "Plan Öner" butonu API entegrasyonu
- [ ] 2.7. Tekrar konuları gösterimi (spaced repetition)
- [ ] 2.8. Rozet ve motivasyon bölümü
- [ ] 2.9. "Planı Kaydet" fonksiyonu
- [ ] 2.10. "PDF İndir" butonu entegrasyonu
- [ ] 2.11. `TopicPlanner.tsx` içine entegre et

### Faz 3: Öğrenci Profili - Konu Takibi Sekmesi (2 gün)
- [ ] 3.1. `TopicTrackingTab.tsx` ana component
- [ ] 3.2. `MasterySummaryCard.tsx` (özet kartlar)
- [ ] 3.3. `TopicMasteryList.tsx` (konu listesi)
- [ ] 3.4. `ProgressChart.tsx` (zaman grafiği)
- [ ] 3.5. `SubjectHeatmap.tsx` (heatmap)
- [ ] 3.6. `StreakCalendar.tsx` (GitHub-style takvim - YENİ!)
- [ ] 3.7. `BadgeShowcase.tsx` (rozet vitrini - YENİ!)
- [ ] 3.8. `WeeklyPlanHistory.tsx` (plan geçmişi - YENİ!)
- [ ] 3.9. `PerformanceEntryForm.tsx` (manuel giriş)
- [ ] 3.10. Hedef sınav seçici ekle
- [ ] 3.11. Filtre mantığı (hedef sınavlar/tümü)
- [ ] 3.12. API entegrasyonu
- [ ] 3.13. StudentProfile.tsx'e sekme ekle

### Faz 4: Raporlar Sayfası (1 gün)
- [ ] 4.1. `TopicPerformanceReport.tsx`
- [ ] 4.2. `ClassHeatmap.tsx`
- [ ] 4.3. `StudentComparisonTable.tsx`
- [ ] 4.4. `ClassTrendChart.tsx`
- [ ] 4.5. `ClassBadgeDistribution.tsx` (YENİ!)
- [ ] 4.6. Filtre bölümü
- [ ] 4.7. API entegrasyonu
- [ ] 4.8. Excel export
- [ ] 4.9. Reports.tsx'e sekme ekle

### Faz 5: Test ve İyileştirme (1 gün)
- [ ] 5.1. Spaced repetition algoritması test et
- [ ] 5.2. Rozet sistemi test et
- [ ] 5.3. PDF çıktısı test et (şıklık kontrolü!)
- [ ] 5.4. Haftalık plan akışı end-to-end test
- [ ] 5.5. Frontend componentleri test et
- [ ] 5.6. Responsive tasarım kontrolü
- [ ] 5.7. Hata durumları test et
- [ ] 5.8. Performans optimizasyonu

### Faz 6: Multi-User Desteği (İleriki Aşama - 3 gün)
- [ ] 6.1. Authentication sistemi (öğretmen/öğrenci/veli)
- [ ] 6.2. Role-based permissions
- [ ] 6.3. Öğrenci self-service performans girişi
- [ ] 6.4. Öğretmen onay sistemi
- [ ] 6.5. Veli görüntüleme paneli
- [ ] 6.6. QR kod entegrasyonu
- [ ] 6.7. Mobil responsive iyileştirmeler

---

## ✅ 12. TAMAMLANMA KRİTERLERİ

**Faz 1-5 Tamamlandığında:**
- [x] Veritabanı şeması ve migration çalışıyor
- [x] Spaced repetition algoritması doğru hesaplıyor
- [x] Haftalık plan önerisi oluşturuluyor (yeni + tekrar konular)
- [x] Rozet sistemi çalışıyor ve ilerleme gösteriliyor
- [x] Şık PDF çıktısı oluşturuluyor
- [x] Konu planlayıcıda hızlı performans girişi çalışıyor
- [x] Öğrenci profilinde konu takibi sekmesi eksiksiz
- [x] Raporlar sayfasında toplu analiz çalışıyor
- [x] Streak takibi çalışıyor
- [x] Hedef sınav filtreleme doğru çalışıyor
- [x] Grafikler ve heatmap doğru gösteriliyor
- [x] Responsive tasarım uyumlu
- [x] Tüm validasyon ve hata yönetimi eksiksiz

---

## 🚀 13. GELECEKTEKİ İYİLEŞTİRMELER

**v2.0 (Multi-User):**
- Öğretmen/öğrenci/veli hesapları
- Mobil uygulama
- QR kod ile hızlı erişim
- Push bildirimleri

**v3.0 (AI & Gamification):**
- AI destekli konu önerileri
- Yarışma ve liderboard
- Sosyal özellikler (arkadaşlarla karşılaştırma)
- Video çözüm entegrasyonu

---

## 📝 14. PDF ÇIKTI ÖRNEĞİ

### Sayfa Düzeni:
```
┌─────────────────────────────────────────────────┐
│  [MAVİ HEADER]                                  │
│  Haftalık Çalışma Planı                         │
│  Ahmet Yılmaz - 11-A                            │
└─────────────────────────────────────────────────┘

📅 22 Kasım - 29 Kasım 2025    🎯 TYT, AYT

┌─────────────────────────────────────────────────┐
│ 🔥 7 Günlük Streak! Harikasın!                  │
└─────────────────────────────────────────────────┘

✨ Bu Haftanın Konuları
┌──────────────┬────────────────────┬────────────┐
│ Ders         │ Konu               │ Sınav Tipi │
├──────────────┼────────────────────┼────────────┤
│ Matematik    │ Denklemler         │ TYT        │
│ Fizik        │ Kuvvet ve Hareket  │ TYT        │
└──────────────┴────────────────────┴────────────┘

🔄 Tekrar Edilecek Konular
┌────────────────┬───────────┬──────────────────────┐
│ Konu           │ Başarı    │ Neden Tekrar?        │
├────────────────┼───────────┼──────────────────────┤
│ İntegral       │ %80       │ Ustalığı korumak için│
│ Türev          │ %75       │ Pekiştirme gerekiyor │
└────────────────┴───────────┴──────────────────────┘

🏆 Rozet İlerlemen
┌─────────────────────────────────────────────────┐
│ 🎓 Matematik Ustası        [████████░░] 80%     │
│    2 konu kaldı!                                │
├─────────────────────────────────────────────────┤
│ 💪 Disiplin                [███░░░░░░░] 23%     │
│    23 gün kaldı!                                │
└─────────────────────────────────────────────────┘

[MAVİ FOOTER]
Rehber360 - Başarıya Giden Yol
QR kod ile ilerlemeni takip et (yakında!)
```

---

**Son Güncelleme:** 23 Kasım 2025  
**Tahmini Tamamlanma Süresi:** 8 gün (2 backend + 2 haftalık plan + 2 profil + 1 rapor + 1 test)  
**Durum:** 📝 Güncellenmiş Plan Hazır - Geliştirme Başlıyor
