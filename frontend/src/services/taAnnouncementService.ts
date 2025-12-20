import { TAAnnouncementData } from '../pages/professor/CreateTAAnnouncementModal';

const API_BASE_URL = 'http://localhost:8084/TA-management';

/**
 * API Service for TA Announcements
 * This is a mockup implementation that will be replaced with actual backend calls
 */

export interface TAAnnouncementResponse {
    id: string;
    courseCode: string;
    courseName: string;
    section: string;
    term: string;
    programType: 'regular' | 'international';
    workingDay: string;
    classTime: {
        startTime: string;
        endTime: string;
    };
    numberOfTAs: number;
    requirements: string;
    status: 'open' | 'closed';
    createdAt: string;
    createdBy: string;
}

/**
 * Create a new TA announcement
 * @param data - TA announcement data
 * @returns Promise with the created announcement
 */
export async function createTAAnnouncement(data: TAAnnouncementData): Promise<TAAnnouncementResponse> {
    try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch(`${API_BASE_URL}/announcements`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   credentials: 'include',
        //   body: JSON.stringify(data),
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Failed to create TA announcement');
        // }
        //
        // return await response.json();

        // Mockup response
        console.log('Creating TA announcement (mockup):', data);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: `announcement-${Date.now()}`,
                    ...data,
                    status: 'open',
                    createdAt: new Date().toISOString(),
                    createdBy: 'current-professor-id', // This would come from auth context
                });
            }, 500); // Simulate network delay
        });
    } catch (error) {
        console.error('Error creating TA announcement:', error);
        throw error;
    }
}

/**
 * Get all TA announcements
 * @returns Promise with list of announcements
 */
export async function getTAAnnouncements(): Promise<TAAnnouncementResponse[]> {
    try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch(`${API_BASE_URL}/announcements`, {
        //   method: 'GET',
        //   credentials: 'include',
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch TA announcements');
        // }
        //
        // return await response.json();

        // Mockup response
        console.log('Fetching TA announcements (mockup)');

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'announcement-1',
                        courseCode: '01076104',
                        courseName: 'Programming Fundamental',
                        section: '01',
                        term: '1/2568',
                        programType: 'regular',
                        workingDay: 'monday',
                        classTime: {
                            startTime: '09:00',
                            endTime: '12:00',
                        },
                        numberOfTAs: 2,
                        requirements: 'GPA ไม่ต่ำกว่า 3.0',
                        status: 'open',
                        createdAt: '2025-12-20T10:00:00Z',
                        createdBy: 'prof-123',
                    },
                ]);
            }, 300);
        });
    } catch (error) {
        console.error('Error fetching TA announcements:', error);
        throw error;
    }
}

/**
 * Update TA announcement status
 * @param id - Announcement ID
 * @param status - New status
 * @returns Promise with updated announcement
 */
export async function updateTAAnnouncementStatus(
    id: string,
    status: 'open' | 'closed'
): Promise<TAAnnouncementResponse> {
    try {
        // TODO: Replace with actual API call when backend is ready
        console.log(`Updating announcement ${id} status to ${status} (mockup)`);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id,
                    courseCode: '01076104',
                    courseName: 'Programming Fundamental',
                    section: '01',
                    term: '1/2568',
                    programType: 'regular',
                    workingDay: 'monday',
                    classTime: {
                        startTime: '09:00',
                        endTime: '12:00',
                    },
                    numberOfTAs: 2,
                    requirements: '',
                    status,
                    createdAt: '2025-12-20T10:00:00Z',
                    createdBy: 'prof-123',
                });
            }, 300);
        });
    } catch (error) {
        console.error('Error updating TA announcement:', error);
        throw error;
    }
}
