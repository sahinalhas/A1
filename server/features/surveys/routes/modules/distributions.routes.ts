import { RequestHandler } from "express";
import { v4 as uuidv4 } from 'uuid';
import * as surveyService from '../../services/surveys.service.js';

export const getSurveyDistributions: RequestHandler = (req, res) => {
  try {
    const distributions = surveyService.getAllDistributions();
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching survey distributions:', error);
    res.status(500).json({ success: false, error: 'Anket dağıtımları yüklenemedi' });
  }
};

export const getSurveyDistributionById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const distribution = surveyService.getDistributionById(id);
    
    if (!distribution) {
      return res.status(404).json({ success: false, error: 'Anket dağıtımı bulunamadı' });
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching survey distribution:', error);
    res.status(500).json({ success: false, error: 'Anket dağıtımı yüklenemedi' });
  }
};

export const getSurveyDistributionByPublicLink: RequestHandler = (req, res) => {
  try {
    const { publicLink } = req.params;
    const distribution = surveyService.getDistributionByPublicLink(publicLink);
    
    if (!distribution) {
      return res.status(404).json({ success: false, error: 'Anket bulunamadı' });
    }
    
    try {
      surveyService.validateDistributionStatus(distribution);
    } catch (error: any) {
      return res.status(403).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching survey distribution by link:', error);
    res.status(500).json({ success: false, error: 'Anket yüklenemedi' });
  }
};

export const createSurveyDistribution: RequestHandler = (req, res) => {
  try {
    const distribution = req.body;
    
    if (!distribution.templateId || !distribution.title || !distribution.participationType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Şablon ID, başlık ve katılımcı bilgi toplama türü gereklidir' 
      });
    }

    // Generate ID if not provided
    const distributionData = {
      ...distribution,
      id: distribution.id || uuidv4(),
      publicLink: distribution.publicLink || uuidv4()
    };

    surveyService.createDistribution(distributionData);
    const createdDistribution = surveyService.getDistributionById(distributionData.id);
    res.json({ 
      success: true, 
      message: 'Anket dağıtımı başarıyla oluşturuldu',
      distributionId: distributionData.id,
      publicLink: createdDistribution?.publicLink 
    });
  } catch (error) {
    console.error('Error creating survey distribution:', error);
    res.status(500).json({ success: false, error: 'Anket dağıtımı oluşturulamadı' });
  }
};

export const updateSurveyDistributionHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const distribution = req.body;
    
    surveyService.updateDistribution(id, distribution);
    res.json({ success: true, message: 'Anket dağıtımı başarıyla güncellendi' });
  } catch (error) {
    console.error('Error updating survey distribution:', error);
    res.status(500).json({ success: false, error: 'Anket dağıtımı güncellenemedi' });
  }
};

export const deleteSurveyDistributionHandler: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    surveyService.deleteDistribution(id);
    res.json({ success: true, message: 'Anket dağıtımı başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting survey distribution:', error);
    res.status(500).json({ success: false, error: 'Anket dağıtımı silinemedi' });
  }
};

export const generateDistributionCodesHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentCount } = req.body;
    
    if (!studentCount || studentCount < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geçerli bir öğrenci sayısı gereklidir' 
      });
    }

    const distribution = surveyService.getDistributionById(id);
    if (!distribution) {
      return res.status(404).json({ 
        success: false, 
        error: 'Anket dağıtımı bulunamadı' 
      });
    }

    const codesService = await import('../../services/modules/distribution-codes.service.js');
    const codes = await codesService.generateCodesForDistribution(distribution, studentCount);
    
    res.json({ 
      success: true, 
      message: `${studentCount} güvenlik kodu başarıyla oluşturuldu`,
      codes: codes.map(c => ({ code: c.code, qrCode: c.qrCode }))
    });
  } catch (error) {
    console.error('Error generating distribution codes:', error);
    res.status(500).json({ success: false, error: 'Güvenlik kodları oluşturulamadı' });
  }
};

export const verifyDistributionCodeHandler: RequestHandler = (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Güvenlik kodu gereklidir' 
      });
    }

    const codesService = require('../../services/modules/distribution-codes.service.js');
    const codeRecord = codesService.verifyCode(code);
    
    if (!codeRecord) {
      return res.status(404).json({ 
        success: false, 
        error: 'Geçersiz güvenlik kodu' 
      });
    }

    res.json({ 
      success: true, 
      distributionId: codeRecord.distributionId,
      message: 'Güvenlik kodu doğrulandı'
    });
  } catch (error: any) {
    console.error('Error verifying code:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Kod doğrulanamadı' 
    });
  }
};
