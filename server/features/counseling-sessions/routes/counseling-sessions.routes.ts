import { Request, Response } from 'express';
import * as service from '../services/counseling-sessions.service.js';
import { autoSyncHooks } from '../../profile-sync/index.js';

export function getAllCounselingSessions(req: Request, res: Response) {
  try {
    const filters = req.query;
    
    if (Object.keys(filters).length === 0) {
      const sessions = service.getAllSessionsWithStudents();
      return res.json(sessions);
    }
    
    const sessions = service.getFilteredSessionsWithStudents(filters);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json({ error: 'Görüşmeler yüklenemedi' });
  }
}

export function getActiveCounselingSessions(req: Request, res: Response) {
  try {
    const sessions = service.getActiveSessionsWithStudents();
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching active counseling sessions:', error);
    res.status(500).json({ error: 'Aktif görüşmeler yüklenemedi' });
  }
}

export function getCounselingSessionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = service.getSessionByIdWithStudents(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Görüşme bulunamadı' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching counseling session:', error);
    res.status(500).json({ error: 'Görüşme yüklenemedi' });
  }
}

export function createCounselingSession(req: Request, res: Response) {
  try {
    const { id, sessionType, counselorId, sessionDate, entryTime, studentIds } = req.body;
    
    if (!id || !sessionType || !counselorId || !sessionDate || !entryTime) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'En az bir öğrenci seçilmelidir' });
    }
    
    const result = service.createCounselingSession(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating counseling session:', error);
    res.status(500).json({ error: 'Görüşme kaydedilemedi' });
  }
}

export function completeCounselingSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const completionData = req.body;
    
    if (!completionData.exitTime) {
      return res.status(400).json({ error: 'Çıkış saati gereklidir' });
    }
    
    if (!completionData.topic) {
      return res.status(400).json({ error: 'Görüşme konusu seçilmelidir' });
    }
    
    const result = service.completeCounselingSession(id, completionData);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Görüşme bulunamadı' });
    }
    
    // 🔥 OTOMATIK PROFİL SENKRONIZASYONU - Görüşme tamamlandığında profili güncelle
    const session = service.getSessionByIdWithStudents(id);
    if (session) {
      autoSyncHooks.onCounselingSessionCompleted({
        id,
        ...completionData,
        studentId: session.sessionType === 'individual' ? (session as any).student?.id : undefined,
        studentIds: session.sessionType === 'group' ? (session as any).students?.map((s: any) => s.id) : undefined
      }).catch(error => {
        console.error('Profile sync failed after counseling session:', error);
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing counseling session:', error);
    res.status(500).json({ error: 'Görüşme tamamlanamadı' });
  }
}

export function extendCounselingSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.extendCounselingSession(id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Görüşme bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error extending counseling session:', error);
    res.status(500).json({ error: 'Görüşme uzatılamadı' });
  }
}

export function autoCompleteCounselingSessions(req: Request, res: Response) {
  try {
    const result = service.autoCompleteSessions();
    res.json(result);
  } catch (error) {
    console.error('Error auto-completing counseling sessions:', error);
    res.status(500).json({ error: 'Otomatik tamamlama başarısız' });
  }
}

export function deleteCounselingSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = service.deleteCounselingSession(id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Görüşme bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting counseling session:', error);
    res.status(500).json({ error: 'Görüşme silinemedi' });
  }
}

export function getClassHours(req: Request, res: Response) {
  try {
    const classHours = service.getClassHours();
    res.json(classHours);
  } catch (error) {
    console.error('Error fetching class hours:', error);
    res.status(500).json({ error: 'Ders saatleri yüklenemedi' });
  }
}

export function getCounselingTopics(req: Request, res: Response) {
  try {
    const topics = service.getCounselingTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching counseling topics:', error);
    res.status(500).json({ error: 'Görüşme konuları yüklenemedi' });
  }
}
