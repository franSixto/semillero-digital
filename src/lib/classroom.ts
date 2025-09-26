// Google Classroom API integration with OAuth2
import { Course, Assignment, Student, Teacher, StudentSubmission } from '@/types/classroom';

// OAuth2 Configuration
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

// Required scopes for Google Classroom and user profile
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid'
].join(' ');

// OAuth2 Token Response
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// API Response types
interface CoursesResponse {
  courses?: Course[];
  nextPageToken?: string;
}

interface AssignmentsResponse {
  courseWork?: Assignment[];
  nextPageToken?: string;
}

interface StudentsResponse {
  students?: Student[];
  nextPageToken?: string;
}

interface TeachersResponse {
  teachers?: Teacher[];
  nextPageToken?: string;
}

interface SubmissionsResponse {
  studentSubmissions?: StudentSubmission[];
  nextPageToken?: string;
}

/**
 * Generates the OAuth2 authorization URL
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`,
    scope: SCOPES,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges authorization code for access token via API route
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorData}`);
  }

  return response.json();
}

/**
 * Makes authenticated requests to Google Classroom API
 */
async function makeClassroomRequest<T>(
  endpoint: string,
  accessToken: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${CLASSROOM_API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Classroom API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Gets all courses for the authenticated user
 */
export async function getUserCourses(accessToken: string): Promise<Course[]> {
  const courses: Course[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      courseStates: 'ACTIVE',
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<CoursesResponse>(
      '/courses',
      accessToken,
      params
    );

    if (response.courses) {
      courses.push(...response.courses);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return courses;
}

/**
 * Gets all assignments (coursework) for a specific course
 */
export async function getCourseAssignments(
  courseId: string,
  accessToken: string
): Promise<Assignment[]> {
  const assignments: Assignment[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<AssignmentsResponse>(
      `/courses/${courseId}/courseWork`,
      accessToken,
      params
    );

    if (response.courseWork) {
      assignments.push(...response.courseWork);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return assignments;
}

/**
 * Gets all students for a specific course
 */
export async function getCourseStudents(
  courseId: string,
  accessToken: string
): Promise<Student[]> {
  const students: Student[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<StudentsResponse>(
      `/courses/${courseId}/students`,
      accessToken,
      params
    );

    if (response.students) {
      students.push(...response.students);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return students;
}

/**
 * Gets all teachers for a specific course
 */
export async function getCourseTeachers(
  courseId: string,
  accessToken: string
): Promise<Teacher[]> {
  const teachers: Teacher[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<TeachersResponse>(
      `/courses/${courseId}/teachers`,
      accessToken,
      params
    );

    if (response.teachers) {
      teachers.push(...response.teachers);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return teachers;
}

/**
 * Gets all student submissions for a specific assignment
 */
export async function getAssignmentSubmissions(
  courseId: string,
  courseWorkId: string,
  accessToken: string
): Promise<StudentSubmission[]> {
  const submissions: StudentSubmission[] = [];
  let nextPageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      pageSize: '100'
    };

    if (nextPageToken) {
      params.pageToken = nextPageToken;
    }

    const response = await makeClassroomRequest<SubmissionsResponse>(
      `/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`,
      accessToken,
      params
    );

    if (response.studentSubmissions) {
      submissions.push(...response.studentSubmissions);
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return submissions;
}

/**
 * Gets all submissions for a specific student across all assignments in a course
 */
export async function getStudentSubmissions(
  courseId: string,
  userId: string,
  accessToken: string
): Promise<StudentSubmission[]> {
  const assignments = await getCourseAssignments(courseId, accessToken);
  const allSubmissions: StudentSubmission[] = [];

  for (const assignment of assignments) {
    try {
      const submissions = await getAssignmentSubmissions(courseId, assignment.id, accessToken);
      const studentSubmissions = submissions.filter(sub => sub.userId === userId);
      allSubmissions.push(...studentSubmissions);
    } catch (error) {
      console.warn(`Failed to get submissions for assignment ${assignment.id}:`, error);
    }
  }

  return allSubmissions;
}

/**
 * Gets complete course data including assignments, students, and teachers
 */
export async function getCompleteCourseData(
  courseId: string,
  accessToken: string
): Promise<{
  assignments: Assignment[];
  students: Student[];
  teachers: Teacher[];
}> {
  const [assignments, students, teachers] = await Promise.all([
    getCourseAssignments(courseId, accessToken),
    getCourseStudents(courseId, accessToken),
    getCourseTeachers(courseId, accessToken)
  ]);

  return {
    assignments,
    students,
    teachers
  };
}

/**
 * Calculates progress statistics for a student in a course
 */
export async function getStudentProgress(
  courseId: string,
  userId: string,
  accessToken: string
) {
  try {
    const [assignments, submissions] = await Promise.all([
      getCourseAssignments(courseId, accessToken),
      getStudentSubmissions(courseId, userId, accessToken)
    ]);

    const totalAssignments = assignments.length;
    const submittedCount = submissions.filter(sub => 
      sub.state === 'TURNED_IN' || sub.state === 'RETURNED'
    ).length;
    const gradedCount = submissions.filter(sub => 
      sub.assignedGrade !== undefined && sub.assignedGrade !== null
    ).length;
    const lateCount = submissions.filter(sub => sub.late).length;

    // Calculate average grade
    const gradedSubmissions = submissions.filter(sub => 
      sub.assignedGrade !== undefined && sub.assignedGrade !== null
    );
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, sub) => sum + (sub.assignedGrade || 0), 0) / gradedSubmissions.length
      : 0;

    // Calculate completion percentage
    const completionPercentage = totalAssignments > 0 
      ? (submittedCount / totalAssignments) * 100 
      : 0;

    return {
      success: true,
      data: {
        totalAssignments,
        submittedCount,
        gradedCount,
        lateCount,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        submissions: submissions.map(sub => ({
          ...sub,
          assignmentTitle: assignments.find(a => a.id === sub.courseWorkId)?.title || 'Unknown Assignment'
        }))
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Gets progress overview for all students in a course (teacher view)
 */
export async function getCourseProgress(courseId: string, accessToken: string) {
  try {
    const students = await getCourseStudents(courseId, accessToken);
    const studentProgressItems = [];

    for (const student of students) {
      const progressResult = await getStudentProgress(courseId, student.userId, accessToken);
      if (progressResult.success && progressResult.data) {
        studentProgressItems.push({
          studentId: student.userId,
          studentName: student.profile?.name?.fullName || 'Unknown',
          studentEmail: student.profile?.emailAddress || '',
          progress: progressResult.data
        });
      }
    }

    return {
      success: true,
      data: {
        courseId,
        totalStudents: students.length,
        studentProgress: studentProgressItems
      }
    };
  } catch (error) {
    console.error('Error getting course progress:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting course progress'
    };
  }
}

// Get user profile information
export async function getUserProfile(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }

    const userData = await response.json();
    return {
      success: true,
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting user profile'
    };
  }
}

// Get student dashboard summary with progress overview
export async function getStudentDashboardSummary(accessToken: string) {
  try {
    // Get user profile first
    const userResult = await getUserProfile(accessToken);
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'Failed to get user profile' };
    }

    const user = userResult.data;

    // Get courses
    const courses = await getUserCourses(accessToken);
    
    let totalPendingAssignments = 0;
    let totalOverdueAssignments = 0;
    let totalGrades = 0;
    let gradeCount = 0;
    const upcomingDeadlines: Array<{
      assignmentTitle: string;
      courseName: string;
      courseId: string;
      dueDate: string;
      isOverdue: boolean;
      alternateLink: string;
    }> = [];

    // Get progress for each course to calculate real metrics
    for (const course of courses) {
      try {
        const progressResult = await getStudentProgress(course.id, user.id, accessToken);
        if (progressResult.success && progressResult.data) {
          const progress = progressResult.data;
          
          // Count pending assignments
          const pendingCount = progress.submissions.filter(sub => 
            sub.state === 'NEW' || sub.state === 'CREATED'
          ).length;
          
          // Count overdue assignments
          const overdueCount = progress.submissions.filter(sub => 
            sub.late && sub.state !== 'TURNED_IN'
          ).length;

          totalPendingAssignments += pendingCount;
          totalOverdueAssignments += overdueCount;

          // Add to average grade calculation
          if (progress.averageGrade > 0) {
            totalGrades += progress.averageGrade;
            gradeCount++;
          }

          // Add upcoming deadlines (pending assignments)
          progress.submissions
            .filter(sub => sub.state === 'NEW' || sub.state === 'CREATED')
            .forEach(sub => {
              upcomingDeadlines.push({
                assignmentTitle: sub.assignmentTitle,
                courseName: course.name,
                courseId: course.id,
                dueDate: sub.creationTime,
                isOverdue: sub.late || false,
                alternateLink: sub.alternateLink
              });
            });
        }
      } catch (courseError) {
        console.warn(`Error getting progress for course ${course.id}:`, courseError);
        // Continue with other courses even if one fails
      }
    }

    // Sort upcoming deadlines by date
    upcomingDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        totalPendingAssignments,
        totalOverdueAssignments,
        averageGrade: gradeCount > 0 ? Math.round(totalGrades / gradeCount) : 0,
        courses: courses.slice(0, 6), // Show first 6 courses
        upcomingDeadlines: upcomingDeadlines.slice(0, 5) // Limit to 5 most urgent
      }
    };
  } catch (error) {
    console.error('Error getting student dashboard summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting dashboard summary'
    };
  }
}

// Get all assignments for a student across all courses
export async function getStudentAllAssignments(accessToken: string) {
  try {
    // Get user profile first
    const userResult = await getUserProfile(accessToken);
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'Failed to get user profile' };
    }

    const user = userResult.data;

    // Get courses
    const courses = await getUserCourses(accessToken);
    
    const allAssignments: Array<{
      assignment: Assignment;
      course: Course;
      submission?: StudentSubmission;
      progress: {
        isSubmitted: boolean;
        isLate: boolean;
        isGraded: boolean;
        grade?: number;
        maxPoints?: number;
        status: 'pending' | 'submitted' | 'graded' | 'returned' | 'late';
      };
    }> = [];

    // Get assignments for each course
    for (const course of courses) {
      try {
        const assignments = await getCourseAssignments(course.id, accessToken);
        const submissions = await getStudentSubmissions(course.id, user.id, accessToken);

        // Create a map of submissions by courseWorkId for quick lookup
        const submissionMap = new Map();
        submissions.forEach(sub => {
          submissionMap.set(sub.courseWorkId, sub);
        });

        // Process each assignment
        assignments.forEach(assignment => {
          const submission = submissionMap.get(assignment.id);
          
          // Determine status and progress
          let status: 'pending' | 'submitted' | 'graded' | 'returned' | 'late' = 'pending';
          let isSubmitted = false;
          let isLate = false;
          let isGraded = false;
          let grade: number | undefined;

          if (submission) {
            isSubmitted = submission.state === 'TURNED_IN' || submission.state === 'RETURNED';
            isLate = submission.late || false;
            isGraded = submission.assignedGrade !== undefined;
            grade = submission.assignedGrade;

            if (submission.state === 'RETURNED') {
              status = 'returned';
            } else if (isGraded) {
              status = 'graded';
            } else if (isSubmitted) {
              status = 'submitted';
            } else if (isLate) {
              status = 'late';
            }
          } else {
            // Check if assignment is overdue
            if (assignment.dueDate) {
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              if (now > dueDate) {
                status = 'late';
                isLate = true;
              }
            }
          }

          allAssignments.push({
            assignment,
            course,
            submission,
            progress: {
              isSubmitted,
              isLate,
              isGraded,
              grade,
              maxPoints: assignment.maxPoints,
              status
            }
          });
        });
      } catch (courseError) {
        console.warn(`Error getting assignments for course ${course.id}:`, courseError);
      }
    }

    // Sort by creation time (newest first)
    allAssignments.sort((a, b) => 
      new Date(b.assignment.creationTime).getTime() - new Date(a.assignment.creationTime).getTime()
    );

    return {
      success: true,
      data: allAssignments
    };
  } catch (error) {
    console.error('Error getting student assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting assignments'
    };
  }
}

// Legacy function for backward compatibility - will be replaced
export async function getDashboardStats(accessToken: string) {
  try {
    const courses = await getUserCourses(accessToken);
    
    let totalStudents = 0;
    let totalAssignments = 0;
    let totalTeachers = 0;
    
    // Get stats for each course
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const [assignments, students, teachers] = await Promise.all([
          getCourseAssignments(course.id, accessToken),
          getCourseStudents(course.id, accessToken),
          getCourseTeachers(course.id, accessToken)
        ]);
        
        totalStudents += students.length;
        totalAssignments += assignments.length;
        totalTeachers += teachers.length;
        
        return {
          courseId: course.id,
          courseName: course.name,
          studentsCount: students.length,
          assignmentsCount: assignments.length,
          teachersCount: teachers.length,
          recentAssignments: assignments.slice(0, 3) // Last 3 assignments
        };
      })
    );

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        totalAssignments,
        totalTeachers,
        courses: courses.slice(0, 5), // Show first 5 courses
        courseStats,
        recentActivity: courseStats.flatMap(stat => 
          stat.recentAssignments.map(assignment => ({
            type: 'assignment_created',
            title: assignment.title,
            courseName: stat.courseName,
            courseId: stat.courseId,
            creationTime: assignment.creationTime
          }))
        ).slice(0, 10) // Last 10 activities
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Main function to authenticate and get all classroom data
 */
export async function authenticateAndGetClassroomData(accessToken: string) {
  try {
    // Get all courses
    const courses = await getUserCourses(accessToken);
    
    // Get complete data for each course
    const coursesWithData = await Promise.all(
      courses.map(async (course) => {
        const courseData = await getCompleteCourseData(course.id, accessToken);
        return {
          ...course,
          ...courseData
        };
      })
    );

    return {
      success: true,
      data: coursesWithData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// =============================================================================
// ROLE-BASED MOCK DATA FUNCTIONS
// =============================================================================

import { 
  TeacherData, 
  CoordinatorData, 
  TeacherDashboardStats,
  CoordinatorDashboardStats
} from '@/types/app';

// Mock data generators for development
export async function getTeacherData(_accessToken: string): Promise<{ success: boolean; data?: TeacherData; error?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockTeacherData: TeacherData = {
      assignedStudents: [
        {
          studentId: '1',
          studentName: 'Ana García',
          studentEmail: 'ana.garcia@estudiante.com',
          studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          commissionId: 'comm-1',
          commissionName: 'Desarrollo Web Frontend',
          assignedDate: new Date('2024-01-15'),
          progress: {
            totalAssignments: 12,
            submittedCount: 8,
            gradedCount: 6,
            lateCount: 2,
            averageGrade: 85,
            completionPercentage: 67,
            submissions: []
          },
          status: 'active',
          alerts: [
            {
              id: 'alert-1',
              studentId: '1',
              studentName: 'Ana García',
              type: 'missing_assignments',
              severity: 'medium',
              message: 'Tiene 2 tareas pendientes de entrega',
              courseId: 'course-1',
              courseName: 'React Fundamentals',
              createdAt: new Date(),
              isRead: false,
              actionRequired: true
            }
          ]
        },
        {
          studentId: '2',
          studentName: 'Carlos Mendoza',
          studentEmail: 'carlos.mendoza@estudiante.com',
          commissionId: 'comm-1',
          commissionName: 'Desarrollo Web Frontend',
          assignedDate: new Date('2024-01-15'),
          progress: {
            totalAssignments: 12,
            submittedCount: 12,
            gradedCount: 10,
            lateCount: 0,
            averageGrade: 92,
            completionPercentage: 100,
            submissions: []
          },
          status: 'excellent',
          alerts: []
        },
        {
          studentId: '3',
          studentName: 'María López',
          studentEmail: 'maria.lopez@estudiante.com',
          commissionId: 'comm-2',
          commissionName: 'Backend Development',
          assignedDate: new Date('2024-02-01'),
          progress: {
            totalAssignments: 10,
            submittedCount: 4,
            gradedCount: 3,
            lateCount: 3,
            averageGrade: 65,
            completionPercentage: 40,
            submissions: []
          },
          status: 'at_risk',
          alerts: [
            {
              id: 'alert-2',
              studentId: '3',
              studentName: 'María López',
              type: 'behind_schedule',
              severity: 'high',
              message: 'Está muy atrasada en las entregas',
              courseId: 'course-2',
              courseName: 'Node.js Basics',
              createdAt: new Date(),
              isRead: false,
              actionRequired: true
            }
          ]
        }
      ],
      courses: [], // Will be populated with real data in production
      commissions: [
        {
          id: 'comm-1',
          name: 'Desarrollo Web Frontend',
          description: 'Comisión enfocada en tecnologías frontend modernas',
          teacherId: 'teacher-1',
          teacherName: 'Prof. Juan Pérez',
          students: [],
          metrics: {
            totalStudents: 15,
            activeStudents: 12,
            studentsAtRisk: 2,
            studentsBehind: 1,
            averageProgress: 78,
            averageGrade: 82,
            completionRate: 0.78,
            lastUpdated: new Date()
          },
          createdAt: new Date('2024-01-01'),
          isActive: true
        }
      ],
      studentProgress: []
    };

    return {
      success: true,
      data: mockTeacherData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error loading teacher data'
    };
  }
}

export async function getCoordinatorData(accessToken: string): Promise<{ success: boolean; data?: CoordinatorData; error?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mockCoordinatorData: CoordinatorData = {
      allCommissions: [
        {
          id: 'comm-1',
          name: 'Desarrollo Web Frontend',
          description: 'Comisión enfocada en tecnologías frontend modernas',
          teacherId: 'teacher-1',
          teacherName: 'Prof. Juan Pérez',
          students: [],
          metrics: {
            totalStudents: 15,
            activeStudents: 12,
            studentsAtRisk: 2,
            studentsBehind: 1,
            averageProgress: 78,
            averageGrade: 82,
            completionRate: 0.78,
            lastUpdated: new Date()
          },
          createdAt: new Date('2024-01-01'),
          isActive: true
        },
        {
          id: 'comm-2',
          name: 'Backend Development',
          description: 'Desarrollo de APIs y servicios backend',
          teacherId: 'teacher-2',
          teacherName: 'Prof. María González',
          students: [],
          metrics: {
            totalStudents: 12,
            activeStudents: 10,
            studentsAtRisk: 3,
            studentsBehind: 2,
            averageProgress: 65,
            averageGrade: 75,
            completionRate: 0.65,
            lastUpdated: new Date()
          },
          createdAt: new Date('2024-01-15'),
          isActive: true
        }
      ],
      teacherAssignments: [
        {
          teacherId: 'teacher-1',
          teacherName: 'Prof. Juan Pérez',
          teacherEmail: 'juan.perez@semillero.edu',
          commissions: [],
          totalStudents: 15,
          activeStudents: 12,
          studentsAtRisk: 2,
          assignedDate: new Date('2024-01-01')
        }
      ],
      overallMetrics: {
        totalCommissions: 2,
        totalTeachers: 2,
        totalStudents: 27,
        studentsAtRisk: 5,
        overallCompletionRate: 0.72,
        averageGrade: 78.5,
        activeCommissions: 2,
        alertsCount: 5
      },
      alerts: [
        {
          id: 'alert-coord-1',
          studentId: '3',
          studentName: 'María López',
          type: 'behind_schedule',
          severity: 'critical',
          message: 'Estudiante con riesgo alto de deserción',
          courseId: 'course-2',
          courseName: 'Node.js Basics',
          createdAt: new Date(),
          isRead: false,
          actionRequired: true
        }
      ]
    };

    return {
      success: true,
      data: mockCoordinatorData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error loading coordinator data'
    };
  }
}

export async function getTeacherDashboardStats(_accessToken: string): Promise<{ success: boolean; data?: TeacherDashboardStats; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    const stats: TeacherDashboardStats = {
      totalStudents: 15,
      totalCommissions: 2,
      studentsAtRisk: 3,
      studentsBehind: 2,
      averageClassProgress: 78,
      pendingReviews: 8,
      recentAlerts: [
        {
          id: 'alert-recent-1',
          studentId: '3',
          studentName: 'María López',
          type: 'behind_schedule',
          severity: 'high',
          message: 'Está muy atrasada en las entregas',
          courseId: 'course-2',
          courseName: 'Node.js Basics',
          createdAt: new Date(),
          isRead: false,
          actionRequired: true
        }
      ]
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error loading teacher stats'
    };
  }
}

export async function getCoordinatorDashboardStats(_accessToken: string): Promise<{ success: boolean; data?: CoordinatorDashboardStats; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 900));

    const stats: CoordinatorDashboardStats = {
      totalCommissions: 2,
      totalTeachers: 2,
      totalStudents: 27,
      studentsAtRisk: 5,
      overallProgress: 72,
      activeAlerts: 5,
      commissionsNeedingAttention: [
        {
          id: 'comm-2',
          name: 'Backend Development',
          description: 'Desarrollo de APIs y servicios backend',
          teacherId: 'teacher-2',
          teacherName: 'Prof. María González',
          students: [],
          metrics: {
            totalStudents: 12,
            activeStudents: 10,
            studentsAtRisk: 3,
            studentsBehind: 2,
            averageProgress: 65,
            averageGrade: 75,
            completionRate: 0.65,
            lastUpdated: new Date()
          },
          createdAt: new Date('2024-01-15'),
          isActive: true
        }
      ]
    };

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error loading coordinator stats'
    };
  }
}

// =============================================================================
// TEACHERS MANAGEMENT FUNCTIONS
// =============================================================================

interface AssignedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  commissionName: string;
  assignedDate: Date;
  status: 'active' | 'inactive' | 'at_risk';
}

interface TeacherManagement {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherAvatar?: string;
  assignedStudents: AssignedStudent[];
  totalStudents: number;
  activeCommissions: string[];
  lastActivity: Date;
}

interface UnassignedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  commissionName: string;
  enrollmentDate: Date;
}

interface TeachersManagementData {
  teachers: TeacherManagement[];
  unassignedStudents: UnassignedStudent[];
  totalTeachers: number;
  totalStudents: number;
  totalUnassigned: number;
}

// Helper function to get all teachers from all courses
async function getAllTeachersFromCourses(accessToken: string) {
  try {
    const courses = await getUserCourses(accessToken);
    const teachersMap = new Map();
    
    for (const course of courses) {
      try {
        const courseTeachers = await getCourseTeachers(course.id, accessToken);
        
        for (const teacher of courseTeachers) {
          const teacherId = teacher.userId;
          
          if (!teachersMap.has(teacherId)) {
            teachersMap.set(teacherId, {
              teacherId,
              teacherName: teacher.profile?.name?.fullName || 'Profesor',
              teacherEmail: teacher.profile?.emailAddress || '',
              teacherAvatar: teacher.profile?.photoUrl,
              assignedStudents: [],
              totalStudents: 0,
              activeCommissions: [],
              lastActivity: new Date()
            });
          }
          
          // Add course to teacher's active commissions
          const teacherData = teachersMap.get(teacherId);
          if (!teacherData.activeCommissions.includes(course.name)) {
            teacherData.activeCommissions.push(course.name);
          }
        }
      } catch (courseError) {
        console.warn(`Error getting teachers for course ${course.id}:`, courseError);
      }
    }
    
    return Array.from(teachersMap.values());
  } catch (error) {
    console.error('Error getting all teachers:', error);
    return [];
  }
}

// Helper function to get all students from all courses
async function getAllStudentsFromCourses(accessToken: string) {
  try {
    const courses = await getUserCourses(accessToken);
    const studentsMap = new Map();
    
    for (const course of courses) {
      try {
        const courseStudents = await getCourseStudents(course.id, accessToken);
        
        for (const student of courseStudents) {
          const studentId = student.userId;
          
          if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
              studentId,
              studentName: student.profile?.name?.fullName || 'Estudiante',
              studentEmail: student.profile?.emailAddress || '',
              studentAvatar: student.profile?.photoUrl,
              commissionName: course.name,
              enrollmentDate: new Date(course.creationTime || Date.now()),
              courseId: course.id,
              status: 'active' // Default status, could be enhanced with progress analysis
            });
          }
        }
      } catch (courseError) {
        console.warn(`Error getting students for course ${course.id}:`, courseError);
      }
    }
    
    return Array.from(studentsMap.values());
  } catch (error) {
    console.error('Error getting all students:', error);
    return [];
  }
}

// Helper function to determine student status based on their progress
async function getStudentStatus(studentId: string, courseId: string, accessToken: string): Promise<'active' | 'inactive' | 'at_risk'> {
  try {
    const progressResult = await getStudentProgress(courseId, studentId, accessToken);
    
    if (progressResult.success && progressResult.data) {
      const { completionPercentage, lateCount, averageGrade } = progressResult.data;
      
      // Determine status based on progress metrics
      if (lateCount > 2 || averageGrade < 60) {
        return 'at_risk';
      } else if (completionPercentage < 30) {
        return 'inactive';
      } else {
        return 'active';
      }
    }
    
    return 'active'; // Default status
  } catch (error) {
    console.warn(`Error determining status for student ${studentId}:`, error);
    return 'active';
  }
}

export async function getTeachersManagement(accessToken: string): Promise<{ success: boolean; data?: TeachersManagementData; error?: string }> {
  try {
    console.log('Loading teachers management data from Google Classroom API...');
    
    // Get all teachers and students from Google Classroom
    const [allTeachers, allStudents] = await Promise.all([
      getAllTeachersFromCourses(accessToken),
      getAllStudentsFromCourses(accessToken)
    ]);
    
    console.log(`Found ${allTeachers.length} teachers and ${allStudents.length} students`);
    
    // For now, we'll consider all students as "unassigned" since Google Classroom
    // doesn't have a built-in teacher-student assignment system beyond course enrollment
    // In a real implementation, you might store assignments in a separate database
    
    // Get enhanced student data with status
    const enhancedStudents = await Promise.all(
      allStudents.map(async (student) => {
        const status = await getStudentStatus(student.studentId, student.courseId, accessToken);
        return {
          ...student,
          status
        };
      })
    );
    
    // For demonstration, we'll simulate some assignments
    // In practice, you'd store these assignments in your own database
    const teachersWithAssignments = allTeachers.map((teacher, index) => {
      // Simulate some students assigned to teachers
      const studentsPerTeacher = Math.floor(allStudents.length / allTeachers.length);
      const startIndex = index * studentsPerTeacher;
      const endIndex = index === allTeachers.length - 1 ? allStudents.length : startIndex + studentsPerTeacher;
      
      const assignedStudents = enhancedStudents.slice(startIndex, endIndex).map(student => ({
        studentId: student.studentId,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        commissionName: student.commissionName,
        assignedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        status: student.status
      }));
      
      return {
        ...teacher,
        assignedStudents,
        totalStudents: assignedStudents.length
      };
    });
    
    // Students that are not assigned to any teacher (for demo, we'll leave some unassigned)
    const assignedStudentIds = new Set(
      teachersWithAssignments.flatMap((teacher: TeacherManagement) => 
        teacher.assignedStudents.map((student: AssignedStudent) => student.studentId)
      )
    );
    
    const unassignedStudents = enhancedStudents
      .filter(student => !assignedStudentIds.has(student.studentId))
      .map(student => ({
        studentId: student.studentId,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        commissionName: student.commissionName,
        enrollmentDate: student.enrollmentDate
      }));
    
    const data: TeachersManagementData = {
      teachers: teachersWithAssignments,
      unassignedStudents,
      totalTeachers: allTeachers.length,
      totalStudents: allStudents.length,
      totalUnassigned: unassignedStudents.length
    };
    
    console.log('Teachers management data loaded successfully:', {
      teachers: data.totalTeachers,
      students: data.totalStudents,
      unassigned: data.totalUnassigned
    });
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error loading teachers management data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error loading teachers management data'
    };
  }
}

// Note: Google Classroom doesn't have a native teacher-student assignment system
// beyond course enrollment. In a real implementation, you would store these
// assignments in your own database (e.g., Firebase, PostgreSQL, etc.)

export async function assignStudentToTeacher(studentId: string, teacherId: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`Assigning student ${studentId} to teacher ${teacherId}`);
    
    // In a real implementation, you would:
    // 1. Validate that both student and teacher exist in Google Classroom
    // 2. Store the assignment in your database
    // 3. Optionally send notifications
    
    // Validate student and teacher exist by checking if they're in any courses
    const courses = await getUserCourses(accessToken);
    let studentExists = false;
    let teacherExists = false;
    
    for (const course of courses) {
      if (!studentExists || !teacherExists) {
        try {
          const [students, teachers] = await Promise.all([
            getCourseStudents(course.id, accessToken),
            getCourseTeachers(course.id, accessToken)
          ]);
          
          if (!studentExists && students.some(s => s.userId === studentId)) {
            studentExists = true;
          }
          
          if (!teacherExists && teachers.some(t => t.userId === teacherId)) {
            teacherExists = true;
          }
        } catch (courseError) {
          console.warn(`Error checking course ${course.id}:`, courseError);
        }
      }
    }
    
    if (!studentExists) {
      return {
        success: false,
        error: 'Student not found in any course'
      };
    }
    
    if (!teacherExists) {
      return {
        success: false,
        error: 'Teacher not found in any course'
      };
    }
    
    // Here you would store the assignment in your database
    // For now, we'll just simulate success
    console.log(`Successfully assigned student ${studentId} to teacher ${teacherId}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error assigning student to teacher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error assigning student to teacher'
    };
  }
}

export async function removeStudentFromTeacher(studentId: string, teacherId: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log(`Removing student ${studentId} from teacher ${teacherId}`);
    
    // In a real implementation, you would:
    // 1. Validate the assignment exists in your database
    // 2. Remove the assignment record
    // 3. Optionally send notifications
    
    // For now, we'll just simulate success
    console.log(`Successfully removed student ${studentId} from teacher ${teacherId}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error removing student from teacher:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error removing student from teacher'
    };
  }
}
