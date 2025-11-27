import type Database from 'better-sqlite3';

export function createGuidanceTipsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guidance_tips (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL CHECK (category IN (
        'PSIKOLOJIK_DANISMANLIK',
        'KARIYER_REHBERLIGI', 
        'OGRENCI_ILETISIMI',
        'VELI_GORUSMESI',
        'KRIZ_YONETIMI',
        'MOTIVASYON',
        'SINIF_YONETIMI',
        'MEVZUAT',
        'TEKNIK_BILGI',
        'GENEL'
      )),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT DEFAULT 'AI',
      importance TEXT DEFAULT 'NORMAL' CHECK (importance IN ('DUSUK', 'NORMAL', 'YUKSEK', 'KRITIK')),
      isRead INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      viewCount INTEGER DEFAULT 0,
      lastShownAt DATETIME,
      generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guidance_tips_category ON guidance_tips(category);
    CREATE INDEX IF NOT EXISTS idx_guidance_tips_isActive ON guidance_tips(isActive);
    CREATE INDEX IF NOT EXISTS idx_guidance_tips_lastShownAt ON guidance_tips(lastShownAt);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS guidance_tips_user_views (
      id TEXT PRIMARY KEY,
      tipId TEXT NOT NULL,
      userId TEXT NOT NULL,
      viewedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      dismissed INTEGER DEFAULT 0,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      FOREIGN KEY (tipId) REFERENCES guidance_tips (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guidance_tips_user_views_userId ON guidance_tips_user_views(userId);
    CREATE INDEX IF NOT EXISTS idx_guidance_tips_user_views_tipId ON guidance_tips_user_views(tipId);
  `);
}
