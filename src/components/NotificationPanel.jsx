import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-screen overflow-y-auto">
      {notifications.map((notification, index) => (
        <div key={index} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-blue-500 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{notification.title}</h3>
            <p className="text-sm text-gray-600">{notification.body}</p>
          </div>
          <button
            onClick={() => onDismiss(index)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;