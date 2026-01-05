
import { API_BASE_URL } from './courseService';

export interface DutyChecklistItem {
    date: string;
    status: string;
    isChecked: boolean;
}

/**
 * Fetch the duty roadmap for a specific TA in a specific course
 * @param courseID - The ID of the course
 * @param studentID - The ID of the student (TA)
 * @returns Promise with list of duty items
 */
export async function getTADutyRoadmap(courseID: number, studentID: number): Promise<DutyChecklistItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/ta_duty/duty-roadmap?courseID=${courseID}&studentID=${studentID}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch duty roadmap: ${response.statusText}`);
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error('Error fetching duty roadmap:', error);
        return [];
    }
}

/**
 * Mark a duty as done for a specific date
 * @param courseID - The ID of the course
 * @param studentID - The ID of the student (TA)
 * @param dutyDate - The date of the duty (YYYY-MM-DD or equivalent string from backend)
 * @returns Promise with result
 */
export async function markDutyAsDone(courseID: number, studentID: number, dutyDate: string): Promise<any> {
    try {
        // Backend expects query params for this POST request based on the controller code I saw
        const response = await fetch(`${API_BASE_URL}/ta_duty/marked-duty?courseID=${courseID}&studentID=${studentID}&dutyDate=${dutyDate}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to mark duty as done: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking duty as done:', error);
        throw error;
    }
}
