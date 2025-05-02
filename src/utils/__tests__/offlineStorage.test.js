import {
    db,
    saveReportOffline,
    getPendingReports,
    updateReportStatus,
    saveFileForOfflineUpload,
    getPendingFileUploads,
    deleteFileUpload
} from '../offlineStorage'

// Mock Dexie
jest.mock('dexie', () => {
    const mockDexie = {
        version: jest.fn().mockReturnThis(),
        stores: jest.fn().mockReturnThis(),
        disasterReports: {
            add: jest.fn(),
            where: jest.fn().mockReturnThis(),
            equals: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            update: jest.fn()
        },
        offlineUploads: {
            add: jest.fn(),
            where: jest.fn().mockReturnThis(),
            equals: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            delete: jest.fn()
        }
    }

    return jest.fn(() => mockDexie)
})

describe('offlineStorage', () => {
    beforeEach(() => {
        // Reset mock implementations
        db.disasterReports.add.mockReset()
        db.disasterReports.toArray.mockReset()
        db.disasterReports.update.mockReset()
        db.offlineUploads.add.mockReset()
        db.offlineUploads.toArray.mockReset()
        db.offlineUploads.delete.mockReset()

        // Default implementations
        db.disasterReports.add.mockResolvedValue(1)
        db.disasterReports.toArray.mockResolvedValue([])
        db.disasterReports.update.mockResolvedValue(1)
        db.offlineUploads.add.mockResolvedValue(1)
        db.offlineUploads.toArray.mockResolvedValue([])
        db.offlineUploads.delete.mockResolvedValue(undefined)
    })

    test('saveReportOffline should save a report to IndexedDB', async () => {
        const reportData = {
            disasterType: 'Flood',
            description: 'Test flood report',
            location: 'Colombo'
        }

        await saveReportOffline(reportData)

        expect(db.disasterReports.add).toHaveBeenCalledWith(expect.objectContaining({
            ...reportData,
            status: 'pending_upload'
        }))
    })

    test('getPendingReports should return pending reports', async () => {
        const mockReports = [
            { id: 1, disasterType: 'Flood', status: 'pending_upload' },
            { id: 2, disasterType: 'Landslide', status: 'pending_upload' }
        ]

        db.disasterReports.toArray.mockResolvedValue(mockReports)

        const reports = await getPendingReports()

        expect(reports).toEqual(mockReports)
        expect(db.disasterReports.equals).toHaveBeenCalledWith('pending_upload')
    })

    test('updateReportStatus should update a report status', async () => {
        await updateReportStatus(1, 'uploaded')

        expect(db.disasterReports.update).toHaveBeenCalledWith(1, { status: 'uploaded' })
    })

    test('saveFileForOfflineUpload should save file data', async () => {
        const fileBlob = new Blob(['test'], { type: 'image/jpeg' })
        const fileName = 'test.jpg'
        const userId = 'user123'

        await saveFileForOfflineUpload(fileBlob, fileName, userId)

        expect(db.offlineUploads.add).toHaveBeenCalledWith(expect.objectContaining({
            fileBlob,
            fileName,
            userId,
            timestamp: expect.any(Date)
        }))
    })

    test('getPendingFileUploads should return pending uploads', async () => {
        const mockUploads = [
            { id: 1, fileName: 'test1.jpg', userId: 'user123' },
            { id: 2, fileName: 'test2.jpg', userId: 'user123' }
        ]

        db.offlineUploads.toArray.mockResolvedValue(mockUploads)

        const uploads = await getPendingFileUploads()

        expect(uploads).toEqual(mockUploads)
    })

    test('deleteFileUpload should delete a file upload', async () => {
        await deleteFileUpload(1)

        expect(db.offlineUploads.delete).toHaveBeenCalledWith(1)
    })
})