export interface Progress {
  id: string;
  studentId: string;
  topicId: string;
  completed: number;
  remaining: number;
  lastStudied?: string;
  notes?: string;
}

export interface AcademicGoal {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  targetScore?: number;
  currentScore?: number;
  examType?: string;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
}
