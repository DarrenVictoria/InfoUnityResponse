import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import DOMPurify from 'dompurify';

const BlogModal = ({ article, onClose }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Add event listener for escape key
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Handle click outside to close
  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  // Format date if available
  const formatDate = () => {
    if (!article.publishedAt) return '';
    
    try {
      if (article.publishedAt.toDate) {
        return format(article.publishedAt.toDate(), 'MMMM d, yyyy');
      } else {
        return format(new Date(article.publishedAt), 'MMMM d, yyyy');
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  return (
    <div 
      id="modal-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto p-4"
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 max-h-screen overflow-hidden flex flex-col">
        {/* Header with image */}
        <div className="relative h-64 bg-gray-200">
          {article.coverImage && (
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h2>
            
            <div className="flex items-center text-gray-500 mb-6">
              {article.author && <span className="mr-4">{article.author}</span>}
              {formatDate() && <span>{formatDate()}</span>}
            </div>
            
            {article.summary && (
              <div className="text-lg font-medium text-gray-700 mb-6 italic">
                {article.summary}
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;