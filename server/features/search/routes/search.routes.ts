import { Request, Response, NextFunction } from 'express';
import * as searchService from '../services/search.service.js';

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        students: [],
        counselingSessions: [],
        surveys: [],
        pages: []
      });
    }

    const results = await searchService.performGlobalSearch(query.trim());
    res.json(results);
  } catch (error) {
    next(error);
  }
}
