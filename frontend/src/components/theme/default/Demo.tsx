"use client";

import React from "react";
import { Search } from "lucide-react";

const DefaultDemo: React.FC = () => {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-gray-900 font-semibold text-sm">
              MCP Store
            </span>
          </div>
          <div className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm">
            Get Started
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute top-10 left-0 right-0 bottom-0 px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold text-blue-600 mb-2">
            Default Platform
          </h1>
          <p className="text-gray-700 mb-2 text-xs">Clean & Simple Design</p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search MCP servers"
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Server Grid */}
        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Server Card 1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">测试1</h3>
            <p className="text-xs text-gray-600 mb-2">XPack-1</p>
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Beta
              </span>
              <span className="text-xs text-gray-500">Free</span>
            </div>
          </div>

          {/* Server Card 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">XPack</h3>
            <p className="text-xs text-gray-600 mb-2">XPack-1</p>
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Beta
              </span>
              <span className="text-xs text-gray-500">$0.02 /Per Call</span>
            </div>
          </div>

          {/* Server Card 3 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">XPack</h3>
            <p className="text-xs text-gray-600 mb-2">XPack</p>
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Beta
              </span>
              <span className="text-xs text-gray-500">$0.02 /Per Call</span>
            </div>
          </div>

          {/* Server Card 4 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-900 mb-1 text-sm">
              Pet Store API
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              A comprehensive API for managing pet store...
            </p>
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Beta
              </span>
              <span className="text-xs text-gray-500">Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white px-6 py-2 border-t border-gray-100">
        <div className="flex items-center justify-end text-xs text-gray-500">
          <span>© 2025 Platform</span>
        </div>
      </div>
    </div>
  );
};

export default DefaultDemo;
