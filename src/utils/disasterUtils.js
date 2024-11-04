// utils/disasterUtils.js
export const generateDisasterUpdateId = (type, location) => {
    const timestamp = new Date().getTime();
    const cleanLocation = location.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanType}_${cleanLocation}_${timestamp}`;
  };
  
  // Example usage when adding a new update:
  import { addDoc, collection } from 'firebase/firestore';
  import { generateDisasterUpdateId } from './disasterUtils';
  
  export const addDisasterUpdate = async (updateData) => {
    try {
      const docId = generateDisasterUpdateId(updateData.type, updateData.location);
      await addDoc(collection(db, "updates"), {
        ...updateData,
        timeStamp: new Date(),
        id: docId
      });
      console.log("Update added with ID:", docId);
    } catch (error) {
      console.error("Error adding update:", error);
      throw error;
    }
  };