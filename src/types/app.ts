// Application-specific types

// Role system types
export type UserRole = 'student' | 'teacher' | 'coordinator';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Role-specific data structures
export interface StudentData {
  courses: AppCourse[];
  assignments: AppAssignment[];
  progress: StudentProgress[];
  upcomingDeadlines: AppAssignment[];
}

export interface TeacherData {
  assignedStudents: StudentAssignment[];
  courses: AppCourse[];
  commissions: Commission[];
  studentProgress: TeacherStudentProgress[];
}

export interface CoordinatorData {
  allCommissions: Commission[];
  teacherAssignments: TeacherAssignment[];
  overallMetrics: CoordinatorMetrics;
  alerts: StudentAlert[];
}

// Commission and assignment structures
export interface Commission {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  students: CommissionStudent[];
  metrics: CommissionMetrics;
  createdAt: Date;
  isActive: boolean;
}

export interface CommissionStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: Date;
  progress: StudentProgress;
  status: 'active' | 'at_risk' | 'behind' | 'excellent';
  lastActivity: Date;
}

export interface StudentAssignment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  commissionId: string;
  commissionName: string;
  assignedDate: Date;
  progress: StudentProgress;
  status: 'active' | 'at_risk' | 'behind' | 'excellent';
  alerts: StudentAlert[];
}

export interface TeacherAssignment {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  commissions: Commission[];
  totalStudents: number;
  activeStudents: number;
  studentsAtRisk: number;
  assignedDate: Date;
}

// Progress and metrics for different roles
export interface TeacherStudentProgress {
  student: CommissionStudent;
  courses: CourseProgress[];
  overallProgress: StudentProgress;
  alerts: StudentAlert[];
  lastInteraction: Date;
}

export interface CommissionMetrics {
  totalStudents: number;
  activeStudents: number;
  studentsAtRisk: number;
  studentsBehind: number;
  averageProgress: number;
  averageGrade: number;
  completionRate: number;
  lastUpdated: Date;
}

export interface CoordinatorMetrics {
  totalCommissions: number;
  totalTeachers: number;
  totalStudents: number;
  studentsAtRisk: number;
  overallCompletionRate: number;
  averageGrade: number;
  activeCommissions: number;
  alertsCount: number;
}

// Alert system
export interface StudentAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'behind_schedule' | 'missing_assignments' | 'low_grades' | 'inactive' | 'at_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  courseId?: string;
  courseName?: string;
  assignmentId?: string;
  assignmentName?: string;
  createdAt: Date;
  isRead: boolean;
  actionRequired: boolean;
}

// Assignment type for role system
export interface AppAssignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  dueDate?: Date;
  maxPoints?: number;
  status: 'pending' | 'submitted' | 'graded' | 'late' | 'returned';
  submissionDate?: Date;
  grade?: number;
  isLate: boolean;
  alternateLink: string;
}

export interface AppCourse {
  id: string;
  classroomId: string;
  name: string;
  description?: string;
  subject: string;
  grade?: string;
  isActive: boolean;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  user: User;
  courses: AppCourse[];
  recentActivity: Activity[];
  stats: DashboardStats;
}

export interface Activity {
  id: string;
  type: 'assignment_created' | 'assignment_submitted' | 'grade_posted' | 'course_joined' | 'announcement_posted';
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  timestamp: Date;
  isRead: boolean;
}

// Dashboard stats for different roles
export interface StudentDashboardStats {
  totalCourses: number;
  totalAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  averageGrade: number;
  upcomingDeadlines: AppAssignment[];
}

export interface TeacherDashboardStats {
  totalStudents: number;
  totalCommissions: number;
  studentsAtRisk: number;
  studentsBehind: number;
  averageClassProgress: number;
  pendingReviews: number;
  recentAlerts: StudentAlert[];
}

export interface CoordinatorDashboardStats {
  totalCommissions: number;
  totalTeachers: number;
  totalStudents: number;
  studentsAtRisk: number;
  overallProgress: number;
  activeAlerts: number;
  commissionsNeedingAttention: Commission[];
}

// Legacy type for backward compatibility
export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  pendingGrades: number;
  upcomingDeadlines: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    assignments: boolean;
    grades: boolean;
    announcements: boolean;
  };
  privacy: {
    profileVisible: boolean;
    emailVisible: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  search?: string;
  courseId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: string | number | boolean;
  message: string;
}

export interface FormState {
  values: Record<string, string | number | boolean>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  isActive?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

// Modal and Dialog types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

export interface ConfirmDialogProps extends ModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// Loading and Error states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Progress and Grades types
export interface StudentProgress {
  totalAssignments: number;
  submittedCount: number;
  gradedCount: number;
  lateCount: number;
  averageGrade: number;
  completionPercentage: number;
  submissions: SubmissionWithTitle[];
}

export interface SubmissionWithTitle {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: 'SUBMISSION_STATE_UNSPECIFIED' | 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  assignmentTitle: string;
}

export interface CourseProgress {
  courseId: string;
  totalAssignments: number;
  totalStudents: number;
  studentProgress: StudentProgressItem[];
}

export interface StudentProgressItem {
  student: {
    id: string;
    name: {
      givenName?: string;
      familyName?: string;
      fullName?: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
  progress: StudentProgress | null;
}
