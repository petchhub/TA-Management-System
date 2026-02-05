/**
 * Position Service - API integration for TA position search and applications
 */

const API_BASE_URL = 'http://localhost:8084/TA-management';

/**
 * Backend response structure for course/position
 */
export interface PositionResponse {
    jobPostID: number;
    courseID: string;
    courseName: string;
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
    sec: string;
    program: string;
}

/**
 * Frontend Course interface for display
 */
export interface Course {
    id: number;
    code: string;
    name: string;
    department: string;
    program: string;
    sec: string;
    days: string;
    instructor: string;
    semester: string;
    positions: number;
    hoursPerWeek: number;
    requirements: string;
    description: string;
    location: string;
    deadline: string;
    startTime: string;
    endTime: string;
    status: string;
}

/**
 * Application form data
 */
export interface ApplicationData {
    studentID: number;
    statusID: number;
    motivation: string;
    experience: string;
    gpa: string;
    transcript?: File | null;
    phoneNumber?: string;
    firstname_thai?: string;
    lastname_thai?: string;
    bankAccount?: File | null;
    studentCard?: File | null;
    attacheNewPDF: boolean;
}

/**
 * Map backend position response to frontend Course interface
 */
function mapPositionToCourse(position: PositionResponse): Course {
    // Calculate deadline (30 days from now as default since backend doesn't provide)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    const deadlineStr = deadline.toISOString().split('T')[0];

    // Use program from backend directly (now it's Thai)
    const programStr = position.program || '';

    // Format requirements text
    const requirementsStr = position.program?.includes('International') || position.program === 'นานาชาติ'
        ? `Must have passed ${position.courseName} with a grade not lower than ${position.grade}`
        : `ต้องเคยผ่านรายวิชา ${position.courseName} โดยได้เกรดไม่ต่ำกว่า ${position.grade}`;

    // Format time (Handle 0000-01-01T13:00:00Z -> 13:00)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        // If it comes as full ISO string
        if (timeStr.includes('T')) {
            return timeStr.split('T')[1].substring(0, 5);
        }
        // If it comes as HH:mm:ss
        const parts = timeStr.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
        }
        return timeStr;
    };

    return {
        id: position.jobPostID,
        code: String(position.courseID || ''),
        name: String(position.courseName || ''),
        department: 'คณะวิศวกรรมศาสตร์', // Default since backend doesn't provide
        program: programStr,
        sec: position.sec || '',
        days: position.classday || "",
        instructor: String(position.professorName || ''),
        semester: position.semester || "",
        positions: position.taAllocation,
        hoursPerWeek: position.workHour,
        requirements: requirementsStr,
        description: position.task || '',
        location: position.location || '',
        deadline: deadlineStr,
        startTime: formatTime(position.classStart),
        endTime: formatTime(position.classEnd),
        status: position.status || "",
    };
}


/**
 * Fetch all open TA positions from the backend
 * @returns Promise with list of positions
 */
export async function getOpenPositions(): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch positions: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);

        // Handle both { data: [...] } and direct array response
        const jobPosts = Array.isArray(data) ? data : (data.data || []);

        if (!Array.isArray(jobPosts)) {
            console.error('Expected array of positions but got:', jobPosts);
            return [];
        }

        // Filter valid items and map
        const courses = jobPosts
            .filter((p: any) => p && typeof p === 'object') // Basic validation
            .map((position: PositionResponse) => mapPositionToCourse(position));

        console.log('Mapped courses:', courses);
        return courses;
    } catch (error) {
        console.error('Error fetching positions:', error);
        throw error;
    }
}

/**
 * Fetch all open TA positions from the public API (for unauthenticated users)
 * @returns Promise with list of positions
 */
export async function getPublicOpenPositions(): Promise<Course[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/public/course/jobpost`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch public positions: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Public API Response data:', data);

        // Handle both { data: [...] } and direct array response
        const jobPosts = Array.isArray(data) ? data : (data.data || []);

        if (!Array.isArray(jobPosts)) {
            console.error('Expected array of public positions but got:', jobPosts);
            return [];
        }

        // Filter valid items and map
        const courses = jobPosts
            .filter((p: any) => p && typeof p === 'object')
            .map((position: PositionResponse) => mapPositionToCourse(position));

        return courses;
    } catch (error) {
        console.error('Error fetching public positions:', error);
        throw error;
    }
}

/**
 * Submit application to a TA position
 * @param courseId - Course ID to apply to
 * @param applicationData - Application form data
 * @returns Promise with application result
 */
export async function applyToPosition(
    courseId: number,
    applicationData: ApplicationData
): Promise<any> {
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('studentID', applicationData.studentID.toString());
        formData.append('statusID', applicationData.statusID.toString());

        // Only append transcript if a new one is provided
        if (applicationData.transcript) {
            formData.append('Transcript', applicationData.transcript);
        }

        formData.append('grade', applicationData.gpa);
        formData.append('purpose', applicationData.motivation);
        formData.append('experience', applicationData.experience);

        // Phone number is required (NOT NULL in database)
        formData.append('phoneNumber', applicationData.phoneNumber || '');

        // Thai names - required fields
        formData.append('firstname_thai', applicationData.firstname_thai || '');
        formData.append('lastname_thai', applicationData.lastname_thai || '');

        formData.append('attachNewPDF', applicationData.attacheNewPDF.toString());
        // Optional files - use correct field names
        if (applicationData.bankAccount) {
            formData.append('BankAccount', applicationData.bankAccount); // Changed from 'bankAccountFile'
        }
        if (applicationData.studentCard) {
            formData.append('StudentCard', applicationData.studentCard); // Changed from 'studentCardFile'
        }

        const response = await fetch(`${API_BASE_URL}/course/apply/${courseId}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error:', errorText);
            throw new Error(`Failed to submit application: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Application submitted successfully:', result);
        return result;
    } catch (error) {
        console.error('Error submitting application:', error);
        throw error;
    }
}
