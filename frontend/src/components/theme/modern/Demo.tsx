import React from 'react';

const ModernDemo: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg"></div>
            <span className="text-sm font-semibold text-gray-800">Platform</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6 text-center">
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Modern Platform</h1>
          <p className="text-xs text-gray-600">Clean & Minimalist Design</p>
        </div>
        
        {/* CTA Button */}
        <div className="mb-4">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-4 py-2 rounded-full shadow-lg">
            Get Started
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="w-4 h-4 bg-blue-100 rounded-lg mb-2"></div>
            <div className="text-xs font-medium text-gray-800 mb-1">Feature 1</div>
            <div className="text-xs text-gray-500">Modern UI</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="w-4 h-4 bg-indigo-100 rounded-lg mb-2"></div>
            <div className="text-xs font-medium text-gray-800 mb-1">Feature 2</div>
            <div className="text-xs text-gray-500">Clean Design</div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-indigo-400/20 to-blue-500/20 rounded-full translate-y-6 -translate-x-6"></div>
    </div>
  );
};

export default ModernDemo;