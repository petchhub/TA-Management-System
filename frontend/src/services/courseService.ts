/**
 * Course Service - API integration for course management
 */

const API_BASE_URL = 'http://localhost:8084/TA-management';

export interface Course {
    courseID: string;
    courseName: string;
}

export interface CourseResponse {
    message: string;
    data: Course[];
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
