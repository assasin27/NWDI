import React, { useEffect, useState } from 'react';

const LanguageAlert: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const key = 'langAlertShown';
    const hasSeenAlert = sessionStorage.getItem(key);
    
    if (!hasSeenAlert) {
      // First set showAlert to true to mount the component
      setShowAlert(true);
      // Then after a small delay, make it visible for the fade-in effect
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      
      // Set up auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation to complete before unmounting
        setTimeout(() => {
          setShowAlert(false);
        }, 300);
      }, 5000);
      
      sessionStorage.setItem(key, '1');
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation to complete before unmounting
    setTimeout(() => {
      setShowAlert(false);
    }, 300);
  };

  if (!showAlert) return null;

  return (
    <div 
      className={`fixed top-16 left-0 right-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        // Position below navbar (assuming navbar is 4rem = 16 * 4 = 64px)
        top: '4rem',
      }}
    >
      <div className="bg-green-50 border-t-2 border-b-2 border-green-400 text-green-800 p-3 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="font-medium">Language Selection</p>
              <p className="text-sm">You can choose the language according to your preference</p>
            </div>
            <button 
              onClick={handleClose}
              className="ml-4 text-green-600 hover:text-green-800 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageAlert;
