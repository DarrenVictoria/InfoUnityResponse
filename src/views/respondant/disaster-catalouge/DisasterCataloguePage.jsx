import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { saveArticlesToDB, getAllArticles, getArticlesByType } from '../../../idb/catalogueDB';
import NavigationBar from '../../../utils/Navbar';
import { useTranslation } from 'react-i18next';

const DisasterCataloguePage = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleStatusChange = () => {
      setNetworkStatus(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        if (navigator.onLine) {
          // Online: Fetch from Firestore and update IndexedDB
          const articlesRef = query(
            collection(db, 'disasterArticles'),
            orderBy('publishedAt', 'desc')
          );
          
          const snapshot = await getDocs(articlesRef);
          const articleData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt?.toDate() || new Date()
          }));
          
          await saveArticlesToDB(articleData);
          setArticles(articleData);
        } else {
          // Offline: Get from IndexedDB
          const cachedArticles = await getAllArticles();
          setArticles(cachedArticles);
          
          if (cachedArticles.length === 0) {
            setError('No cached articles available offline');
          }
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles. Please try again later.');
        
        // Try to get cached articles as fallback
        try {
          const cachedArticles = await getAllArticles();
          if (cachedArticles.length > 0) {
            setArticles(cachedArticles);
            setError('Using cached content - some information may be outdated');
          }
        } catch (cacheErr) {
          console.error('Error fetching cached articles:', cacheErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [networkStatus]);

return (
    <div className="container mx-auto px-4 py-8 mt-8">
        <NavigationBar />
        
        {/* Network status indicator */}
        {!networkStatus && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded" role="alert">
                <p className="font-bold">{t('Offline Mode')}</p>
                <p>{t('You are viewing cached content. Some information may be outdated.')}</p>
            </div>
        )}
        
        <h1 className="text-3xl font-bold mb-8">{t('Disaster Catalogue')}</h1>
        
        {isLoading ? (
            <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        ) : error && articles.length === 0 ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">{t('Error')}</p>
                <p>{error}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        )}
    </div>
);
};

const ArticleCard = ({ article }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {article.coverImage && (
        <img 
          src={article.coverImage} 
          alt={article.title} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-image.jpg'; // Fallback image
          }} 
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
        <p className="text-gray-700 mb-4 line-clamp-3">{article.summary}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {article.publishedAt?.toLocaleDateString() || 'Date unavailable'}
          </span>
          <a 
            href={`/disaster-article/${article.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {t('common.readMore')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default DisasterCataloguePage;