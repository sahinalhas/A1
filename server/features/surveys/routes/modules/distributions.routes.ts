import { RequestHandler } from "express";
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
    
    if (!distribution.templateId || !distribution.title || !distribution.distributionType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Şablon ID, başlık ve dağıtım türü gereklidir' 
      });
    }

    surveyService.createDistribution(distribution);
    res.json({ success: true, message: 'Anket dağıtımı başarıyla oluşturuldu' });
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
