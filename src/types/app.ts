// Application-specific types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'teacher' | 'student' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
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
