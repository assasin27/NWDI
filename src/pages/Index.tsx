import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ProductsSection from '../components/ProductsSection';
import { AboutSection } from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import LanguageAlert from '../components/LanguageAlert';

const Index: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle navigation state for scrolling to sections
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const element = document.getElementById(sectionId);
      if (element) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Clear the state to prevent scrolling on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <Layout>
      <div className="scroll-smooth">
        <LanguageAlert />
        <Hero />
        <ProductsSection />
        <AboutSection />
        <ContactSection />
        <Footer />
      </div>
    </Layout>
  );
};

export default Index;
