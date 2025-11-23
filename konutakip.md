# 📚 Konu Takibi Sistemi - Revize Geliştirme Planı (v2)

**Tarih:** 23 Kasım 2025 (Güncelleme)  
**Amaç:** Mevcut çalışma programı sistemine entegre konu performans takibi, spaced repetition ve rozet sistemi.

---

## 🎯 GENEL BAKIŞ

### Sistemin Amacı
- Haftalık görüşmelerde konu bazlı performans girişi (soru sayısı, doğru/yanlış, süre, zorluk)
- Konu ustalık seviyesi takibi (0: Başlanmadı → 5: Uzman/Tamamlandı)
- **Tamamlanan konular yeni planlarda önerilmez** ✅
- **Tamamlanmış bir konunun işareti geri alınırsa, tekrar plana girebilir** ✅
- Spaced repetition ile akıllı tekrar önerileri
- Rozet sistemi ile motivasyon
- Şık PDF çıktısı ile haftalık program dağıtımı

### 💡 Senin İş Akışın (Haftalık Görüşme)

```
📅 Pazartesi 09:00 - Ahmet'in Görüşme Saati

1. [ÖĞRENCİ GELDİ]
   - Geçen hafta verdiğin konuları nasıl yaptığını soruyor
   
2. [PERFORMANS GİRİŞİ - Hızlı Mod]
   Konu Takip sekmesinde:
   ✅ "Üçgenler" → 20 soru, 17 doğru, 45 dk, Orta → Kaydet
   ✅ "Limit" → Zaten biliyordu → [Tamamlandı] checkbox işaretle
   ✅ "Denklemler" → Çalışmadı → Performans girme
   
3. [SİSTEM PLAN ÖNERİSİ OLUŞTUR]
   "Plan Öner" butonuna bas:
   
   📋 SISTEM ÖNERİSİ:
   ✨ YENİ KONULAR (3-5 konu):
      - Fonksiyonlar (TYT Matematik)
      - Türev (AYT Matematik)
      ❌ Limit (ÇIKMIYOR - Tamamlandı olarak işaretli!)
   
   🔄 TEKRAR KONULARı (Spaced Repetition):
      - Üçgenler (%85 başarı, 7 gün önce → pekiştirme zamanı!)
      - İntegral (%72 başarı, 3 gün gecikmiş → acil tekrar!)
   
   🏆 MOTIVASYON:
      - 8 günlük streak! 🔥
      - "Matematik Ustası" rozetine 3 konu kaldı
   
4. [PLAN ONAYLA & PDF AL]
   - İstersen ekle/çıkar → Kaydet
   - PDF oluştur → Yazdır → Öğrenciye ver
   
5. [ÖĞRENCİ GİTTİ]
   - Bu hafta çalışacak
   - Bir sonraki hafta yine gelip döngü tekrarlanır
```

### 🔄 Tamamlanma Mantığı

**Önemli Kurallar:**
1. **Mastery Level 5 (Uzman) = Tamamlandı** → Yeni plan önerilerinde ÇIKMAZ
2. **Tamamlanmış bir konunun mastery'sini düşürürsen** → Tekrar plana girebilir
3. **Spaced repetition sadece Mastery 1-4 için çalışır**
4. Öğrenci bazı konuları zaten biliyorsa → Direkt "Tamamlandı" checkbox'ı işaretle

---

## 🗄️ VERİTABANI ŞEMASI

### ✅ Mevcut Tablolar (Kullanılacak)

Sistemde zaten var:
- `subjects` - Dersler
- `topics` - Konular
- `study_assignments` - Öğrenciye atanan konular
- `progress` - Konu ilerleme durumu

### 🆕 Yeni Tablo: `topic_performance`

Performans geçmişi (kaç soru, doğru/yanlış, süre, zorluk):

```sql
CREATE TABLE IF NOT EXISTS topic_performance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  assignment_id TEXT,
  date TEXT NOT NULL,
  questions_solved INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  duration_minutes INTEGER,
  difficulty_feedback TEXT CHECK(difficulty_feedback IN ('very_easy', 'easy', 'medium', 'hard', 'very_hard')),
  notes TEXT,
  success_rate REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES study_assignments(id) ON DELETE SET NULL
);

CREATE INDEX idx_topic_performance_student ON topic_performance(student_id);
CREATE INDEX idx_topic_performance_topic ON topic_performance(topic_id);
CREATE INDEX idx_topic_performance_date ON topic_performance(date DESC);
CREATE INDEX idx_topic_performance_assignment ON topic_performance(assignment_id);
```

### 🔄 Mevcut `progress` Tablosu Genişletme

```sql
-- Mevcut progress tablosuna yeni kolonlar
ALTER TABLE progress ADD COLUMN mastery_level INTEGER DEFAULT 0 CHECK(mastery_level BETWEEN 0 AND 5);
ALTER TABLE progress ADD COLUMN success_rate_avg REAL DEFAULT 0;
ALTER TABLE progress ADD COLUMN attempt_count INTEGER DEFAULT 0;
ALTER TABLE progress ADD COLUMN last_performance_date TEXT;
ALTER TABLE progress ADD COLUMN next_review_date TEXT;

-- Mastery Seviyeleri:
-- 0: Başlanmadı (hiç çalışılmamış)
-- 1: Başlangıç (%0-40 başarı)
-- 2: Orta (%41-60 başarı)
-- 3: İyi (%61-80 başarı)
-- 4: Çok İyi (%81-95 başarı)
-- 5: Uzman (%95+ başarı veya manuel "Tamamlandı" işareti) → PLANLARDA ÇIKMAZ!
```

### 🆕 Haftalık Planlar - İlişkisel Tasarım

**JSON yerine ilişkisel yapı:**

```sql
-- Ana plan tablosu
CREATE TABLE IF NOT EXISTS weekly_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  week_start_date TEXT NOT NULL,
  week_end_date TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'completed', 'cancelled')),
  pdf_path TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Plan konuları (ilişkisel)
CREATE TABLE IF NOT EXISTS weekly_plan_topics (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  topic_type TEXT NOT NULL CHECK(topic_type IN ('new', 'review')),
  priority INTEGER DEFAULT 0,
  review_reason TEXT,
  estimated_duration_minutes INTEGER,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE INDEX idx_weekly_plans_student ON weekly_plans(student_id);
CREATE INDEX idx_weekly_plans_date ON weekly_plans(week_start_date DESC);
CREATE INDEX idx_weekly_plan_topics_plan ON weekly_plan_topics(plan_id);
CREATE INDEX idx_weekly_plan_topics_topic ON weekly_plan_topics(topic_id);
```

### 🏆 Rozet Sistemi

```sql
-- Rozet tanımları
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria_type TEXT NOT NULL CHECK(criteria_type IN ('mastery_count', 'streak', 'total_questions', 'perfect_week')),
  criteria_value INTEGER NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('mastery', 'streak', 'questions', 'achievement'))
);

-- Öğrenci rozetleri
CREATE TABLE IF NOT EXISTS student_badges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE(student_id, badge_id)
);

CREATE INDEX idx_student_badges_student ON student_badges(student_id);
```

### 👤 Öğrenci Tablosu Genişletme

```sql
ALTER TABLE students ADD COLUMN target_exams TEXT DEFAULT '[]';
ALTER TABLE students ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN last_activity_date TEXT;
ALTER TABLE students ADD COLUMN total_questions_solved INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN expert_topic_count INTEGER DEFAULT 0;
```

---

## 🔧 BACKEND API

### Dizin Yapısı

```
server/features/topic-performance/
├── types/
│   └── topic-performance.types.ts
├── repository/
│   └── topic-performance.repository.ts
├── services/
│   ├── topic-performance.service.ts
│   ├── mastery-calculator.service.ts (Ustalık hesaplama)
│   ├── spaced-repetition.service.ts (Tekrar planlama)
│   └── badge.service.ts (Rozet sistemi)
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
│   ├── plan-generator.service.ts (Akıllı plan önerisi)
│   └── pdf-generator.service.ts (PDF oluşturma)
├── routes/
│   └── weekly-plan.routes.ts
└── index.ts
```

### API Endpoint'leri

#### 🎯 Performans Yönetimi

```
POST   /api/topic-performance                      - Yeni performans kaydı oluştur
GET    /api/topic-performance/student/:studentId  - Öğrencinin tüm performans kayıtları
GET    /api/topic-performance/topic/:topicId      - Belirli konuya ait kayıtlar
PUT    /api/topic-performance/:id                 - Performans kaydı güncelle
DELETE /api/topic-performance/:id                 - Performans kaydı sil
GET    /api/topic-performance/analytics/:studentId - Analitik özet
```

#### 📊 Ustalık (Mastery) Yönetimi

```
GET    /api/progress/student/:studentId           - Öğrencinin tüm konu ilerlemeleri
PUT    /api/progress/:id/mastery                  - Mastery level güncelle (manuel tamamlandı işareti)
POST   /api/progress/calculate-mastery            - Performansa göre mastery hesapla
GET    /api/progress/summary/:studentId           - Mastery özeti (kaç konu tamamlandı, vb.)
```

#### 📋 Haftalık Plan

```
POST   /api/weekly-plans/generate/:studentId      - Akıllı plan önerisi oluştur
       Response: { newTopics: [], reviewTopics: [], badges: [], streak: 7 }
       
POST   /api/weekly-plans                          - Planı kaydet
GET    /api/weekly-plans/student/:studentId       - Öğrencinin tüm planları
GET    /api/weekly-plans/:id                      - Plan detayı
PUT    /api/weekly-plans/:id                      - Plan güncelle
DELETE /api/weekly-plans/:id                      - Plan sil
GET    /api/weekly-plans/:id/pdf                  - PDF oluştur ve indir
```

#### 🔄 Spaced Repetition

```
GET    /api/spaced-repetition/due/:studentId      - Tekrar edilmesi gereken konular
       Query: ?date=2025-11-23&excludeCompleted=true
       
GET    /api/spaced-repetition/upcoming/:studentId - Yaklaşan tekrar konuları (7 gün içinde)
```

#### 🏆 Rozetler

```
GET    /api/badges                                - Tüm rozet tanımları
GET    /api/badges/student/:studentId             - Öğrencinin kazandığı rozetler
GET    /api/badges/student/:studentId/progress    - Rozet ilerleme durumu
POST   /api/badges/check/:studentId               - Rozet kontrol et ve kazandır (otomatik)
```

---

## 🧮 SPACED REPETITION ALGORİTMASI (Düzeltilmiş)

### ❌ Eski Hatalı Algoritma Sorunu

```typescript
// ❌ YANLIŞ: Deneme sayısı arttıkça aralık uzuyor!
const attemptBonus = Math.min(attemptCount * 2, 14);
intervalDays += attemptBonus;

// Örnek: %50 başarı, 10 deneme
// intervalDays = 3 + (10 * 2) = 23 gün → YANLIŞ!
// Öğrenci zorlanıyor ama tekrarı 23 gün sonraya atılıyor!
```

### ✅ Yeni Doğru Algoritma

```typescript
// spaced-repetition.service.ts

interface ReviewSchedule {
  topicId: string;
  topicName: string;
  subjectName: string;
  lastStudied: string;
  successRate: number;
  masteryLevel: number;
  attemptCount: number;
  nextReviewDate: string;
  daysUntilReview: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reason: string;
}

/**
 * Başarı oranına göre tekrar aralığı hesaplama
 * KURAL: Başarı düşükse → KISA aralık, Başarı yüksekse → UZUN aralık
 */
function calculateNextReviewDate(
  lastStudied: Date,
  successRate: number,
  masteryLevel: number,
  attemptCount: number
): Date {
  let intervalDays: number;
  
  // 1. Başarı oranına göre temel aralık
  if (successRate < 40) {
    // Çok zayıf: 2 gün sonra
    intervalDays = 2;
  } else if (successRate < 60) {
    // Zayıf: 3 gün sonra
    intervalDays = 3;
  } else if (successRate < 70) {
    // Orta-Alt: 5 gün sonra
    intervalDays = 5;
  } else if (successRate < 80) {
    // Orta: 7 gün sonra
    intervalDays = 7;
  } else if (successRate < 90) {
    // İyi: 14 gün sonra
    intervalDays = 14;
  } else if (successRate < 95) {
    // Çok iyi: 21 gün sonra
    intervalDays = 21;
  } else {
    // Uzman: 30 gün sonra
    intervalDays = 30;
  }
  
  // 2. Deneme sayısına göre AKILLI düzeltme
  // KURAL: İlk denemelerde daha sık tekrar, sonra seyrekleşir
  if (attemptCount === 1) {
    // İlk deneme: Aralığı %50 azalt (daha sık tekrar)
    intervalDays = Math.max(1, Math.floor(intervalDays * 0.5));
  } else if (attemptCount === 2) {
    // İkinci deneme: Aralığı %25 azalt
    intervalDays = Math.max(1, Math.floor(intervalDays * 0.75));
  } else if (attemptCount >= 3 && successRate >= 80) {
    // 3+ deneme + yüksek başarı: Aralığı %20 arttır (pekişmiş)
    intervalDays = Math.floor(intervalDays * 1.2);
  }
  
  // 3. Mastery level'a göre düzeltme
  if (masteryLevel === 4 && successRate >= 90) {
    // Neredeyse uzman: Uzun aralık ver
    intervalDays = Math.max(intervalDays, 21);
  } else if (masteryLevel <= 1) {
    // Başlangıç: Kısa aralık zorla
    intervalDays = Math.min(intervalDays, 5);
  }
  
  // 4. Tarihi hesapla
  const nextDate = new Date(lastStudied);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  
  return nextDate;
}

function getReviewPriority(
  daysOverdue: number,
  successRate: number
): 'urgent' | 'high' | 'medium' | 'low' {
  // Gecikmiş mi?
  if (daysOverdue > 7) return 'urgent';
  if (daysOverdue > 3) return 'high';
  if (daysOverdue > 0) return 'medium';
  
  // Yaklaşan + düşük başarı
  if (daysOverdue >= -2 && successRate < 60) return 'high';
  
  return 'low';
}

async function getDueTopicsForStudent(
  studentId: string,
  targetDate: Date = new Date(),
  excludeCompleted: boolean = true
): Promise<ReviewSchedule[]> {
  // 1. Öğrencinin progress kayıtlarını al
  const progressRecords = await db.all(`
    SELECT 
      p.*,
      t.name as topic_name,
      s.name as subject_name
    FROM progress p
    JOIN topics t ON p.topicId = t.id
    JOIN subjects s ON t.subjectId = s.id
    WHERE p.studentId = ?
      AND p.lastStudied IS NOT NULL
      ${excludeCompleted ? 'AND p.mastery_level < 5' : ''}
    ORDER BY p.last_performance_date DESC
  `, [studentId]);
  
  const dueTopics: ReviewSchedule[] = [];
  
  for (const record of progressRecords) {
    // Mastery Level 5 (Tamamlandı) → ATLA
    if (excludeCompleted && record.mastery_level === 5) {
      continue;
    }
    
    // Hiç çalışılmamış (mastery 0) → ATLA
    if (record.mastery_level === 0) {
      continue;
    }
    
    const lastStudied = new Date(record.last_performance_date || record.lastStudied);
    const nextReviewDate = calculateNextReviewDate(
      lastStudied,
      record.success_rate_avg || 0,
      record.mastery_level,
      record.attempt_count || 1
    );
    
    // Tekrar tarihi geldi mi veya geçti mi?
    const daysUntilReview = Math.floor(
      (nextReviewDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilReview <= 0) {
      const daysOverdue = Math.abs(daysUntilReview);
      
      dueTopics.push({
        topicId: record.topicId,
        topicName: record.topic_name,
        subjectName: record.subject_name,
        lastStudied: lastStudied.toISOString(),
        successRate: record.success_rate_avg || 0,
        masteryLevel: record.mastery_level,
        attemptCount: record.attempt_count || 1,
        nextReviewDate: nextReviewDate.toISOString(),
        daysUntilReview,
        priority: getReviewPriority(daysOverdue, record.success_rate_avg || 0),
        reason: generateReviewReason(record.success_rate_avg || 0, daysOverdue, record.mastery_level)
      });
    }
  }
  
  // Öncelik sırasına göre sırala
  return dueTopics.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateReviewReason(
  successRate: number,
  daysOverdue: number,
  masteryLevel: number
): string {
  if (daysOverdue > 7) {
    return `${daysOverdue} gün gecikmiş! Unutma riski yüksek.`;
  } else if (daysOverdue > 3) {
    return `${daysOverdue} gün gecikmiş, acil tekrar gerekli.`;
  } else if (successRate < 50) {
    return `%${Math.round(successRate)} başarı - çok zayıf, sık tekrar et!`;
  } else if (successRate < 70) {
    return `%${Math.round(successRate)} başarı - pekiştirme gerekiyor.`;
  } else if (successRate >= 90 && masteryLevel === 4) {
    return `%${Math.round(successRate)} başarı - uzmanlığa yakın, son pekiştirme!`;
  } else {
    return `%${Math.round(successRate)} başarı - iyileştirme zamanı.`;
  }
}
```

---

## 🎓 MASTERY LEVEL HESAPLAMA

```typescript
// mastery-calculator.service.ts

/**
 * Performans kaydına göre mastery level hesapla
 * KURAL: %95+ başarı → Uzman (5), altında kademeli artış
 */
function calculateMasteryLevel(
  currentMastery: number,
  newSuccessRate: number,
  averageSuccessRate: number,
  attemptCount: number
): number {
  // Manuel "Tamamlandı" işareti varsa (mastery 5), değiştirme
  if (currentMastery === 5) {
    return 5;
  }
  
  // Ortalama başarı oranına göre mastery
  let newMastery: number;
  
  if (averageSuccessRate >= 95) {
    newMastery = 5; // Uzman - TamamlandI
  } else if (averageSuccessRate >= 85) {
    newMastery = 4; // Çok İyi
  } else if (averageSuccessRate >= 70) {
    newMastery = 3; // İyi
  } else if (averageSuccessRate >= 50) {
    newMastery = 2; // Orta
  } else {
    newMastery = 1; // Başlangıç
  }
  
  // Ani düşüşü engelle (maksimum 1 seviye düşebilir)
  if (newMastery < currentMastery - 1) {
    newMastery = currentMastery - 1;
  }
  
  // Ani yükselişi engelle (yeterli deneme yoksa)
  if (newMastery > currentMastery + 1 && attemptCount < 3) {
    newMastery = currentMastery + 1;
  }
  
  return Math.max(0, Math.min(5, newMastery));
}

/**
 * Performans kaydı oluşturulduğunda otomatik güncelle
 */
async function updateProgressAfterPerformance(
  studentId: string,
  topicId: string,
  performanceData: {
    questionsSolved: number;
    correctAnswers: number;
    wrongAnswers: number;
    successRate: number;
  }
): Promise<void> {
  // 1. Mevcut progress kaydını al
  let progress = await getProgress(studentId, topicId);
  
  if (!progress) {
    // İlk kez çalışılan konu
    progress = await createProgress(studentId, topicId);
  }
  
  // 2. Ortalama başarı oranını hesapla
  const allPerformances = await getTopicPerformances(studentId, topicId);
  const avgSuccessRate = 
    allPerformances.reduce((sum, p) => sum + p.success_rate, 0) / allPerformances.length;
  
  // 3. Mastery level hesapla
  const newMastery = calculateMasteryLevel(
    progress.mastery_level,
    performanceData.successRate,
    avgSuccessRate,
    allPerformances.length
  );
  
  // 4. Next review date hesapla
  const nextReviewDate = calculateNextReviewDate(
    new Date(),
    avgSuccessRate,
    newMastery,
    allPerformances.length
  );
  
  // 5. Progress güncelle
  await updateProgress(progress.id, {
    mastery_level: newMastery,
    success_rate_avg: avgSuccessRate,
    attempt_count: allPerformances.length,
    last_performance_date: new Date().toISOString(),
    next_review_date: nextReviewDate.toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // 6. Öğrenci istatistiklerini güncelle
  await updateStudentStats(studentId);
  
  // 7. Rozet kontrol et
  await checkAndAwardBadges(studentId);
}

/**
 * Manuel "Tamamlandı" işareti
 */
async function markTopicAsCompleted(
  studentId: string,
  topicId: string
): Promise<void> {
  await updateProgress(progressId, {
    mastery_level: 5,
    success_rate_avg: 100,
    updated_at: new Date().toISOString()
  });
  
  await updateStudentStats(studentId);
  await checkAndAwardBadges(studentId);
}

/**
 * "Tamamlandı" işaretini geri al
 */
async function unmarkTopicAsCompleted(
  studentId: string,
  topicId: string
): Promise<void> {
  // Önceki mastery'ye geri dön (performans geçmişinden hesapla)
  const allPerformances = await getTopicPerformances(studentId, topicId);
  
  if (allPerformances.length > 0) {
    const avgSuccessRate = 
      allPerformances.reduce((sum, p) => sum + p.success_rate, 0) / allPerformances.length;
    
    let newMastery = 0;
    if (avgSuccessRate >= 85) newMastery = 4;
    else if (avgSuccessRate >= 70) newMastery = 3;
    else if (avgSuccessRate >= 50) newMastery = 2;
    else newMastery = 1;
    
    await updateProgress(progressId, {
      mastery_level: newMastery,
      success_rate_avg: avgSuccessRate,
      updated_at: new Date().toISOString()
    });
  } else {
    // Hiç performans yoksa sıfırla
    await updateProgress(progressId, {
      mastery_level: 0,
      success_rate_avg: 0,
      updated_at: new Date().toISOString()
    });
  }
  
  await updateStudentStats(studentId);
}
```

---

## 📋 HAFTALIK PLAN ÖNERİSİ

```typescript
// plan-generator.service.ts

interface PlanSuggestion {
  newTopics: Topic[];           // Yeni konular
  reviewTopics: ReviewSchedule[];  // Tekrar konuları (spaced repetition)
  badges: BadgeProgress[];      // Yaklaşan rozetler
  streak: number;               // Günlük streak
  totalPlannedHours: number;    // Toplam tahmini süre
}

async function generateWeeklyPlanSuggestion(
  studentId: string,
  targetDate: Date = new Date()
): Promise<PlanSuggestion> {
  // 1. Tekrar konularını al (Mastery 1-4, tamamlanmayanlar)
  const reviewTopics = await getDueTopicsForStudent(
    studentId,
    targetDate,
    true  // excludeCompleted = true → Mastery 5 çıkmasın!
  );
  
  // 2. Yeni konu önerisi (henüz başlanmayan veya az çalışılan)
  const newTopics = await suggestNewTopics(studentId, {
    excludeCompleted: true,  // Tamamlananlar ÇIKMASIN
    limit: 5,
    preferSubjects: await getStudentTargetExamSubjects(studentId)
  });
  
  // 3. Rozet ilerlemesi
  const badges = await getBadgeProgress(studentId);
  const nearBadges = badges
    .filter(b => !b.earned && b.percentage >= 50)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);
  
  // 4. Streak hesapla
  const student = await getStudent(studentId);
  const streak = calculateCurrentStreak(studentId);
  
  // 5. Toplam süre tahmini
  const totalHours = estimateTotalDuration(newTopics, reviewTopics);
  
  return {
    newTopics,
    reviewTopics: reviewTopics.slice(0, 8),  // En fazla 8 tekrar konusu
    badges: nearBadges,
    streak,
    totalPlannedHours: totalHours
  };
}

/**
 * Yeni konu önerisi
 * KURAL: Mastery 5 olanlar ÇIKMASıN
 */
async function suggestNewTopics(
  studentId: string,
  options: {
    excludeCompleted: boolean;
    limit: number;
    preferSubjects: string[];
  }
): Promise<Topic[]> {
  const { excludeCompleted, limit, preferSubjects } = options;
  
  // Öğrencinin tüm progress kayıtlarını al
  const progressMap = await getStudentProgressMap(studentId);
  
  // Tüm konuları al
  const allTopics = await db.all(`
    SELECT t.*, s.name as subject_name
    FROM topics t
    JOIN subjects s ON t.subjectId = s.id
    WHERE s.category IN (${preferSubjects.map(() => '?').join(',')})
    ORDER BY t.priority DESC, t.order ASC
  `, preferSubjects);
  
  const suggestions: Topic[] = [];
  
  for (const topic of allTopics) {
    const progress = progressMap.get(topic.id);
    
    // Tamamlanan konular ÇıKMASıN
    if (excludeCompleted && progress?.mastery_level === 5) {
      continue;
    }
    
    // Henüz başlanmayan veya düşük mastery
    if (!progress || progress.mastery_level <= 2) {
      suggestions.push(topic);
    }
    
    if (suggestions.length >= limit) break;
  }
  
  return suggestions;
}
```

---

## 🔒 GÜVENLİK & VALIDASYON STRATEJİSİ

### Authentication & Authorization

```typescript
// Tüm API'larda middleware kullan
app.use('/api/topic-performance', requireAuth);
app.use('/api/weekly-plans', requireAuth);

// Sadece kendi öğrencilerine erişim (role bazlı)
async function checkStudentAccess(req, res, next) {
  const { studentId } = req.params;
  const user = req.user;
  
  if (user.role === 'admin') {
    return next();  // Admin herkese erişebilir
  }
  
  if (user.role === 'counselor') {
    // Danışman sadece kendi öğrencilerine
    const student = await getStudent(studentId);
    if (student.counselorId === user.id) {
      return next();
    }
  }
  
  return res.status(403).json({ error: 'Bu öğrenciye erişim izniniz yok' });
}
```

### Validation (Zod)

```typescript
// types/topic-performance.types.ts

import { z } from 'zod';

export const CreatePerformanceSchema = z.object({
  studentId: z.string().uuid(),
  topicId: z.string().uuid(),
  assignmentId: z.string().uuid().optional(),
  questionsSolved: z.number().int().positive(),
  correctAnswers: z.number().int().nonnegative(),
  wrongAnswers: z.number().int().nonnegative(),
  durationMinutes: z.number().int().positive().max(300),  // Max 5 saat
  difficultyFeedback: z.enum(['very_easy', 'easy', 'medium', 'hard', 'very_hard']).optional(),
  notes: z.string().max(500).optional()
}).refine(data => {
  // Doğru + Yanlış = Toplam Soru
  return data.correctAnswers + data.wrongAnswers === data.questionsSolved;
}, {
  message: 'Doğru + Yanlış cevaplar toplam soru sayısına eşit olmalı'
});

// Route'da kullan
router.post('/topic-performance', async (req, res) => {
  try {
    const validated = CreatePerformanceSchema.parse(req.body);
    const result = await topicPerformanceService.create(validated);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    throw error;
  }
});
```

### Error Handling

```typescript
// Global error handler
app.use((error, req, res, next) => {
  console.error('[API Error]', error);
  
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.errors
    });
  }
  
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Veritabanı kısıtlama hatası',
      message: 'Bu kayıt zaten mevcut veya geçersiz ilişki'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
  });
});
```

---

## 🛠️ DATABASE MIGRATION STRATEJİSİ

```typescript
// server/lib/database/migrations/topic-tracking-migration.ts

export function runTopicTrackingMigration(db: Database.Database): void {
  console.log('📊 Running Topic Tracking Migration...');
  
  // 1. topic_performance tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS topic_performance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      assignment_id TEXT,
      date TEXT NOT NULL,
      questions_solved INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      wrong_answers INTEGER NOT NULL,
      duration_minutes INTEGER,
      difficulty_feedback TEXT CHECK(difficulty_feedback IN ('very_easy', 'easy', 'medium', 'hard', 'very_hard')),
      notes TEXT,
      success_rate REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      FOREIGN KEY (assignment_id) REFERENCES study_assignments(id) ON DELETE SET NULL
    );
  `);
  
  // 2. progress tablosu genişletme (güvenli ALTER TABLE)
  const progressColumns = db.pragma('table_info(progress)');
  const existingColumns = progressColumns.map(c => c.name);
  
  if (!existingColumns.includes('mastery_level')) {
    db.exec('ALTER TABLE progress ADD COLUMN mastery_level INTEGER DEFAULT 0 CHECK(mastery_level BETWEEN 0 AND 5)');
  }
  if (!existingColumns.includes('success_rate_avg')) {
    db.exec('ALTER TABLE progress ADD COLUMN success_rate_avg REAL DEFAULT 0');
  }
  if (!existingColumns.includes('attempt_count')) {
    db.exec('ALTER TABLE progress ADD COLUMN attempt_count INTEGER DEFAULT 0');
  }
  if (!existingColumns.includes('last_performance_date')) {
    db.exec('ALTER TABLE progress ADD COLUMN last_performance_date TEXT');
  }
  if (!existingColumns.includes('next_review_date')) {
    db.exec('ALTER TABLE progress ADD COLUMN next_review_date TEXT');
  }
  
  // 3. weekly_plans tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_plans (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      week_start_date TEXT NOT NULL,
      week_end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'completed', 'cancelled')),
      pdf_path TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  
  // 4. weekly_plan_topics tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_plan_topics (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      topic_type TEXT NOT NULL CHECK(topic_type IN ('new', 'review')),
      priority INTEGER DEFAULT 0,
      review_reason TEXT,
      estimated_duration_minutes INTEGER,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (plan_id) REFERENCES weekly_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
  `);
  
  // 5. badges tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      criteria_type TEXT NOT NULL CHECK(criteria_type IN ('mastery_count', 'streak', 'total_questions', 'perfect_week')),
      criteria_value INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('mastery', 'streak', 'questions', 'achievement'))
    );
  `);
  
  // 6. student_badges tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_badges (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
      UNIQUE(student_id, badge_id)
    );
  `);
  
  // 7. students tablosu genişletme
  const studentColumns = db.pragma('table_info(students)');
  const existingStudentColumns = studentColumns.map(c => c.name);
  
  if (!existingStudentColumns.includes('target_exams')) {
    db.exec("ALTER TABLE students ADD COLUMN target_exams TEXT DEFAULT '[]'");
  }
  if (!existingStudentColumns.includes('current_streak')) {
    db.exec('ALTER TABLE students ADD COLUMN current_streak INTEGER DEFAULT 0');
  }
  if (!existingStudentColumns.includes('longest_streak')) {
    db.exec('ALTER TABLE students ADD COLUMN longest_streak INTEGER DEFAULT 0');
  }
  if (!existingStudentColumns.includes('last_activity_date')) {
    db.exec('ALTER TABLE students ADD COLUMN last_activity_date TEXT');
  }
  if (!existingStudentColumns.includes('total_questions_solved')) {
    db.exec('ALTER TABLE students ADD COLUMN total_questions_solved INTEGER DEFAULT 0');
  }
  if (!existingStudentColumns.includes('expert_topic_count')) {
    db.exec('ALTER TABLE students ADD COLUMN expert_topic_count INTEGER DEFAULT 0');
  }
  
  // 8. İndeksler oluştur
  createTopicTrackingIndexes(db);
  
  // 9. Varsayılan rozetleri ekle
  seedDefaultBadges(db);
  
  console.log('✅ Topic Tracking Migration completed');
}

function createTopicTrackingIndexes(db: Database.Database): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_topic_performance_student ON topic_performance(student_id);
    CREATE INDEX IF NOT EXISTS idx_topic_performance_topic ON topic_performance(topic_id);
    CREATE INDEX IF NOT EXISTS idx_topic_performance_date ON topic_performance(date DESC);
    CREATE INDEX IF NOT EXISTS idx_topic_performance_assignment ON topic_performance(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_weekly_plans_student ON weekly_plans(student_id);
    CREATE INDEX IF NOT EXISTS idx_weekly_plans_date ON weekly_plans(week_start_date DESC);
    CREATE INDEX IF NOT EXISTS idx_weekly_plan_topics_plan ON weekly_plan_topics(plan_id);
    CREATE INDEX IF NOT EXISTS idx_weekly_plan_topics_topic ON weekly_plan_topics(topic_id);
    CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
  `);
}

function seedDefaultBadges(db: Database.Database): void {
  // Rozet verileri ekle (DEFAULT_BADGES)
  // ...
}
```

---

## 🎨 FRONTEND - KONU TAKİBİ SEKMESI

### 📍 Navigasyon Yapısı

```tsx
// client/pages/StudentProfile/StudentProfile.tsx

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
    
    {/* ✅ AKADEMİK DURUM ALTINDA KONU TAKİP */}
    <TabsTrigger value="academic-status">Akademik Durum</TabsTrigger>
    
    <TabsTrigger value="counseling">Görüşmeler</TabsTrigger>
    <TabsTrigger value="ai-insights">AI İçgörüler</TabsTrigger>
  </TabsList>
  
  <TabsContent value="academic-status">
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Genel</TabsTrigger>
        <TabsTrigger value="exams">Sınav Sonuçları</TabsTrigger>
        
        {/* ✅ KONU TAKİP AKADEMİK DURUM ALTINDA */}
        <TabsTrigger value="topic-tracking">Konu Takibi</TabsTrigger>
        
        <TabsTrigger value="goals">Hedefler</TabsTrigger>
      </TabsList>
      
      <TabsContent value="topic-tracking">
        <TopicTrackingTab studentId={studentId} />
      </TabsContent>
    </Tabs>
  </TabsContent>
</Tabs>
```

### 🎯 Konu Takip Sekmesi Bileşenleri

```tsx
// client/components/features/topic-tracking/TopicTrackingTab.tsx

export function TopicTrackingTab({ studentId }: { studentId: string }) {
  return (
    <div className="space-y-6">
      {/* 1. Özet Kartlar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="Toplam Konu" 
          value={stats.totalTopics}
          icon={<BookOpen />}
        />
        <StatCard 
          title="Tamamlanan" 
          value={stats.completedTopics}
          icon={<CheckCircle />}
          color="green"
        />
        <StatCard 
          title="Çalışılan" 
          value={stats.inProgressTopics}
          icon={<Clock />}
          color="blue"
        />
        <StatCard 
          title="Günlük Streak" 
          value={stats.currentStreak}
          icon={<Flame />}
          color="orange"
        />
      </div>
      
      {/* 2. Haftalık Plan Oluşturma */}
      <WeeklyPlanGenerator studentId={studentId} />
      
      {/* 3. Konu Listesi (Mastery gösterimi) */}
      <TopicMasteryList studentId={studentId} />
      
      {/* 4. Tekrar Planı */}
      <UpcomingReviewsWidget studentId={studentId} />
      
      {/* 5. Rozet Vitrini */}
      <BadgeShowcase studentId={studentId} />
    </div>
  );
}
```

### 📝 Hızlı Performans Giriş Dialogu

```tsx
// client/components/features/topic-tracking/QuickPerformanceDialog.tsx

export function QuickPerformanceDialog({ 
  studentId,
  topicId,
  topicName,
  onSave 
}: Props) {
  const [formData, setFormData] = useState({
    questionsSolved: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    durationMinutes: 0,
    difficultyFeedback: 'medium',
    notes: ''
  });
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{topicName} - Performans Girişi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Soru Sayısı */}
          <div>
            <Label>Toplam Soru Sayısı</Label>
            <Input 
              type="number" 
              value={formData.questionsSolved}
              onChange={e => setFormData({...formData, questionsSolved: +e.target.value})}
            />
          </div>
          
          {/* Doğru Cevaplar */}
          <div>
            <Label>Doğru Cevaplar</Label>
            <Input 
              type="number" 
              value={formData.correctAnswers}
              onChange={e => setFormData({...formData, correctAnswers: +e.target.value})}
            />
          </div>
          
          {/* Yanlış Cevaplar */}
          <div>
            <Label>Yanlış Cevaplar</Label>
            <Input 
              type="number" 
              value={formData.wrongAnswers}
              onChange={e => setFormData({...formData, wrongAnswers: +e.target.value})}
            />
          </div>
          
          {/* Süre */}
          <div>
            <Label>Süre (dakika)</Label>
            <Input 
              type="number" 
              value={formData.durationMinutes}
              onChange={e => setFormData({...formData, durationMinutes: +e.target.value})}
            />
          </div>
          
          {/* Zorluk */}
          <div>
            <Label>Zorluk Seviyesi</Label>
            <Select 
              value={formData.difficultyFeedback}
              onValueChange={v => setFormData({...formData, difficultyFeedback: v})}
            >
              <SelectItem value="very_easy">Çok Kolay</SelectItem>
              <SelectItem value="easy">Kolay</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="hard">Zor</SelectItem>
              <SelectItem value="very_hard">Çok Zor</SelectItem>
            </Select>
          </div>
          
          {/* Başarı Oranı (Otomatik Hesaplanan) */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Başarı Oranı: {calculateSuccessRate(formData)}%
            </AlertDescription>
          </Alert>
          
          {/* Notlar */}
          <div>
            <Label>Notlar (Opsiyonel)</Label>
            <Textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Ekstra notlar..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => handleSave(formData)}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 📊 Konu Ustalık Listesi

```tsx
// client/components/features/topic-tracking/TopicMasteryList.tsx

export function TopicMasteryList({ studentId }: { studentId: string }) {
  const { data: topicsWithProgress } = useQuery({
    queryKey: ['topic-mastery', studentId],
    queryFn: () => api.get(`/progress/student/${studentId}`)
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konu Bazlı İlerleme</CardTitle>
      </CardHeader>
      <CardContent>
        {topicsWithProgress?.map(topic => (
          <div key={topic.id} className="flex items-center justify-between p-3 border-b">
            {/* Konu Adı */}
            <div className="flex-1">
              <p className="font-medium">{topic.topicName}</p>
              <p className="text-sm text-muted-foreground">{topic.subjectName}</p>
            </div>
            
            {/* Mastery Level */}
            <div className="flex items-center gap-4">
              <MasteryBadge level={topic.masteryLevel} />
              
              {/* Hızlı Aksiyonlar */}
              <div className="flex gap-2">
                {/* Performans Gir */}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openPerformanceDialog(topic)}
                >
                  <Plus /> Sonuç Gir
                </Button>
                
                {/* Tamamlandı Checkbox */}
                <Checkbox 
                  checked={topic.masteryLevel === 5}
                  onCheckedChange={checked => {
                    if (checked) {
                      markAsCompleted(studentId, topic.topicId);
                    } else {
                      unmarkAsCompleted(studentId, topic.topicId);
                    }
                  }}
                />
                <Label>Tamamlandı</Label>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MasteryBadge({ level }: { level: number }) {
  const config = {
    0: { label: 'Başlanmadı', color: 'gray', icon: <Circle /> },
    1: { label: 'Başlangıç', color: 'red', icon: <Target /> },
    2: { label: 'Orta', color: 'yellow', icon: <TrendingUp /> },
    3: { label: 'İyi', color: 'blue', icon: <Award /> },
    4: { label: 'Çok İyi', color: 'purple', icon: <Star /> },
    5: { label: 'Uzman', color: 'green', icon: <CheckCircle /> }
  }[level];
  
  return (
    <Badge className={`bg-${config.color}-500`}>
      {config.icon} {config.label}
    </Badge>
  );
}
```

---

## 📄 PDF OLUŞTURMA

(Önceki tasarım aynı, sadece ilişkisel veri kullan)

```typescript
// weekly-plan-topics tablosundan konuları al
const planTopics = await db.all(`
  SELECT 
    wpt.*,
    t.name as topic_name,
    s.name as subject_name,
    s.category as exam_category
  FROM weekly_plan_topics wpt
  JOIN topics t ON wpt.topic_id = t.id
  JOIN subjects s ON t.subjectId = s.id
  WHERE wpt.plan_id = ?
  ORDER BY wpt.topic_type, wpt.priority DESC
`, [planId]);

const newTopics = planTopics.filter(t => t.topic_type === 'new');
const reviewTopics = planTopics.filter(t => t.topic_type === 'review');

// PDF oluştur...
```

---

## 🚀 DEPLOYMENT PLANI

### Faz 1: Veritabanı & Backend (1 hafta)
1. Migration script'lerini çalıştır
2. Repository katmanı
3. Service katmanı (mastery, spaced-repetition, badge)
4. API endpoint'leri
5. Testler

### Faz 2: Frontend (1 hafta)
1. Konu Takip sekmesi UI
2. Performans giriş dialogları
3. Mastery listesi
4. Haftalık plan oluşturma

### Faz 3: PDF & Rozet (3 gün)
1. PDF generator servisi
2. Rozet sistemi UI
3. Streak hesaplama

### Faz 4: Test & Polish (2 gün)
1. End-to-end testler
2. Bug fixing
3. Performans optimizasyonu

---

## ✅ ÖNEMLİ HATIRLATMALAR

1. **Tamamlanan Konular (Mastery 5) YENİ PLANLARDA ÇIKMAZ** ✅
2. **Tamamlanmış işareti geri alınırsa tekrar plana girebilir** ✅
3. **Spaced repetition sadece Mastery 1-4 için çalışır** ✅
4. **Başarı oranı düşükse tekrar aralığı KISA** ✅
5. **İlişkisel tablolar kullan, JSON değil** ✅
6. **Konu Takip sekmesi Akademik Durum altında** ✅
7. **Güvenlik, validasyon, error handling ekle** ✅
8. **Migration stratejisi hazır** ✅

---

**Son Güncelleme:** 23 Kasım 2025  
**Durum:** Hazır - Geliştirmeye Başlanabilir ✅
