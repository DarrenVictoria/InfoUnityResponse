import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BlogSlider = ({ articles, onArticleClick }) => {
  const { t } = useTranslation();
  const sliderRef = React.useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-100 rounded-lg">
        <p>{t('emergency.noArticles')}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={scrollLeft} 
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        aria-label={t('common.previous')}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <div 
        ref={sliderRef} 
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 py-4 px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="flex-none w-64 md:w-80 snap-start bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onArticleClick(article)}
          >
            <div className="h-40 overflow-hidden">
              <img 
                src={article.coverImage || '/placeholder-image.jpg'} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3">{article.summary}</p>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>{article.author}</span>
                <span>
                  {article.publishedAt?.toDate 
                    ? format(article.publishedAt.toDate(), 'MMM d, yyyy') 
                    : format(new Date(article.publishedAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={scrollRight} 
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        aria-label={t('common.next')}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};

export default BlogSlider;