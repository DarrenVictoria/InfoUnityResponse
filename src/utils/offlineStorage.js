import Dexie from 'dexie';

// Create IndexedDB database
export const db = new Dexie('InfoUnityResponseDB');

// Define database schema
db.version(1).stores({
    disasterReports: '++id,timestamp,status',
    offlineUploads: '++id,fileBlob,fileName,userId,timestamp',
});

// Save report to IndexedDB
export const saveReportOffline = async (reportData) => {
    try {
        const id = await db.disasterReports.add({
            ...reportData,
            offlineTimestamp: new Date(),
            status: 'pending_upload'
        });
        return id;
    } catch (error) {
        console.error('Error saving report offline:', error);
        throw error;
    }
};

// Get all pending reports
export const getPendingReports = async () => {
    return await db.disasterReports.where('status').equals('pending_upload').toArray();
};

// Update report status
export const updateReportStatus = async (id, status) => {
    return await db.disasterReports.update(id, { status });
};

// Save file for offline upload
export const saveFileForOfflineUpload = async (fileBlob, fileName, userId) => {
    try {
        const id = await db.offlineUploads.add({
            fileBlob,
            fileName,
            userId,
            timestamp: new Date()
        });
        return id;
    } catch (error) {
        console.error('Error saving file for offline upload:', error);
        throw error;
    }
};

// Get pending file uploads
export const getPendingFileUploads = async () => {
    return await db.offlineUploads.toArray();
};

// Delete file upload
export const deleteFileUpload = async (id) => {
    return await db.offlineUploads.delete(id);
};