import { openDB } from 'idb';

const DB_NAME = 'disasterCatalogueDB';
const DB_VERSION = 1;
const ARTICLE_STORE = 'articles';
const PAGE_STORE = 'pages';

export const catalogueDB = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        // Create articles store
        if (!db.objectStoreNames.contains(ARTICLE_STORE)) {
            const articlesStore = db.createObjectStore(ARTICLE_STORE, { keyPath: 'id' });
            articlesStore.createIndex('by-type', 'disasterType');
            articlesStore.createIndex('by-date', 'publishedAt');
        }

        // Create pages store
        if (!db.objectStoreNames.contains(PAGE_STORE)) {
            const pagesStore = db.createObjectStore(PAGE_STORE, { keyPath: 'id' });
            pagesStore.createIndex('by-path', 'path');
        }
    }
});

// Save articles to IndexedDB
export const saveArticlesToDB = async (articles) => {
    const db = await catalogueDB;
    const tx = db.transaction(ARTICLE_STORE, 'readwrite');

    for (const article of articles) {
        await tx.store.put(article);
    }

    return tx.done;
};

// Get all articles from IndexedDB
export const getAllArticles = async () => {
    const db = await catalogueDB;
    return db.getAll(ARTICLE_STORE);
};

// Get articles by disaster type
export const getArticlesByType = async (disasterType) => {
    const db = await catalogueDB;
    const index = db.transaction(ARTICLE_STORE).store.index('by-type');
    return index.getAll(disasterType);
};

// Save page content
export const savePageContent = async (pageId, content) => {
    const db = await catalogueDB;
    await db.put(PAGE_STORE, {
        id: pageId,
        content,
        timestamp: new Date()
    });
};

// Get page content
export const getPageContent = async (pageId) => {
    const db = await catalogueDB;
    return db.get(PAGE_STORE, pageId);
};