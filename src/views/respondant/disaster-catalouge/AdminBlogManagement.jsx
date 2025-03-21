import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../firebase';
import { Edit, Trash2, Plus, Image, Save, X, ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns'; // Import the format function
import NavigationBar from '../../../utils/Navbar';

const AdminBlogManagement = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

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

  const handleCreate = () => {
    setCurrentArticle(null);
    setTitle('');
    setSummary('');
    setContent('');
    setAuthor('');
    setImageFile(null);
    setImagePreview(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setTitle(article.title || '');
    setSummary(article.summary || '');
    setContent(article.content || '');
    setAuthor(article.author || '');
    setImagePreview(article.coverImage || null);
    setImageFile(null);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const storageRef = ref(storage, `article-images/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t('admin.titleRequired'));
      return;
    }

    setSaving(true);
    try {
      let imageUrl = currentArticle?.coverImage || null;
      
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const articleData = {
        title,
        summary,
        content,
        author,
        coverImage: imageUrl,
        updatedAt: serverTimestamp()
      };
      
      if (isCreating) {
        articleData.publishedAt = serverTimestamp();
        await addDoc(collection(db, 'disasterArticles'), articleData);
      } else if (isEditing && currentArticle) {
        const articleRef = doc(db, 'disasterArticles', currentArticle.id);
        await updateDoc(articleRef, articleData);
      }
      
      // Reset and fetch updated list
      setIsEditing(false);
      setIsCreating(false);
      setCurrentArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      alert(t('admin.savingError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    
    try {
      const articleRef = doc(db, 'disasterArticles', article.id);
      await deleteDoc(articleRef);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert(t('admin.deletingError'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setCurrentArticle(null);
  };

  // Rich text editor modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Render the list of articles
  const renderArticlesList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('admin.noArticles')}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center mx-auto"
            onClick={handleCreate}
          >
            <Plus className="h-5 w-5 mr-2" /> {t('admin.createArticle')}
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left py-3 px-4 uppercase font-medium text-sm">{t('admin.title')}</th>
              <th className="text-left py-3 px-4 uppercase font-medium text-sm">{t('admin.author')}</th>
              <th className="text-left py-3 px-4 uppercase font-medium text-sm">{t('admin.published')}</th>
              <th className="text-right py-3 px-4 uppercase font-medium text-sm">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 max-w-xs truncate">{article.title}</td>
                <td className="py-3 px-4">{article.author || '-'}</td>
                <td className="py-3 px-4">
                  {article.publishedAt?.toDate 
                    ? format(article.publishedAt.toDate(), 'MMM d, yyyy') 
                    : article.publishedAt 
                      ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                      : '-'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    className="text-blue-500 hover:text-blue-700 mr-4"
                    onClick={() => handleEdit(article)}
                    title={t('admin.edit')}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(article)}
                    title={t('admin.delete')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render form for creating or editing
  const renderForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isCreating ? t('admin.createArticle') : t('admin.editArticle')}
          </h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            {t('admin.title')} *
          </label>
          <input
            id="title"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        {/* Author */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
            {t('admin.author')}
          </label>
          <input
            id="author"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        
        {/* Summary */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
            {t('admin.summary')}
          </label>
          <textarea
            id="summary"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
          />
        </div>
        
        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t('admin.coverImage')}
          </label>
          
          {imagePreview && (
            <div className="relative mb-4 h-48 bg-gray-100 rounded overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-sm hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {!imagePreview && (
            <div className="flex items-center">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md flex items-center">
                <Image className="h-5 w-5 mr-2" />
                {t('admin.uploadImage')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          )}
        </div>
        
        {/* Content - Rich Text Editor */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {t('admin.content')}
          </label>
          <div className="border rounded">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              className="h-64"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={handleCancel}
          >
            {t('admin.cancel')}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {t('admin.save')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-16">
        <NavigationBar />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.articleManagement')}</h1>
        {!isEditing && !isCreating && (
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            onClick={handleCreate}
          >
            <Plus className="h-5 w-5 mr-2" /> {t('admin.createArticle')}
          </button>
        )}
      </div>
      
      {isEditing || isCreating ? renderForm() : renderArticlesList()}
    </div>
  );
};

export default AdminBlogManagement;