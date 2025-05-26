import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db as firestore, storage } from '../../firebase';
import { getPendingReports, updateReportStatus, getPendingFileUploads, deleteFileUpload } from '../utils/offlineStorage';

// NEW: Robust connectivity detection hook
const useRobustConnectivity = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastChecked, setLastChecked] = useState(Date.now());

    const checkConnectivity = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            // Try to fetch a small resource with cache-busting
            const response = await fetch('/favicon.ico?t=' + Date.now(), {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const actuallyOnline = response.ok;

            if (actuallyOnline !== isOnline) {
                setIsOnline(actuallyOnline);
            }

            setLastChecked(Date.now());
            return actuallyOnline;
        } catch (error) {
            if (isOnline) {
                setIsOnline(false);
            }
            setLastChecked(Date.now());
            return false;
        }
    }, [isOnline]);

    useEffect(() => {
        const handleOnline = () => {
            console.log('Browser online event fired');
            setIsOnline(true);
            setTimeout(checkConnectivity, 100);
        };

        const handleOffline = () => {
            console.log('Browser offline event fired');
            setIsOnline(false);
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkConnectivity();
            }
        };

        const handleFocus = () => {
            checkConnectivity();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        const interval = setInterval(() => {
            const timeSinceLastCheck = Date.now() - lastChecked;
            const checkInterval = isOnline ? 10000 : 5000;

            if (timeSinceLastCheck >= checkInterval) {
                checkConnectivity();
            }
        }, 2000);

        checkConnectivity();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, [checkConnectivity, lastChecked, isOnline]);

    return { isOnline, checkConnectivity, lastChecked };
};

// UPDATED: Your existing useConnectivity hook
export function useConnectivity() {
    const { isOnline, checkConnectivity } = useRobustConnectivity(); // CHANGED: Use robust detection
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ total: 0, completed: 0, errors: 0 });

    const synchronizePendingReports = useCallback(async () => {
        // NEW: Verify we're actually online before syncing
        const actuallyOnline = await checkConnectivity();
        if (!actuallyOnline) {
            return { success: false, message: 'Cannot sync while offline' };
        }

        try {
            setIsSyncing(true);

            // KEEP YOUR EXISTING CODE FROM HERE:
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
                    const reportData = { ...report };
                    delete reportData.id;
                    delete reportData.offlineTimestamp;
                    delete reportData.status;

                    if (reportData.offlineImageIds && reportData.offlineImageIds.length > 0) {
                        reportData.images = [
                            ...reportData.images || [],
                            ...reportData.offlineImageIds
                                .filter(id => uploadedFiles[id])
                                .map(id => uploadedFiles[id])
                        ];
                        delete reportData.offlineImageIds;
                    }

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
    }, [checkConnectivity]); // CHANGED: Add checkConnectivity dependency

    // UPDATED: Auto-sync with connectivity verification
    useEffect(() => {
        if (isOnline) {
            setTimeout(() => {
                synchronizePendingReports();
            }, 1000); // CHANGED: Add 1 second delay for stable connection
        }
    }, [isOnline, synchronizePendingReports]);

    return {
        isOnline,
        isSyncing,
        syncStatus,
        synchronizePendingReports,
        checkConnectivity // NEW: Export for manual checks
    };
}

// NEW: Export the robust connectivity hook for other components
export { useRobustConnectivity };