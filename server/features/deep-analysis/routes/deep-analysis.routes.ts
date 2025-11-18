import { RequestHandler } from 'express';
import * as deepAnalysisService from '../services/deep-analysis.service.js';

/**
 * POST /api/deep-analysis/:studentId
 * Öğrenci için derin analiz raporu oluştur
 */
export const generateAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const report = await deepAnalysisService.generateDeepAnalysis(studentId);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: unknown) {
    console.error('Error generating deep analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Derin analiz oluşturulamadı'
    });
  }
};

/**
 * POST /api/deep-analysis/batch
 * Toplu öğrenci analizi
 */
export const generateBatchAnalysis: RequestHandler = async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        error: 'studentIds dizisi gerekli'
      });
    }
    
    const result = await deepAnalysisService.generateBatchAnalysis(studentIds);
    
    res.json({
      success: true,
      data: {
        totalStudents: studentIds.length,
        completed: result.reports.length,
        failed: result.errors.length,
        reports: result.reports,
        errors: result.errors
      }
    });
  } catch (error: unknown) {
    console.error('Error in batch analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Toplu analiz başarısız'
    });
  }
};
