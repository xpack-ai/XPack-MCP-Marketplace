import React from "react";

const ClassicDemo: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-600 rounded-sm"></div>
            <span className="text-sm font-bold">PLATFORM</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-1">
        <div className="flex space-x-4">
          <div className="text-xs text-gray-700 font-medium">Home</div>
          <div className="text-xs text-gray-500">Servers</div>
          <div className="text-xs text-gray-500">About</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6 bg-white border-b border-gray-200">
        <div className="text-center">
          <h1 className="text-lg font-bold text-slate-800 mb-1">
            Professional Platform
          </h1>
          <p className="text-xs text-gray-600 mb-3">
            Traditional & Reliable Business Solution
          </p>

          {/* CTA Button */}
          <div className="inline-block bg-red-600 text-white text-xs px-4 py-2 rounded-sm shadow-md font-medium">
            Learn More
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-4 bg-gray-50">
        <div className="grid grid-cols-1 gap-3">
          {/* Server Item */}
          <div className="bg-white border border-gray-200 rounded-sm p-3 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 bg-slate-600 rounded-sm mt-0.5"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-800 mb-1">
                  Business Server
                </div>
                <div className="text-xs text-gray-600">
                  Professional solutions for enterprise
                </div>
              </div>
            </div>
          </div>

          {/* Server Item */}
          <div className="bg-white border border-gray-200 rounded-sm p-3 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-4 h-4 bg-red-600 rounded-sm mt-0.5"></div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-800 mb-1">
                  Consulting
                </div>
                <div className="text-xs text-gray-600">
                  Expert guidance and support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-700 px-4 py-2">
        <div className="text-center">
          <div className="text-xs text-gray-300">© 2025 Platform</div>
        </div>
      </div>
    </div>
  );
};

export default ClassicDemo;
