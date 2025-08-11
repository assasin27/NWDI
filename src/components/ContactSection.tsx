import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.message) {
        setAlert({ type: 'error', message: 'Please fill in all required fields.' });
        return;
      }

      // Create email content
      const emailSubject = 'Nareshwadi Customer Inquiry';
      const emailBody = `
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Message: ${formData.message}
      `.trim();

      // Create mailto link
      const mailtoLink = `mailto:swayam.mahajan@somaiya.edu?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Open email client
      window.open(mailtoLink);

      setAlert({ type: 'success', message: 'Your message has been sent! We will get back to you soon.' });
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: ''
      });

    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or want to place a bulk order? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your inquiry..."
                    rows={4}
                    required
                  />
                </div>

                {alert && (
                  <Alert className={alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <AlertDescription className={alert.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                      {alert.message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center lg:text-left">Contact Information</h3>
              
              {/* Contact Details Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-200">
                  {/* Address */}
                  <div className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600 leading-relaxed">Nareshwadi Village, Pune District, Maharashtra, India</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">+91 98765 43210</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                      <p className="text-gray-600">info@nareshwadi.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">Business Hours</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-gray-200">
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900">Monday - Friday</span>
                    <span className="text-gray-600">8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900">Saturday</span>
                    <span className="text-gray-600">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-900">Sunday</span>
                    <span className="text-gray-600">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">Why Choose Us</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">Fresh from local farms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">100% organic products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">Fast delivery service</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-600">Supporting local farmers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 max-w-2xl mx-auto text-center bg-green-50 rounded-xl p-8 shadow">
          <h3 className="text-2xl font-bold text-green-800 mb-4">Stay Updated!</h3>
          <p className="text-gray-700 mb-6">Subscribe to get updates on new products, offers, and Nareshwadi impact stories.</p>
          <form
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            onSubmit={e => {
              e.preventDefault();
              alert('Thank you for subscribing!');
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 w-full sm:w-auto"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;