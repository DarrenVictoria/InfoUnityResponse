import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db as firestore, storage } from '../../firebase';
import { getPendingReports, updateReportStatus, getPendingFileUploads, deleteFileUpload } from '../utils/offlineStorage';

export function useConnectivity() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ total: 0, completed: 0, errors: 0 });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const synchronizePendingReports = useCallback(async () => {
        if (!isOnline) return { success: false, message: 'Cannot sync while offline' };

        try {
            setIsSyncing(true);

            // Get pending reports and file uploads
            const pendingReports = await getPendingReports();
            const pendingUploads = await getPendingFileUploads();

            setSyncStatus({
                total: pendingReports.length + pendingUploads.length,
                completed: 0,
                errors: 0
            });

            if (pendingReports.length === 0 && pendingUploads.length === 0) {
                setIsSyncing(false);
                return { success: true, message: 'No pending items to synchronize' };
            }

            // First handle file uploads
            const uploadedFiles = {};
            for (const upload of pendingUploads) {
                try {
                    const uniqueFileName = `${upload.timestamp.getTime()}_${upload.fileName}`;
                    const storageRef = ref(storage, `disaster-evidence/${upload.userId}/${uniqueFileName}`);

                    await uploadBytes(storageRef, upload.fileBlob);
                    const downloadUrl = await getDownloadURL(storageRef);

                    uploadedFiles[upload.id] = downloadUrl;
                    await deleteFileUpload(upload.id);

                    setSyncStatus(prev => ({
                        ...prev,
                        completed: prev.completed + 1
                    }));
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setSyncStatus(prev => ({
                        ...prev,
                        errors: prev.errors + 1
                    }));
                }
            }

            // Then handle report uploads
            for (const report of pendingReports) {
                try {
                    // If this report has offline images, replace with uploaded URLs
                    const reportData = { ...report };
                    delete reportData.id;
                    delete reportData.offlineTimestamp;
                    delete reportData.status;

                    // Replace offline image references with actual URLs if available
                    if (reportData.offlineImageIds && reportData.offlineImageIds.length > 0) {
                        reportData.images = [
                            ...reportData.images || [],
                            ...reportData.offlineImageIds
                                .filter(id => uploadedFiles[id])
                                .map(id => uploadedFiles[id])
                        ];
                        delete reportData.offlineImageIds;
                    }

                    // Submit to Firestore
                    await addDoc(collection(firestore, 'crowdsourcedReports'), reportData);
                    await updateReportStatus(report.id, 'uploaded');

                    setSyncStatus(prev => ({
                        ...prev,
                        completed: prev.completed + 1
                    }));
                } catch (error) {
                    console.error('Error uploading report:', error);
                    setSyncStatus(prev => ({
                        ...prev,
                        errors: prev.errors + 1
                    }));
                }
            }

            return {
                success: true,
                message: `Synchronized ${syncStatus.completed} items with ${syncStatus.errors} errors`
            };
        } catch (error) {
            console.error('Synchronization error:', error);
            return { success: false, message: error.message };
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline]);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline) {
            synchronizePendingReports();
        }
    }, [isOnline, synchronizePendingReports]);

    return {
        isOnline,
        isSyncing,
        syncStatus,
        synchronizePendingReports
    };
}