import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFire, 
  FaPhone, 
  FaUsers, 
  FaTruck, 
  FaFirstAid, 
  FaShieldAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaClock,
  FaHeart,
  FaAward,
  FaGraduationCap,
  FaTools,
  FaLeaf,
  FaHome,
  FaIndustry,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      gradient: 'from-red-900 via-red-700 to-red-600',
      title: 'Protecting Our Community 24/7',
      subtitle: 'Professional fire and emergency services for Sri Lanka',
      cta: 'Emergency: 110',
      icon: <FaFire className="h-24 w-24 text-white/20" />
    },
    {
      gradient: 'from-red-800 via-red-600 to-orange-600',
      title: 'Advanced Emergency Response',
      subtitle: 'State-of-the-art equipment and highly trained personnel',
      cta: 'Learn More',
      icon: <FaTruck className="h-24 w-24 text-white/20" />
    },
    {
      gradient: 'from-red-700 via-orange-600 to-red-500',
      title: 'Community Safety First',
      subtitle: 'Prevention, education, and rapid emergency response',
      cta: 'Safety Tips',
      icon: <FaShieldAlt className="h-24 w-24 text-white/20" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-red-700 text-white shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <FaFire className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FireLink-SL</h1>
                <p className="text-red-200 text-sm">Fire & Rescue Department</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-red-200 transition-colors">Home</Link>
              <Link to="#services" className="hover:text-red-200 transition-colors">Services</Link>
              <Link to="#about" className="hover:text-red-200 transition-colors">About</Link>
              <Link to="#contact" className="hover:text-red-200 transition-colors">Contact</Link>
              <Link 
                to="/civilian-dashboard" 
                className="bg-red-600 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
              >
                Civilian Portal
              </Link>
              <Link 
                to="/staff-login" 
                className="bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Staff Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                <Link to="/" className="px-4 py-2 hover:bg-red-600 rounded">Home</Link>
                <Link to="#services" className="px-4 py-2 hover:bg-red-600 rounded">Services</Link>
                <Link to="#about" className="px-4 py-2 hover:bg-red-600 rounded">About</Link>
                <Link to="#contact" className="px-4 py-2 hover:bg-red-600 rounded">Contact</Link>
                <Link to="/civilian-dashboard" className="px-4 py-2 bg-red-600 hover:bg-red-800 rounded">Civilian Portal</Link>
                <Link to="/staff-login" className="px-4 py-2 bg-gray-800 hover:bg-gray-900 rounded">Staff Login</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <FaExclamationTriangle className="h-4 w-4" />
            <span>EMERGENCY HOTLINE: 110 | Fire Safety Hotline: 011-2433-444</span>
            <FaExclamationTriangle className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Hero Section with Slider */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full bg-gradient-to-br ${slide.gradient} relative overflow-hidden`}>
              {/* Background Icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
                {slide.icon}
              </div>
              
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white/10 rounded-full animate-bounce"></div>
              </div>
              
              <div className="relative h-full flex items-center justify-center text-white text-center z-10">
                <div className="max-w-4xl mx-auto px-4">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-in-right">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                    <button className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg">
                      <FaPhone className="mr-2" />
                      {slide.cta}
                    </button>
                    <Link 
                      to="/civilian-dashboard"
                      className="bg-red-800/80 hover:bg-red-900 backdrop-blur text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg border border-white/20"
                    >
                      <FaUsers className="mr-2" />
                      Civilian Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-red-600' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600 group">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-gray-600 font-medium">Emergency Response</div>
              <div className="mt-2 text-xs text-gray-500">Always Available</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600 group">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">150+</div>
              <div className="text-gray-600 font-medium">Trained Personnel</div>
              <div className="mt-2 text-xs text-gray-500">Expert Team</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600 group">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">25</div>
              <div className="text-gray-600 font-medium">Fire Stations</div>
              <div className="mt-2 text-xs text-gray-500">Island Wide</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-red-600 group">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
              <div className="mt-2 text-xs text-gray-500">Proven Results</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive fire and emergency services to protect and serve our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Emergency Response */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaFire className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fire Emergency Response</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Rapid response to fire emergencies with state-of-the-art equipment and trained personnel.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Medical Emergency */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaFirstAid className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Medical Emergency</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Emergency medical services and first aid response for critical situations.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Rescue Operations */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Rescue Operations</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Specialized rescue operations including water, height, and confined space rescues.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Fire Prevention */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fire Prevention Education</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Community education programs and fire safety inspections to prevent emergencies.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Industrial Safety */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaIndustry className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Industrial Safety</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Specialized services for industrial facilities and hazardous material incidents.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Community Support */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaHeart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Community Support</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Public education, school visits, and community engagement programs.
              </p>
              <Link to="/civilian-dashboard" className="text-red-600 hover:text-red-700 flex items-center group-hover:translate-x-1 transition-transform duration-300">
                Learn More <FaChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About FireLink-SL</h2>
              <p className="text-lg text-gray-600 mb-6">
                FireLink-SL is Sri Lanka's premier fire and emergency response service, dedicated to protecting 
                lives, property, and the environment. With over decades of experience, we combine traditional 
                firefighting expertise with cutting-edge technology.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaAward className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">ISO 9001:2015 Certified Organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaUsers className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">150+ Highly Trained Professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaTruck className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">Modern Fleet & Advanced Equipment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaClock className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">Average Response Time: Under 8 Minutes</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-gray-900">Our Mission</h3>
              <blockquote className="text-gray-600 italic text-lg leading-relaxed">
                "To protect and serve our community through professional fire suppression, 
                emergency medical services, rescue operations, and fire prevention education, 
                while maintaining the highest standards of safety and excellence."
              </blockquote>
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700">
                  <FaShieldAlt className="h-5 w-5" />
                  <span className="font-semibold">Commitment to Excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-red-100">
              We're here to help 24/7. Reach out to us for emergencies or general inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 p-4 rounded-full w-fit mx-auto mb-4">
                <FaPhone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Hotline</h3>
              <p className="text-2xl font-bold text-red-100">110</p>
              <p className="text-red-200">Available 24/7</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 p-4 rounded-full w-fit mx-auto mb-4">
                <FaMapMarkerAlt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Headquarters</h3>
              <p className="text-red-100">No. 123, Galle Road</p>
              <p className="text-red-100">Colombo 03, Sri Lanka</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-600 p-4 rounded-full w-fit mx-auto mb-4">
                <FaClock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Office Hours</h3>
              <p className="text-red-100">Mon - Fri: 8:00 AM - 6:00 PM</p>
              <p className="text-red-200">Emergency Services: 24/7</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/civilian-dashboard"
              className="bg-white text-red-700 hover:bg-red-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
            >
              <FaUsers className="mr-2" />
              Access Civilian Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <FaFire className="h-8 w-8 text-red-500" />
                <span className="text-xl font-bold">FireLink-SL</span>
              </div>
              <p className="text-gray-400">
                Protecting lives and property through professional fire and emergency services.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="#services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/civilian-dashboard" className="hover:text-white transition-colors">Civilian Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Fire Emergency Response</li>
                <li>Medical Emergency</li>
                <li>Rescue Operations</li>
                <li>Fire Prevention</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Emergency Contacts</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emergency: <span className="text-red-400 font-bold">110</span></li>
                <li>Fire Safety: 011-2433-444</li>
                <li>Admin: 011-2433-400</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FireLink-SL Fire & Rescue Department. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;