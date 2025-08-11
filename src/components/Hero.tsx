import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Leaf, ShoppingCart, Users, Package } from 'lucide-react';
import heroFarm from '../assets/hero-farm.jpg';
import fruitsImg from '../assets/fruits.jpg';
import vegetablesImg from '../assets/vegetables.jpg';
import farmerPortrait from '../assets/farmer-portrait.jpg';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={heroFarm} 
          alt="Nareshwadi Farm Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Product Images */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full overflow-hidden shadow-2xl opacity-80 animate-pulse">
        <img src={fruitsImg} alt="Fresh Fruits" className="w-full h-full object-cover" />
      </div>
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full overflow-hidden shadow-2xl opacity-80 animate-pulse delay-1000">
        <img src={vegetablesImg} alt="Organic Vegetables" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-1/2 left-1/4 w-28 h-28 rounded-full overflow-hidden shadow-2xl opacity-80 animate-pulse delay-500">
        <img src={farmerPortrait} alt="Nareshwadi Farmer" className="w-full h-full object-cover" />
      </div>

      {/* Main Content Container */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center space-y-8">
          
          {/* Badge Section */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-green-600 font-semibold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Fresh from Farm
            </span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4 mb-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="block bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 bg-clip-text text-transparent">
                Nareshwadi
              </span>
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Products
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl font-normal text-gray-600 leading-relaxed">
              Direct to Your Doorstep
            </p>
          </div>
          
          {/* Description */}
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover the finest selection of organic fruits, vegetables, grains, and dairy products 
              sourced directly from local farmers. Fresh, healthy, and delivered with care.
            </p>
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-10 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              Shop Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-3 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 px-10 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl"
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Learn More
            </Button>
            <Button
              variant="default"
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
              onClick={() => {
                const donateSection = document.getElementById('donate');
                if (donateSection) {
                  donateSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Support Us
            </Button>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-green-600 mr-2" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-lg text-gray-700 font-medium">Happy Customers</div>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center mb-3">
                <Package className="h-8 w-8 text-green-600 mr-2" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-lg text-gray-700 font-medium">Fresh Products</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;