import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import EmergencyCard from './components/EmergencyCard';
import BlogSlider from './components/BlogSlider';
import BlogModal from './components/BlogModal';
import Drought from '../../../assets/Droughts.png';
import Tsunami from '../../../assets/Tsunami.png';
import Flood from '../../../assets/Flood.png';
import Landslide from '../../../assets/Landslides.png';
import NavigationBar from '../../../utils/Navbar';

const DisasterCatalouge = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesCollection = collection(db, 'disasterArticles');
        const articlesSnapshot = await getDocs(articlesCollection);
        const articlesList = articlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticles(articlesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const emergencyCards = [
    {
      title: t('emergency.drought'),
      image: Drought,
      path: "/help/drought"
    },
    {
      title: t('emergency.tsunami'),
      image: Tsunami,
      path: "/help/tsunamis"
    },
    {
      title: t('emergency.flood'),
      image: Flood,
      path: "/help/floods"
    },
    {
      title: t('emergency.landslide'),
      image: Landslide,
      path: "/help/landslides"
    }
  ];  



  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      <NavigationBar />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-center my-6">{t('emergency.responseTitle')}</h1>
        
        {/* Blog Article Slider */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t('emergency.latestArticles')}</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <BlogSlider articles={articles} onArticleClick={handleArticleClick} />
          )}
        </section>
        
        {/* Emergency Response Grid */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">{t('emergency.stayInformed')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {emergencyCards.map((card, index) => (
              <EmergencyCard
                key={index}
                title={card.title}
                image={card.image}
                path={card.path}
              />
            ))}
          </div>
        </section>
      </div>
      
      {/* Blog Article Modal */}
      {modalOpen && selectedArticle && (
        <BlogModal article={selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
};

export default DisasterCatalouge;