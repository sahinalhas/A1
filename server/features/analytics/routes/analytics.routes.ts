import express from 'express';
import { getReportsOverview, getStudentAnalytics, forceRefreshAnalytics, invalidateAnalyticsCache } from '../services/analytics.service.js';
import { getCacheStats } from '../repository/cache.repository.js';

const router = express.Router();

router.get('/reports-overview', async (req, res) => {
  try {
    const data = await getReportsOverview();
    res.json(data);
  } catch (error) {
    console.error('Error fetching reports overview:', error);
    res.status(500).json({ error: 'Rapor verileri alınamadı' });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await getStudentAnalytics(studentId);
    
    if (!data) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ error: 'Öğrenci analitik verileri alınamadı' });
  }
});

router.post('/invalidate-cache', (req, res) => {
  try {
    invalidateAnalyticsCache();
    const count = forceRefreshAnalytics();
    res.json({ message: `Cache temizlendi ve ${count} öğrenci için analitikler yenilendi` });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({ error: 'Cache temizlenemedi' });
  }
});

router.get('/cache-stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Cache istatistikleri alınamadı' });
  }
});

export default router;
