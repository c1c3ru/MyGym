export interface GraduationAlert {
  id: string;
  studentId: string;
  studentName: string;
  currentBelt: string;
  nextBelt: string;
  modality: string;
  estimatedGraduationDate: Date;
  trainingStartDate: Date;
  minimumTrainingDays: number;
  daysUntilEligible: number;
  isEligible: boolean;
  alertLevel: 'info' | 'warning' | 'ready';
  createdAt: Date;
  updatedAt: Date;
}

export interface GraduationRule {
  modality: string;
  fromBelt: string;
  toBelt: string;
  minimumDays: number;
  minimumClasses?: number;
  additionalRequirements?: string[];
}

export interface GraduationExam {
  id: string;
  date: Date;
  modality: string;
  examiner: string;
  location: string;
  candidateStudents: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  results?: ExamResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamResult {
  studentId: string;
  passed: boolean;
  newBelt?: string;
  notes?: string;
  score?: number;
}

export interface GraduationBoard {
  upcomingExams: GraduationExam[];
  eligibleStudents: GraduationAlert[];
  recentGraduations: ExamResult[];
  modalityStats: ModalityGraduationStats[];
}

export interface ModalityGraduationStats {
  modality: string;
  totalStudents: number;
  eligibleStudents: number;
  nextExamDate?: Date;
  averageTrainingTime: number;
}
