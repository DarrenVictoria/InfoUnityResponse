import React, { useState, useEffect } from 'react';
import LocationSelector from '../../components/LocationSelector';
import { AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const WarningForm = () => {
  const [warningType, setWarningType] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    severity: '',
    messageId: '',
    validFrom: '',
    validUntil: '',
    district: '',
    dsDivision: '',
    description: '',
    gnDivisions: [],
    riverBasin: '',
    currentLevel: '',
    alertLevel: '',
    minorFloodLevel: '',
    majorFloodLevel: '',
    windSpeed: '',
    waveHeight: '',
    incidentType: '',
    warningMessage: ''
  });

  // Generate message ID on component mount
  useEffect(() => {
    const generateMessageId = () => {
      const date = new Date();
      const timestamp = date.getTime();
      const random = Math.floor(Math.random() * 1000);
      const messageId = `WARN-${timestamp}-${random}`;
      setFormData(prev => ({ ...prev, messageId }));
    };
    generateMessageId();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.severity) newErrors.severity = 'Severity is required';
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (!formData.validUntil) newErrors.validUntil = 'Valid until date is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.warningMessage) newErrors.warningMessage = 'Warning message is required';

    // Type-specific validation
    if (warningType === 'Flood') {
      if (!formData.riverBasin) newErrors.riverBasin = 'River basin is required';
      if (!formData.currentLevel) newErrors.currentLevel = 'Current level is required';
      if (formData.currentLevel && formData.currentLevel < 0) {
        newErrors.currentLevel = 'Current level must be positive';
      }
    }

    if (warningType === 'Marine') {
      if (!formData.windSpeed) newErrors.windSpeed = 'Wind speed is required';
      if (formData.windSpeed && formData.windSpeed < 0) {
        newErrors.windSpeed = 'Wind speed must be positive';
      }
      if (!formData.waveHeight) newErrors.waveHeight = 'Wave height is required';
      if (formData.waveHeight && formData.waveHeight < 0) {
        newErrors.waveHeight = 'Wave height must be positive';
      }
    }

    // Date validation
    if (formData.validFrom && formData.validUntil) {
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      if (fromDate >= untilDate) {
        newErrors.validUntil = 'Valid until date must be after valid from date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleLocationChange = (district, dsDivision) => {
    setFormData(prev => ({
      ...prev,
      district,
      dsDivision,
      gnDivisions: []
    }));
    // Clear location-related errors
    if (errors.district || errors.dsDivision) {
      setErrors(prev => ({
        ...prev,
        district: undefined,
        dsDivision: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        
        const warningData = {
          type: warningType,
          ...formData,
          createdAt: serverTimestamp(),
          status: 'active',
          // Convert date strings to Firestore Timestamps
          validFrom: new Date(formData.validFrom),
          validUntil: new Date(formData.validUntil),
          // Convert numeric strings to numbers
          currentLevel: formData.currentLevel ? Number(formData.currentLevel) : null,
          alertLevel: formData.alertLevel ? Number(formData.alertLevel) : null,
          minorFloodLevel: formData.minorFloodLevel ? Number(formData.minorFloodLevel) : null,
          majorFloodLevel: formData.majorFloodLevel ? Number(formData.majorFloodLevel) : null,
          windSpeed: formData.windSpeed ? Number(formData.windSpeed) : null,
          waveHeight: formData.waveHeight ? Number(formData.waveHeight) : null,
        };

        // Add document to 'warnings' collection
        const warningsRef = collection(db, 'warnings');
        const docRef = await addDoc(warningsRef, warningData);
        
        console.log('Warning added with ID:', docRef.id);
        
        // Reset form after successful submission
        setFormData(prev => ({
          ...prev,
          severity: '',
          validFrom: '',
          validUntil: '',
          district: '',
          dsDivision: '',
          description: '',
          gnDivisions: [],
          riverBasin: '',
          currentLevel: '',
          alertLevel: '',
          minorFloodLevel: '',
          majorFloodLevel: '',
          windSpeed: '',
          waveHeight: '',
          incidentType: '',
          warningMessage: ''
        }));
        setWarningType('');
        
        // Show success message (you might want to add a toast notification here)
        alert('Warning issued successfully!');

      } catch (error) {
        console.error('Error adding warning:', error);
        alert('Error issuing warning. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (name, label, type = 'text', options = {}) => {
    const baseClassName = "w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const errorClassName = errors[name] ? "border-red-500" : "";
    
    switch (type) {
      case 'select':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              className={`${baseClassName} ${errorClassName}`}
            >
              <option value="">{`Select ${label}`}</option>
              {options.choices?.map(choice => (
                <option key={choice} value={choice}>{choice}</option>
              ))}
            </select>
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        );
      
      case 'datetime-local':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="datetime-local"
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              min={options.min || new Date().toISOString().slice(0, 16)}
              className={`${baseClassName} ${errorClassName}`}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              min={0}
              step={options.step || "0.01"}
              className={`${baseClassName} ${errorClassName}`}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              className={`${baseClassName} ${errorClassName} h-32 resize-none`}
              placeholder={options.placeholder}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              className={`${baseClassName} ${errorClassName}`}
              {...options}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">DMC Warning System</h2>
        <p className="text-sm text-gray-600 mt-1">Message ID: {formData.messageId}</p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning Type Selection */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Warning Type</label>
            <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg">
              {['Flood', 'Landslide', 'Marine', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    warningType === type 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setWarningType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            {renderField('severity', 'Severity', 'select', {
              choices: ['Red', 'Amber', 'Green']
            })}

            <div className="grid grid-cols-2 gap-4">
              {renderField('validFrom', 'Valid From', 'datetime-local')}
              {renderField('validUntil', 'Valid Until', 'datetime-local')}
            </div>

            {/* Location Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Location Details</h3>
              <LocationSelector onLocationChange={handleLocationChange} />
              {errors.district && (
                <p className="text-red-500 text-sm">{errors.district}</p>
              )}
            </div>
          </div>

          {/* Conditional Fields */}
          {warningType === 'Flood' && (
            <div className="space-y-4">
              {renderField('riverBasin', 'River Basin')}
              <div className="grid grid-cols-2 gap-4">
                {renderField('currentLevel', 'Current Level (m)', 'number')}
                {renderField('alertLevel', 'Alert Level (m)', 'number')}
                {renderField('minorFloodLevel', 'Minor Flood Level (m)', 'number')}
                {renderField('majorFloodLevel', 'Major Flood Level (m)', 'number')}
              </div>
            </div>
          )}

          {warningType === 'Marine' && (
            <div className="grid grid-cols-2 gap-4">
              {renderField('windSpeed', 'Wind Speed (kmph)', 'number')}
              {renderField('waveHeight', 'Wave Height (m)', 'number')}
            </div>
          )}

          {warningType === 'Other' && (
            <div className="space-y-4">
              {renderField('incidentType', 'Incident Type')}
              {renderField('description', 'Description', 'textarea', {
                placeholder: 'Describe the incident...'
              })}
            </div>
          )}

          {/* Warning Message */}
          {renderField('warningMessage', 'Immediate Warning Message', 'textarea', {
            placeholder: 'Enter immediate warning message to be sent...'
          })}

          {/* Warning Preview */}
          <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Warning Details Preview:</p>
              <p>ID: {formData.messageId}</p>
              <p>Type: {warningType}</p>
              <p>Severity: {formData.severity}</p>
              {formData.validFrom && (
                <p>Valid: {format(new Date(formData.validFrom), 'PPP p')} - {formData.validUntil && format(new Date(formData.validUntil), 'PPP p')}</p>
              )}
              <p>Location: {formData.district} {formData.dsDivision && `- ${formData.dsDivision}`}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? 'Issuing Warning...' : 'Issue Warning'}
            </button>
            <button
                type="button"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                Save Draft
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default WarningForm;