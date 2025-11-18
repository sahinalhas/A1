import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { mebbisTransferManager } from '../services/mebbis-transfer-manager.service.js';
import type { StartTransferRequest } from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';

const router = Router();

router.post('/start-transfer', async (req, res) => {
  try {
    const request = req.body as StartTransferRequest;
    
    if (!request.sessionIds || request.sessionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'En az bir görüşme seçilmelidir'
      });
    }

    const transferId = uuidv4();
    
    logger.info(`Starting MEBBIS transfer ${transferId} for ${request.sessionIds.length} sessions`, 'MEBBISRoutes');
    
    mebbisTransferManager.startTransfer(transferId, request);
    
    res.json({
      success: true,
      transferId,
      totalSessions: request.sessionIds.length,
      message: 'MEBBIS aktarımı başlatıldı'
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to start MEBBIS transfer', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/cancel-transfer', async (req, res) => {
  try {
    const { transferId } = req.body;
    
    if (!transferId) {
      return res.status(400).json({
        success: false,
        error: 'transferId gereklidir'
      });
    }

    logger.info(`Cancelling MEBBIS transfer ${transferId}`, 'MEBBISRoutes');
    
    await mebbisTransferManager.cancelTransfer(transferId);
    
    res.json({
      success: true,
      message: 'Aktarım iptal edildi'
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to cancel MEBBIS transfer', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/status/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    
    if (!transferId) {
      return res.status(400).json({
        success: false,
        error: 'transferId gereklidir'
      });
    }

    const status = mebbisTransferManager.getStatus(transferId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Aktarım bulunamadı'
      });
    }
    
    res.json({
      success: true,
      transferId,
      status: status.status,
      progress: status.progress,
      errors: status.errors
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to get MEBBIS transfer status', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
