export interface Teacher {
  id: string; // Teacher ID (e.g. "T01")
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  roomNumber: string;
  capacity: number;
  type: 'Classroom' | 'Laboratory';
  availableDays?: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Batch {
  id: number;
  batchNumber: string;
  section: string;
  studentCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: number;
  courseName: string;
  courseCode: string;
  courseType: 'Theory' | 'Lab';
  teacherId: string | null;
  batchId: number;
  teacher?: Teacher;
  batch?: Batch;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  slot: number;
  time: string;
}

export interface Routine {
  id: number;
  courseId: number;
  teacherId: string;
  roomNumber: string;
  batchId: number;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  slot: number;
  course?: Course;
  teacher?: Teacher;
  room?: Room;
  batch?: Batch;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConflictReport {
  failedCourse: string;
  courseCode: string;
  reason: string;
}

export interface AiResponse {
  overallSummary: string;
  suggestions: string[];
  teacherWorkloadReview: string;
  roomUtilizationReview: string;
  narrativeReportMarkdown: string;
}

