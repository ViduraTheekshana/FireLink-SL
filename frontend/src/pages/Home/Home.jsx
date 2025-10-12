import React from 'react';
import Header from '../../components/Home/Header';
import HeroSection from '../../components/Home/HeroSection';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <HeroSection />
    </div>
  );
};

export default Home;