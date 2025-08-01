import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Leaf, ShoppingCart } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
        {/* Content */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-full">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-green-600 font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Fresh from Farm
          </span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 bg-clip-text text-transparent">
            Nareshwadi
          </span>
          <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Products
          </span>
          <span className="block text-2xl lg:text-3xl font-normal text-gray-600 mt-2">
            Direct to Your Doorstep
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover the finest selection of organic fruits, vegetables, grains, and dairy products 
          sourced directly from local farmers. Fresh, healthy, and delivered with care.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            onClick={() => {
              const productsSection = document.getElementById('products');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            onClick={() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Learn More
          </Button>
        </div>
        
        {/* Enhanced Stats - Removed 24/7 Support */}
        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">500+</div>
            <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
          </div>
          <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">50+</div>
            <div className="text-sm text-gray-600 font-medium">Fresh Products</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;