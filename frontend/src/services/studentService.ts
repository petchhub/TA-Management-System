const API_BASE_URL = '/TA-management';

export interface StudentProfile {
    studentId: number;
    firstnameThai: string;
    lastnameThai: string;
    email: string;
    phoneNumber: string;
    hasTranscript: boolean;
    transcriptFileName: string;
    hasBankAccount: boolean;
    bankAccountFileName: string;
    hasStudentCard: boolean;
    studentCardFileName: string;
}

export interface UpdateProfileData {
    firstnameThai: string;
    lastnameThai: string;
    phoneNumber: string;
}

/**
 * Get student profile by ID
 */
export const getStudentProfile = async (studentId: number): Promise<StudentProfile> => {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch student profile: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching student profile:', error);
        throw error;
    }
};

/**
 * Update student profile (Thai name and phone number)
 */
export const updateStudentProfile = async (
    studentId: number,
    data: UpdateProfileData
): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error updating student profile:', error);
        throw error;
    }
};

/**
 * Upload document (transcript, bank-account, student-card)
 */
export const uploadDocument = async (
    studentId: number,
    type: 'transcript' | 'bank-account' | 'student-card',
    file: File
): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/student/${studentId}/documents/${type}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload document: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
};

/**
 * Download document
 */
export const downloadDocument = async (
    studentId: number,
    type: 'transcript' | 'bank-account' | 'student-card'
): Promise<Blob> => {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${studentId}/documents/${type}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to download document: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error downloading document:', error);
        throw error;
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (
    studentId: number,
    type: 'transcript' | 'bank-account' | 'student-card'
): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE_URL}/student/${studentId}/documents/${type}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete document: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
};
