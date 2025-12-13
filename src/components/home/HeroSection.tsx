'use client';

import React from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Now with Google Drive integration
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Client approvals,{' '}
            <span className="text-indigo-600">simplified</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            {APP_NAME} is the client approval portal for freelancers and agencies. 
            Upload deliverables, collect feedback, and get sign-off faster.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/signup" size="lg">
              Start Free Trial
            </Button>
            <Button href="/#features" variant="secondary" size="lg">
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center">
            <div className="flex -space-x-2">
              {['S', 'M', 'E', 'D', 'K'].map((initial, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm ring-2 ring-white"
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Trusted by <span className="font-semibold text-gray-900">500+</span> freelancers and agencies
            </p>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="mt-16 relative">
          <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-gray-700 rounded-md text-gray-400 text-sm">
                  app.signo.com/projects
                </div>
              </div>
            </div>
            
            {/* App Mockup Content */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Project Cards */}
                {[
                  { title: 'Brand Identity', client: 'Acme Corp', status: 'Approved', color: 'green' },
                  { title: 'Website Redesign', client: 'TechStart', status: 'Waiting', color: 'yellow' },
                  { title: 'Marketing Assets', client: 'GrowthCo', status: 'Changes', color: 'red' },
                ].map((project, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${project.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                        ${project.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${project.color === 'red' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                    <div className="mt-4 flex gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded" />
                      <div className="w-8 h-8 bg-gray-100 rounded" />
                      <div className="w-8 h-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce">
            ✓ Project Approved!
          </div>
        </div>
      </div>
    </section>
  );
}