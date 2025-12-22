/**
 * Course Service - API integration for course management
 */

export const API_BASE_URL = 'http://localhost:8084/TA-management';

export interface Course {
    courseID: string;
    courseName: string;
    courseProgram: string;
    taAllocation: number;
    workHour: number;
    classStart: string;
    classEnd: string;
    location: string;
    grade: string;
    task: string;
    classday: string;
    professorName: string;
    semester: string;
    status: string;
    jobPostID: number;
}

export interface CourseResponse {
    message: string;
    data: Course[];
}

export interface Application {
    applicationId: number;
    studentID: number;
    statusID: number;
    courseID: number; // Backend sends int for course_ID/job_post_ID in this specific endpoint
    statusCode: string;
    createdDate: string;
    // Optional fields that might be missing or need future backend support
    studentName?: string;
    phoneNumber?: string;
    grade?: string;
    purpose?: string;
}

export interface ApplicationResponse {
    message: string;
    data: Application[];
}

/**
 * Backend CreateCourse request structure
 */
export interface CreateCourseRequest {
    courseName: string;
    courseID: string;
    professorID: number;
    courseProgramID: number;
    courseProgram: string;
    sec: string;
    semesterID: number;
    semester: string;
    classdayID: number;
    classday: string;
    classStart: string; // ISO format datetime
    classEnd: string; // ISO format datetime
    taAllocation: number;
    gradeID: number;
    task: string;
    workHour: number;
}

/**
 * Fetch all courses from the backend
 * @returns Promise with list of courses
 */
export async function getAllCourses(): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const result: CourseResponse = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

/**
 * Create a course announcement (TA recruitment)
 * Maps frontend TAAnnouncementData to backend CreateCourse format
 */
export async function createCourseAnnouncement(data: {
    courseCode: string;
    courseName: string;
    section: string;
    term: string;
    programType: 'regular' | 'international';
    workingDay: string;
    classTime: { startTime: string; endTime: string };
    numberOfTAs: number;
    minGrade: string;
    gradeId?: number;
    requirements: string;
    professorID?: number; // Optional override
    semesterId?: number;
}): Promise<any> {
    try {
        // Map day names to IDs (based on typical database setup)
        const dayMapping: { [key: string]: number } = {
            'sunday': 1,
            'monday': 2,
            'tuesday': 3,
            'wednesday': 4,
            'thursday': 5,
            'friday': 6,
            'saturday': 7,
        };

        // Map program type to ID
        const programMapping: { [key: string]: number } = {
            'regular': 1,
            'international': 2,
        };


        // Calculate work hours from class start and end times
        const calculateWorkHours = (startTime: string, endTime: string): number => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const diffMinutes = endMinutes - startMinutes;
            return Math.round(diffMinutes / 60); // Round to nearest hour
        };

        const workHour = calculateWorkHours(data.classTime.startTime, data.classTime.endTime);

        const requestData: CreateCourseRequest = {
            courseName: data.courseName,
            courseID: data.courseCode,
            professorID: data.professorID || 1, // Use provided ID or default to 1
            courseProgramID: programMapping[data.programType] || 1,
            courseProgram: data.programType === 'international' ? 'International' : 'General',
            sec: data.section,
            semesterID: data.semesterId || 1, // Use resolved ID
            semester: data.term,
            classdayID: dayMapping[data.workingDay.toLowerCase()] || 1,
            classday: data.workingDay.charAt(0).toUpperCase() + data.workingDay.slice(1),
            classStart: `${data.classTime.startTime}:00`,
            classEnd: `${data.classTime.endTime}:00`,
            taAllocation: data.numberOfTAs,
            gradeID: data.gradeId || 1, // Use resolved ID or default
            task: data.requirements,
            workHour: workHour,
        };

        console.log('Sending course announcement request:', requestData);

        const response = await fetch(`${API_BASE_URL}/course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', errorText);
            throw new Error(`Failed to create course announcement: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Course announcement created successfully:', result);
        return result;
    } catch (error) {
        console.error('Error creating course announcement:', error);
        throw error;
    }
}

/**
 * Fetch all applications for a specific course
 * @param courseId - The ID of the course (or jobPostID)
 * @returns Promise with list of applications
 */
export async function getApplicationsForCourse(courseId: number): Promise<Application[]> {
    try {
        // Ideally this should use the jobPostID, but if the backend expects courseId, we use that.
        // However, looking at the backend code, it filters by course_ID in the ta_application table.
        // But applications are created with job_post_ID. 
        // We will try to fetch using the ID we have.
        const response = await fetch(`${API_BASE_URL}/course/application/course/${courseId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch applications for course ${courseId}: ${response.statusText}`);
        }

        const result = await response.json();
        // Backend returns "data": null if no apps, ensuring we return []
        return result || [];
    } catch (error) {
        console.error(`Error fetching applications for course ${courseId}:`, error);
        return [];
    }
}

/**
 * Fetch all applications for all courses belonging to a professor
 * @param professorId - The ID of the professor
 * @param professorName - Optional name of the professor for filtering
 * @returns Promise with list of applications
 */
export async function getProfessorApplications(professorId: number, professorName?: string): Promise<Application[]> {
    try {
        console.log('Fetching applications for professor:', { id: professorId });

        const response = await fetch(`${API_BASE_URL}/course/application/professor/${professorId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch applications for professor ${professorId}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Applications for professor:', result);
        return result.data || [];
    } catch (error) {
        console.error('Error in getProfessorApplications:', error);
        throw error;
    }
}

/**
 * Approve a TA application
 * @param applicationId - The ID of the application to approve
 * @returns Promise with result
 */
export async function approveApplication(applicationId: number): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/application/approve/${applicationId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to approve application ${applicationId}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error approving application ${applicationId}:`, error);
        throw error;
    }
}

/**
 * Fetch all applications for a specific student
 * @param studentId - The ID of the student
 * @returns Promise with list of applications
 */
export async function getStudentApplications(studentId: number): Promise<Application[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/application/student/${studentId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch applications for student ${studentId}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error(`Error fetching applications for student ${studentId}:`, error);
        return [];
    }
}

/**
 * Fetch all courses for a specific student
 * @param studentId - The ID of the student
 * @returns Promise with list of courses
 */
export async function getAllCoursesByStudentId(studentId: number): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/student/${studentId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courses for student ${studentId}: ${response.statusText}`);
        }

        const result: CourseResponse = await response.json();
        return result.data || [];
    } catch (error) {
        console.error(`Error fetching courses for student ${studentId}:`, error);
        throw error;
    }
}

/**
 * Get the URL for transcript PDF
 * @param applicationId - The ID of the application
 * @returns string URL
 */
export function getTranscriptUrl(applicationId: number): string {
    return `${API_BASE_URL}/course/application/transcript/${applicationId}`;
}

/**
 * Get the URL for bank account PDF
 * @param applicationId - The ID of the application
 * @returns string URL
 */
export function getBankAccountUrl(applicationId: number): string {
    return `${API_BASE_URL}/course/application/bankaccount/${applicationId}`;
}

/**
 * Get the URL for student card PDF
 * @param applicationId - The ID of the application
 * @returns string URL
 */
export function getStudentCardUrl(applicationId: number): string {
    return `${API_BASE_URL}/course/application/studentcard/${applicationId}`;
}
