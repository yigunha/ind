// utils/storage.js
const isClient = typeof window !== 'undefined';

export const storage = {
  // 메모리 저장소 (fallback)
  memoryData: {},
  
  setItem: function(key, value) {
    try {
      if (isClient && window.localStorage) {
        localStorage.setItem(key, value);
      } else {
        this.memoryData[key] = value;
      }
    } catch (error) {
      console.warn('localStorage not available, using memory storage:', error);
      this.memoryData[key] = value;
    }
  },
  
  getItem: function(key) {
    try {
      if (isClient && window.localStorage) {
        return localStorage.getItem(key);
      } else {
        return this.memoryData[key] || null;
      }
    } catch (error) {
      console.warn('localStorage not available, using memory storage:', error);
      return this.memoryData[key] || null;
    }
  },
  
  removeItem: function(key) {
    try {
      if (isClient && window.localStorage) {
        localStorage.removeItem(key);
      } else {
        delete this.memoryData[key];
      }
    } catch (error) {
      console.warn('localStorage not available, using memory storage:', error);
      delete this.memoryData[key];
    }
  },
  
  clear: function() {
    try {
      if (isClient && window.localStorage) {
        localStorage.clear();
      } else {
        this.memoryData = {};
      }
    } catch (error) {
      console.warn('localStorage not available, using memory storage:', error);
      this.memoryData = {};
    }
  }
};