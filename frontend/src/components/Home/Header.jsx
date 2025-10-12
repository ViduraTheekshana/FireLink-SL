import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'HOME', href: '#home', active: true },
    { name: 'CMC', href: '#cmc' },
    { name: 'DEPARTMENTS', href: '#departments' },
    { name: 'EVENTS', href: '#events' },
    { name: 'GALLERY', href: '#gallery' },
    { name: 'OUR TEAM', href: '#team' },
    { name: 'HISTORY', href: '#history' },
    { name: 'LOCATIONS', href: '#locations' },
    { name: 'CONTACT', href: '#contact' },
    { name: 'LOGIN', href: '/staff-login', isButton: true }
  ];

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-600">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center relative">
                {/* Fire Department Badge Design */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-700"></div>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="w-6 h-6 text-white">
                    {/* Fire/Flame Icon */}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12.016 2.01c-1.765 3.004-1.765 4.996 0 7.999 1.765-3.003 1.765-4.995 0-7.999zm-6 6c1.5 2.998 4.5 2.998 6 0 1.5 2.998 4.5 2.998 6 0 0 3.996-2.691 6.996-6 6.996s-6-3-6-6.996z"/>
                    </svg>
                  </div>
                </div>
                {/* Badge details */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">FD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`text-sm font-semibold tracking-wider transition-colors duration-300 hover:text-red-400 ${
                  item.active ? 'text-red-400' : 'text-white'
                } ${
                  item.isButton ? 'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg hover:text-white' : ''
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white hover:text-red-400 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black bg-opacity-90 rounded-lg mt-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-semibold tracking-wider transition-colors duration-300 rounded-md hover:text-red-400 hover:bg-gray-800 ${
                    item.active ? 'text-red-400 bg-gray-800' : 'text-white'
                  } ${
                    item.isButton ? 'bg-red-600 hover:bg-red-700 text-center hover:text-white' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;