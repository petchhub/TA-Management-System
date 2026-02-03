/**
 * Course Service - API integration for course management
 */

export const API_BASE_URL = 'http://localhost:8084/TA-management';

export interface Course {
    courseID: number;
    courseCode: string;
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
    section: string;
    sec?: string;
    semesterStart?: string;
    semesterEnd?: string;
    year?: number;
    taCount?: number;
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
    courseName?: string;
    professorName?: string;
    location?: string;
    rejectReason?: string;
    classDay?: string;
    classStart?: string;
    classEnd?: string;
    jobPostID?: number;
    hasTranscript?: boolean;
    hasBankAccount?: boolean;
    hasStudentCard?: boolean;
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
    courseCode: string;
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
    programTypeId: number;
    workingDay: string;
    classDayId?: number;
    classTime: { startTime: string; endTime: string };
    professorID?: number; // Optional override
    semesterId?: number;
}): Promise<any> {
    try {
        // Map day names to IDs (supports both English and Thai)
        const dayMapping: { [key: string]: number } = {
            // English
            'sunday': 1,
            'monday': 2,
            'tuesday': 3,
            'wednesday': 4,
            'thursday': 5,
            'friday': 6,
            'saturday': 7,
            // Thai
            'อาทิตย์': 1,
            'จันทร์': 2,
            'อังคาร': 3,
            'พุธ': 4,
            'พฤหัสบดี': 5,
            'ศุกร์': 6,
            'เสาร์': 7,
        };

        // Map program type to ID
        const programMapping: { [key: string]: number } = {
            'general': 1,
            'international': 2,
            'continuing': 3,
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

        // Get the class day ID from mapping or use provided ID
        const classdayID = data.classDayId || dayMapping[data.workingDay] || dayMapping[data.workingDay.toLowerCase()] || 1;

        const requestData: CreateCourseRequest = {
            courseName: data.courseName,
            courseCode: data.courseCode,
            professorID: data.professorID || 1, // Use provided ID or default to 1
            courseProgramID: data.programTypeId,
            courseProgram: data.programTypeId === 1 ? 'General' : data.programTypeId === 2 ? 'International' : 'Continuing',
            sec: data.section,
            semesterID: data.semesterId || 1, // Use resolved ID
            semester: data.term,
            classdayID: classdayID,
            classday: data.workingDay,
            classStart: `${data.classTime.startTime}:00`,
            classEnd: `${data.classTime.endTime}:00`,
            taAllocation: 0,
            gradeID: 1, // Default, not used for course creation
            task: "",
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
 * Update an existing course
 * @param courseId - The ID of the course to update
 * @param data - The course data to update
 * @returns Promise with the update result
 */
export async function updateCourse(courseId: number, data: {
    courseCode: string;
    courseName: string;
    section: string;
    term: string;
    programTypeId: number;
    workingDay: string;
    classDayId?: number;
    classTime: { startTime: string; endTime: string };
    professorID: number;
    semesterId: number;
}): Promise<any> {
    try {
        // Map day names to IDs (supports both English and Thai)
        const dayMapping: { [key: string]: number } = {
            // English
            'sunday': 1,
            'monday': 2,
            'tuesday': 3,
            'wednesday': 4,
            'thursday': 5,
            'friday': 6,
            'saturday': 7,
            // Thai
            'อาทิตย์': 1,
            'จันทร์': 2,
            'อังคาร': 3,
            'พุธ': 4,
            'พฤหัสบดี': 5,
            'ศุกร์': 6,
            'เสาร์': 7,
        };

        const calculateWorkHours = (startTime: string, endTime: string): number => {
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            const diffMinutes = endMinutes - startMinutes;
            return Math.round(diffMinutes / 60);
        };

        const workHour = calculateWorkHours(data.classTime.startTime, data.classTime.endTime);

        // Get the class day ID from mapping or use provided ID
        const classdayID = data.classDayId || dayMapping[data.workingDay] || dayMapping[data.workingDay.toLowerCase()] || 1;

        const requestData = {
            courseName: data.courseName,
            courseCode: data.courseCode,
            professorID: data.professorID,
            courseProgramID: data.programTypeId,
            courseProgram: data.programTypeId === 1 ? 'General' : data.programTypeId === 2 ? 'International' : 'Continuing',
            sec: data.section,
            semesterID: data.semesterId,
            semester: data.term,
            classdayID: classdayID,
            classday: data.workingDay,
            // Backend expects ISO datetime format for time.Time fields
            classStart: `1970-01-01T${data.classTime.startTime}:00Z`,
            classEnd: `1970-01-01T${data.classTime.endTime}:00Z`,
        };

        const response = await fetch(`${API_BASE_URL}/course/${courseId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', errorText);
            throw new Error(`Failed to update course: ${response.statusText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Delete a course
 * @param courseId - The ID of the course to delete
 * @returns Promise with the delete result
 */
export async function deleteCourse(courseId: number): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/${courseId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete course: ${response.statusText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting course:', error);
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
        // Backend returns wrapped object with "data" field
        return result.data || [];
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
 * Create a new job post for a course
 * @param data - The job post data
 * @returns Promise with the created job post result
 */
export async function createJobPost(data: {
    courseID: number;
    professorID: number;
    location: string;
    taAllocation: number;
    gradeID: number;
    task: string;
}): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/jobpost`, {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create job post: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating job post:', error);
        throw error;
    }
}

/**
 * Update an existing job post
 * @param data - The job post data to update
 * @returns Promise with the update result
 */
export async function updateJobPost(data: {
    id: number;
    courseID?: number;
    professorID?: number;
    location?: string;
    taAllocation?: number;
    gradeID?: number;
    task?: string;
}): Promise<any> {
    try {
        const requestBody: any = { id: data.id };

        // Only include fields that are provided
        if (data.courseID !== undefined) requestBody.courseID = data.courseID;
        if (data.professorID !== undefined) requestBody.professorID = data.professorID;
        if (data.location !== undefined) requestBody.location = data.location;
        if (data.taAllocation !== undefined) requestBody.taAllocation = data.taAllocation;
        if (data.gradeID !== undefined) requestBody.gradeID = data.gradeID;
        if (data.task !== undefined) requestBody.task = data.task;

        const response = await fetch(`${API_BASE_URL}/course/jobpost/${data.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to update job post: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating job post:', error);
        throw error;
    }
}

/**
 * Fetch all job posts
 * @returns Promise with list of job posts
 */
export async function getAllJobPosts(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/jobpost`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch job posts: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching job posts:', error);
        return [];
    }
}

/**
 * Fetch all courses for Finance Management (including non-jobposts)
 * @returns Promise with list of courses
 */
export async function getAllCoursesForFinance(): Promise<Course[]> {
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
        console.error('Error fetching courses for finance:', error);
        throw error;
    }
}

/**
 * Fetch all job posts (including CLOSED/SUCCESSFUL)
 * @returns Promise with list of job posts
 */
export async function getAllJobPostsAllStatus(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/jobpost/all`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch all job posts: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching all job posts:', error);
        return [];
    }
}

/**
 * Fetch all courses for a specific professor
 * @param professorId - The ID of the professor
 * @returns Promise with list of courses
 */
export async function getProfessorCourses(professorId: number): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/professor/${professorId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch courses for professor ${professorId}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error(`Error fetching courses for professor ${professorId}:`, error);
        return [];
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
 * Reject a TA application
 * @param applicationId - The ID of the application to reject
 * @param rejectReason - The reason for rejection
 * @returns Promise with result
 */
export async function rejectApplication(applicationId: number, rejectReason: string): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/course/application/reject/${applicationId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rejectReason }),
        });

        if (!response.ok) {
            throw new Error(`Failed to reject application ${applicationId}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error rejecting application ${applicationId}:`, error);
        throw error;
    }
}

/**
 * Send email to all TAs
 */
export async function sendEmailAll(data: { subject: string; body: string }): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/announce/send-mail/all`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email to all: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending email to all:', error);
        throw error;
    }
}

/**
 * Send email to TAs of a specific course
 */
export async function sendEmailCourse(data: { subject: string; body: string; courseId: number }): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/announce/send-mail/course`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email to course: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending email to course:', error);
        throw error;
    }
}

/**
 * Send email to individual TA (by student ID or Name)
 */
export async function sendEmailIndividual(data: { subject: string; body: string; studentID: number }): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/announce/send-mail/individual`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to send email to individual: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending email to individual:', error);
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

export interface EmailHistory {
    id: number;
    subject: string;
    body: string;
    receivedName: string;
    nReceived: number;
    status: string;
    createDate: string;
}

/**
 * Fetch email history
 */
export async function getEmailHistory(): Promise<EmailHistory[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/announce/email-history`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch email history: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching email history:', error);
        throw error;
    }
}
