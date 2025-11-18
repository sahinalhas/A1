import { RequestHandler } from "express";
import * as settingsService from '../services/settings.service.js';

export const getSettings: RequestHandler = (req, res) => {
  try {
    const settings = settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Ayarlar getirilirken hata oluştu' });
  }
};

export const saveSettingsHandler: RequestHandler = (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz ayar verisi" 
      });
    }
    
    settingsService.saveSettings(settings);
    res.json({ success: true, message: 'Ayarlar kaydedildi' });
  } catch (error) {
    console.error('Error saving settings:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      success: false, 
      error: `Ayarlar kaydedilemedi: ${errorMessage}` 
    });
  }
};
