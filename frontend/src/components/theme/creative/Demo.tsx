import React from 'react';

const CreativeDemo: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-2xl transform rotate-12"></div>
            <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">Creative</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6 text-center relative">
        <div className="mb-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-red-500 to-orange-600 bg-clip-text text-transparent mb-1">
            Creative Platform
          </h1>
          <p className="text-xs text-gray-700">Bold & Artistic Design Experience</p>
        </div>
        
        {/* CTA Button */}
        <div className="mb-4">
          <div className="inline-block bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white text-xs px-4 py-2 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
            Explore Now
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-pink-200/50 transform rotate-1">
            <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-xl mb-2 transform rotate-12"></div>
            <div className="text-xs font-bold text-gray-800 mb-1">Creative Tools</div>
            <div className="text-xs text-gray-600">Artistic Design</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-orange-200/50 transform -rotate-1">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl mb-2 transform -rotate-12"></div>
            <div className="text-xs font-bold text-gray-800 mb-1">Innovation</div>
            <div className="text-xs text-gray-600">Bold Ideas</div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-2 w-8 h-8 bg-gradient-to-r from-pink-400/30 to-red-400/30 rounded-full transform rotate-45"></div>
      <div className="absolute top-12 right-8 w-4 h-4 bg-gradient-to-r from-orange-400/40 to-yellow-400/40 rounded-full"></div>
      <div className="absolute bottom-8 left-2 w-6 h-6 bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded-full transform -rotate-12"></div>
      <div className="absolute bottom-4 left-8 w-3 h-3 bg-gradient-to-r from-yellow-400/40 to-orange-400/40 rounded-full"></div>
      
      {/* Decorative Shapes */}
      <div className="absolute top-0 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full transform -translate-x-1/2 -translate-y-8 rotate-45"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-orange-300/20 to-yellow-300/20 transform translate-x-6 translate-y-6 rotate-12">
        <div className="w-full h-full rounded-2xl"></div>
      </div>
    </div>
  );
};

export default CreativeDemo;