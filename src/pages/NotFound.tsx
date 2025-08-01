import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Loader2, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    setRedirecting(true);
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-orange-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Button 
          onClick={handleGoHome}
          className="bg-green-600 hover:bg-green-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Button>
        
        <p className="text-sm text-gray-500 mt-4">
          Attempted to access: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
