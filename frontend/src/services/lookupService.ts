/**
 * Lookup Service - API integration for fetching static/lookup data
 */

const API_BASE_URL = 'http://localhost:8084/TA-management/lookup';

export interface LookupItem {
    id: number;
    value: string;
}

/**
 * Fetch days of the week from the backend
 */
export async function getClassDays(): Promise<LookupItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/classday`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch class days: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error('Error fetching class days:', error);
        throw error;
    }
}

/**
 * Fetch grading options from the backend
 */
export async function getGrades(): Promise<LookupItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/grade`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch grades: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error('Error fetching grades:', error);
        throw error;
    }
}

/**
 * Fetch semesters from the backend
 */
export async function getSemesters(): Promise<LookupItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/semester`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch semesters: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error('Error fetching semesters:', error);
        throw error;
    }
}
export async function getCourseProgram(): Promise<LookupItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/course-program`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch semesters: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
        return result || [];
    } catch (error) {
        console.error('Error fetching semesters:', error);
        throw error;
    }
}

export async function getProfessors(): Promise<LookupItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/professors`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch professors: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error('Error fetching professors:', error);
        throw error;
    }
}

/**
 * Search for students/TAs by ID or Name
 * @param query - The search query (ID or Name)
 * @returns Promise with list of students
 */
export async function searchStudents(query: string): Promise<{ id: number, name: string }[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/ta?searchVal=${encodeURIComponent(query)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to search students: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching students:', error);
        throw error;
    }
}

/**
 * Get student transcript file URL
 * @param studentID - The student ID
 * @returns string URL for the transcript PDF
 */
export function getStudentTranscriptUrl(studentID: number): string {
    return `${API_BASE_URL}/transcript?studentID=${studentID}`;
}

/**
 * Get student bank account file URL
 * @param studentID - The student ID
 * @returns string URL for the bank account PDF
 */
export function getStudentBankAccountUrl(studentID: number): string {
    return `${API_BASE_URL}/bank-account?studentID=${studentID}`;
}

/**
 * Get student card file URL
 * @param studentID - The student ID
 * @returns string URL for the student card PDF
 */
export function getStudentCardUrl(studentID: number): string {
    return `${API_BASE_URL}/student-card?studentID=${studentID}`;
}

/**
 * Check if a student file exists
 * @param url - The file URL to check
 * @returns Promise<boolean> - true if file exists, false otherwise
 */
export async function checkFileExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return response.ok;
    } catch (error) {
        console.error('Error checking file existence:', error);
        return false;
    }
}
