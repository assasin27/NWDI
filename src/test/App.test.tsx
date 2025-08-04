import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../contexts/NotificationContext';
import Index from '../pages/Index';

// Mock the components that might cause issues
jest.mock('../components/Hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Component</div>;
  };
});

jest.mock('../components/ProductsSection', () => {
  return function MockProductsSection() {
    return <div data-testid="products-section">Products Section</div>;
  };
});

jest.mock('../components/AboutSection', () => {
  return function MockAboutSection() {
    return <div data-testid="about-section">About Section</div>;
  };
});

jest.mock('../components/ContactSection', () => {
  return function MockContactSection() {
    return <div data-testid="contact-section">Contact Section</div>;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        {component}
      </NotificationProvider>
    </BrowserRouter>
  );
};

describe('App Functionality Tests', () => {
  test('renders main page components', () => {
    renderWithProviders(<Index />);
    
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('products-section')).toBeInTheDocument();
    expect(screen.getByTestId('about-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('page has proper structure', () => {
    renderWithProviders(<Index />);
    
    const mainContainer = screen.getByRole('main') || document.querySelector('.scroll-smooth');
    expect(mainContainer).toBeInTheDocument();
  });
}); 