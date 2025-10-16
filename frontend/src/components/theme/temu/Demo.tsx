"use client";

import React from "react";
import { ShoppingBag, Search, Tag, Star } from "lucide-react";

const TemuDemo: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">MCP Store</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="absolute top-8 left-0 right-0 px-3 py-4">
        <div className="text-center">
          {/* Title */}
          <h1 className="text-lg font-bold text-white mb-1">
            Discover Amazing Services
          </h1>

          {/* Subtitle */}
          <p className="text-xs text-white/90 mb-3">
            Find the perfect MCP server for your needs
          </p>

          {/* Search Bar */}
          <div className="flex gap-1 mb-3">
            <div className="flex-1 bg-white rounded-md px-2 py-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Search...</span>
            </div>
            <div className="bg-white px-3 py-1 rounded-md">
              <span className="text-xs text-orange-500 font-medium">Go</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="absolute top-[150px] left-0 right-0 bg-white rounded-t-lg px-3 py-3">
        {/* Section Header */}
        <div className="flex items-center gap-1 mb-2">
          <Tag className="w-3 h-3 text-orange-500" />
          <span className="text-sm font-bold text-gray-900">Featured</span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Product 1 */}
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="mb-1">
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">
                AI Assistant
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1">
                Smart AI helper
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600">$9.99</span>
              <div className="flex items-center gap-1">
                <Star className="w-2 h-2 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-500">4.8</span>
              </div>
            </div>
          </div>

          {/* Product 2 */}
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div className="mb-1">
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">
                Data Analyzer
              </h3>
              <p className="text-xs text-gray-600 line-clamp-1">
                Powerful analytics
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600">$14.99</span>
              <div className="flex items-center gap-1">
                <Star className="w-2 h-2 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-500">4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemuDemo;