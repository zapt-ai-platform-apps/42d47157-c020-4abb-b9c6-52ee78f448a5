import React from 'react';
import { Link } from 'react-router-dom';
import { PricingSection } from '@/modules/subscriptions';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=40&height=40" 
                  alt="SideTrack Logo"
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-semibold text-gray-900">SideTrack</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/login" className="btn-primary py-2 px-4 rounded cursor-pointer">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PricingSection isPage={true} />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I use SideTrack for free?</h3>
            <p className="text-gray-600">
              Yes! SideTrack offers a free plan with unlimited medication tracking, side effect logging, and 
              daily check-ins. Free users can create up to 2 reports.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What happens when I reach the free report limit?</h3>
            <p className="text-gray-600">
              Once you've created 2 reports, you'll need to upgrade to our Standard Plan to create additional 
              reports. Your existing data and reports will remain accessible.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access to the Standard 
              Plan features until the end of your current billing period.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Is my data secure?</h3>
            <p className="text-gray-600">
              Yes, SideTrack takes data security seriously. All your health data is encrypted and stored securely. 
              We never share your personal health information with third parties.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I change my currency after subscribing?</h3>
            <p className="text-gray-600">
              You'll need to cancel your current subscription and resubscribe with your preferred currency. 
              Contact our support team if you need assistance with this process.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards including Visa, Mastercard, American Express, and Discover. 
              We also support Apple Pay and Google Pay for mobile users.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img 
                src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=40&height=40" 
                alt="SideTrack Logo"
                className="h-8 w-8 mb-4"
              />
              <p className="text-gray-500 text-sm">
                SideTrack helps you monitor medications, track side effects, and generate doctor-ready reports.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-base text-gray-500 hover:text-gray-900">Home</Link></li>
                <li><Link to="/login" className="text-base text-gray-500 hover:text-gray-900">Sign In</Link></li>
                <li><Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SideTrack. All rights reserved.
            </p>
            <a 
              href="https://www.zapt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Made on ZAPT
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}