# Rehberlik Servisi Mimarisi - Faz Faz Implementasyon Kılavuzu

**Amaç:** Kurumsal rehberlik servisinin güvenli, kurum-odaklı ve veri-gizlilik-uyumlu olarak yapılandırılması.

---

## 📋 Sistem Tasarımı Özeti

### Roller ve Hiyerarşi

```
┌─────────────────────────────────────────┐
│ Rehberlik Servisi (Institution)         │
├─────────────────────────────────────────┤
│                                         │
│  1 Rehber → Admin (Sistem Yönetimi)    │
│     ⊕ Sadece sistem admin işlemleri    │
│     ⊕ Kullanıcı ekle/düzenle           │
│     ⊕ Ayarları yönet                   │
│     ⊕ Genel raporlar görebilir         │
│                                         │
│  N Rehber → Counselor (Rehberlik)      │
│     ⊕ Tüm öğrenci verilerine erişim    │
│     ⊕ Kendi session'larını yönet       │
│     ⊕ Diğer rehberlerin session'larından  │
│       temel notları görebilir (özel kısım │
│       değil)                            │
│     ⊕ Kendi session özel notlarına      │
│       sadece kendisi erişebilir         │
│                                         │
└─────────────────────────────────────────┘
```

### Veri Erişim Seviyeleri

| Seviye | Açıklama | Erişim Kabiliyeti |
|--------|----------|------------------|
| **PRIVATE** | Rehberin kişisel notları, özel gözlemler | Sadece rehber kendisi |
| **SHARED** | Öğrenci temel bilgileri, ders notları | Tüm rehberler + admin |
| **SYSTEM** | Ayarlar, kullanıcı yönetimi, sistem logs | Sadece admin |
| **INSTITUTIONAL** | Okul genel raporları, istatistikler | Admin + tüm rehberler |

---

## 🔄 Faz Faz Implementasyon Planı

### **FAZ 1: Analiz ve Tasarım (Dokümantasyon)**
**Amaç:** Mevcut sistemi analiz edip yeni mimaride ne değişeceğini belirtmek.

#### Görevler:
- [ ] Mevcut veritabanı şemasını dokümante et (users, students, counseling_sessions vb.)
- [ ] Mevcut role permission sistemini analiz et (client/lib/auth-context.tsx, server/features/users/services/users.service.ts)
- [ ] Mevcut backend endpoints'leri tarayıp institution filtering gerekliliklerini belirle
- [ ] Frontend components'lerini tarayıp authorization logic'lerini belirle
- [ ] Entity Relationship Diagram (ERD) hazırla (yeni mimari için)

**Çıktı:** `MIMARI_ANALIZ.md` - Tüm değişikliklerin detaylı listesi

---

### **FAZ 2: Veritabanı Şeması Güncellemesi**
**Amaç:** Yeni role ve permission yapısını desteklemek için veritabanı tabloları oluştur.

#### Görevler:

**2.1 - Yeni Tablolar**
- [ ] `institutions` tablosu oluştur
  ```sql
  CREATE TABLE institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  ```

- [ ] `institutions_settings` tablosu oluştur (kurum başına ayarlar)
  ```sql
  CREATE TABLE institutions_settings (
    id TEXT PRIMARY KEY,
    institution_id TEXT FOREIGN KEY,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    UNIQUE(institution_id, setting_key)
  )
  ```

- [ ] `data_sensitivity_levels` tablosu oluştur (veri gizlilik seviyeleri)
  ```sql
  CREATE TABLE data_sensitivity_levels (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    record_id TEXT NOT NULL,
    sensitivity_level TEXT NOT NULL CHECK(sensitivity_level IN ('PRIVATE', 'SHARED', 'SYSTEM', 'INSTITUTIONAL')),
    owner_user_id TEXT NOT NULL,
    institution_id TEXT NOT NULL,
    createdAt DATETIME,
    UNIQUE(entity_type, record_id)
  )
  ```

**2.2 - Var Olan Tablo Modifikasyonları**
- [ ] `users` tablosuna yeni kolonlar ekle
  ```sql
  ALTER TABLE users ADD COLUMN institution_id TEXT NOT NULL;
  ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'counselor' CHECK(user_type IN ('admin', 'counselor', 'teacher', 'student', 'parent'));
  ALTER TABLE users ADD COLUMN is_counseling_admin BOOLEAN DEFAULT FALSE;
  ALTER TABLE users ADD COLUMN counselor_specializations TEXT; -- JSON
  CREATE INDEX idx_users_institution_id ON users(institution_id);
  ```

- [ ] `counseling_sessions` tablosuna yeni kolonlar ekle
  ```sql
  ALTER TABLE counseling_sessions ADD COLUMN counselor_private_notes TEXT;
  ALTER TABLE counseling_sessions ADD COLUMN shared_summary TEXT;
  ALTER TABLE counseling_sessions ADD COLUMN visibility TEXT DEFAULT 'SHARED' CHECK(visibility IN ('PRIVATE', 'SHARED'));
  ```

- [ ] `students` tablosuna kurumsal bağlantı ekle
  ```sql
  ALTER TABLE students ADD COLUMN institution_id TEXT NOT NULL;
  CREATE INDEX idx_students_institution_id ON students(institution_id);
  ```

**2.3 - Yardımcı Tablolar**
- [ ] `user_permissions` tablosu oluştur (sistem kurumsal izinler)
  ```sql
  CREATE TABLE user_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    permission TEXT NOT NULL,
    granted_by_user_id TEXT,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (granted_by_user_id) REFERENCES users(id)
  )
  ```

**Çıktı:** `server/lib/database/migrations/002-institution-architecture.ts` migration dosyası

---

### **FAZ 3: Backend Mimarisi Güncellemesi**
**Amaç:** Veritabanı değişikliklerini kullanarak yeni authorization ve filtering sistemini implement et.

#### Görevler:

**3.1 - Yeni Service Layer**
- [ ] `server/features/institutions/services/institutions.service.ts` oluştur
  - Institution CRUD operasyonları
  - Institution settings yönetimi
  - Kurumsal raporlar

- [ ] `server/features/data-permissions/services/data-permissions.service.ts` oluştur
  - Data sensitivity level kontrolü
  - Veri erişim validasyonu
  - Cross-counselor sharing kuralları

**3.2 - Authorization Middleware Güncelleme**
- [ ] `server/middleware/authorization.ts` güncelle
  - Institution-based filtering ekle
  - Counselor vs Admin logic'i ayrıştır
  - Private vs Shared veri kontrolü

- [ ] `server/middleware/institution-filter.ts` oluştur
  - Otomatik institution_id ekleme
  - Request'te institution validation
  - Cross-institution erişim engelleme

**3.3 - User Service Güncellemesi**
- [ ] `server/features/users/services/users.service.ts` güncelle
  ```
  - createUser() → institution_id, user_type ekleme
  - updateUser() → permission kontrolleri
  - assignCounselingAdmin() → yeni fonksiyon
  - getInstitutionUsers() → kurum rehberleri listesi
  - getUserPermissions() → yeni permission sistemi
  ```

**3.4 - Counseling Sessions Service Güncelleme**
- [ ] `server/features/counseling-sessions/services/counseling-sessions.service.ts` güncelle
  ```
  - createSession() → private_notes, shared_summary ayrımı
  - updateSession() → veri erişim kontrolü
  - getVisibleSessions() → rehberin görebileceği sessions
  - getSessionSummary() → shared bilgiler (özel notlar filtreli)
  - getInstitutionSessionStatistics() → kurum istatistikleri
  ```

**3.5 - Endpoints Güncelleme**
- [ ] `/api/users/*` endpoints'lerini güncelle
  - `POST /api/users/create` → institution_id gerekli
  - `GET /api/users/institution/:id` → yeni endpoint

- [ ] `/api/counseling-sessions/*` endpoints'lerini güncelle
  - `GET /api/counseling-sessions` → institution filtering
  - `GET /api/counseling-sessions/:id/summary` → yeni endpoint (shared data)
  - `POST /api/counseling-sessions/:id/private-notes` → yeni endpoint

- [ ] `/api/institutions/*` endpoints'lerini oluştur
  - `POST /api/institutions` → yeni kurum
  - `GET /api/institutions/:id/counselors` → kurum rehberleri
  - `GET /api/institutions/:id/statistics` → kurum istatistikleri

**Çıktı:** Tüm backend services ve endpoints'ler güncellendi

---

### **FAZ 4: Frontend Authentication Context Güncellemesi**
**Amaç:** Yeni role ve permission sistemini frontend'e taşı.

#### Görevler:

**4.1 - Auth Context Refactor**
- [ ] `client/lib/auth-context.tsx` güncelle
  ```
  - UserRole type'ını extend et: 'admin' | 'counselor' | 'teacher' | 'student' | 'parent'
  - Institution field ekle User interface'ine
  - isCounselingAdmin field ekle
  - userPermissions array ekle
  - ROLE_PERMISSIONS yeniden yapılandır (institution-based)
  - hasInstitutionAccess() fonksiyonu ekle
  - canAccessData(recordId, sensitivityLevel) fonksiyonu ekle
  ```

**4.2 - Protected Routes Güncellemesi**
- [ ] `client/components/auth/ProtectedRoute.tsx` güncelle
  - Institution check'i ekle
  - Data sensitivity level validation

**4.3 - Hook'lar Oluşturma**
- [ ] `client/hooks/useInstitution.ts` oluştur
  - Mevcut institution verisini get etme
  - Institution-specific operations

- [ ] `client/hooks/useDataAccess.ts` oluştur
  - Veri erişim kontrolü
  - Sensitivity level checking

**Çıktı:** Frontend authorization sistemi tamamlandı

---

### **FAZ 5: UI Components Güncellemesi**
**Amaç:** Yeni rol ve veri erişim yapısını UI'da göster.

#### Görevler:

**5.1 - Admin Paneli**
- [ ] Admin dashboard'unu güncelle (institution management)
  - Kurumlar listesi
  - Rehber öğretmenleri yönetme
  - Sistem ayarları

- [ ] `client/pages/Admin/InstitutionManagement.tsx` oluştur
  - Institution CRUD
  - Rehber ekle/çıkar

**5.2 - Counselor Paneli**
- [ ] Counselor dashboard'unu güncelle
  - Kendi ve diğer rehberlerin sessions'larını göster
  - Private vs Shared bilgi göster (tablar)

- [ ] `client/components/CounselingSession/PrivateNotesEditor.tsx` oluştur
  - Private notes (sadece rehber kendisi görebilir)

- [ ] `client/components/CounselingSession/SharedSummaryViewer.tsx` oluştur
  - Tüm rehberlerin görebileceği özet

**5.3 - Student/Parent/Teacher Panelleri**
- [ ] Placeholder pages oluştur (gelecekte geliştirmeler için)

**Çıktı:** Tüm UI components güncellenip styling tamamlandı

---

### **FAZ 6: Migration Script ve Data Transfer**
**Amaç:** Mevcut verileri yeni şemaya güvenli bir şekilde transfer et.

#### Görevler:

**6.1 - Migration Script**
- [ ] `server/lib/database/migrations/003-data-transfer.ts` oluştur
  ```
  - Var olan users'ları varsayılan institution'a ata
  - Var olan users'ları institution_id ile güncelle
  - Var olan counseling_sessions'ları data_sensitivity_levels'e ata
  - Backup oluştur (data/database.backup.db)
  ```

**6.2 - Fallback Plan**
- [ ] Migration error handling ekle
- [ ] Rollback script hazırla
- [ ] Data validation script oluştur

**Çıktı:** Data migration tamamlandı ve verified

---

### **FAZ 7: Testing ve Validasyon**
**Amaç:** Tüm sistemin doğru çalıştığını test et.

#### Görevler:

**7.1 - Unit Testing**
- [ ] Authorization service'i test et
- [ ] Data permission service'i test et
- [ ] Institution filtering'i test et

**7.2 - Integration Testing**
- [ ] Counselor A ↔ Counselor B access test
  - Counselor A kendi private notes'larına erişebilir mi?
  - Counselor B, A'nın private notes'larına erişemiyor mu?
  - Counselor B, A'nın shared summary'sini görebilir mi?

- [ ] Admin scenarios
  - Admin tüm rehberlerin shared data'sını görebilir mi?
  - Admin sistem settings'i düzenleyebilir mi?

- [ ] Institution boundaries
  - Kurumsal öğrenciler doğru kurumda mı filtreleniyor?
  - Cross-institution erişim engelleniyor mu?

**7.3 - UI Testing**
- [ ] Rehber dashboard'u private/shared tablarını gösteriyor mu?
- [ ] Admin panel institution management düzgün çalışıyor mu?
- [ ] Permission errors güzel display ediliyor mu?

**Çıktı:** Test raporu ve verification checklist

---

### **FAZ 8: Deployment ve Monitoring**
**Amaç:** Güncellemeleri production'a taşı ve monitor et.

#### Görevler:

- [ ] Database backup'larının var olduğunu doğrula
- [ ] Workflow restart ve full system test
- [ ] Error logging'i monitor et (ilk 24 saat)
- [ ] User feedback'ini topla

---

## 📊 Başlangıç Checklist

### Hazırlık (FAZ 0)
- [ ] `MIMARI_ANALIZ.md` dokümenti okundu ve anlaşıldı
- [ ] Tüm takım bu yapıyla anlaştı
- [ ] Veritabanı backup alındı
- [ ] Development ortamı temiz ve stable

### Her Faz Sonunda
- [ ] Workflow'u restart et (`npm run dev`)
- [ ] Console log'larını kontrol et (error yok mu?)
- [ ] Temel işlevler çalışıyor mu? (login, student view, session create)
- [ ] Yapı.md'yi güncelle (ilerleme notları)

---

## ⚠️ Riskler ve Önlemler

| Risk | Seviye | Önlem |
|------|--------|-------|
| Database corruption | Yüksek | Faz 2'de backup, migration test |
| Breaking existing features | Yüksek | Faz 7'de comprehensive testing |
| User confusion (yeni UI) | Orta | UI düzenlemesinde clear labeling |
| Performance degradation | Orta | Faz 5'de query optimization |
| Rollback gerekliliği | Düşük | Faz 6'da rollback script |

---

## 📝 Döküman Referansları

- `MIMARI_ANALIZ.md` - Detaylı teknik analiz
- `ROLLBACK_PLAN.md` - Geri dönüş prosedürü
- `TESTING_CASES.md` - Test senaryoları
- `DEPLOYMENT_CHECKLIST.md` - Deployment adımları

---

**Son Güncelleme:** 2025-11-27
**Durum:** Ready for Phase 1 (Analysis & Design)
