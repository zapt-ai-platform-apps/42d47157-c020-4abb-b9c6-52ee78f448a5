import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/modules/auth';
import * as Sentry from '@sentry/browser';
import { supabase } from '@/supabaseClient';
import { CurrencyModal, ManageSubscriptionButton } from '@/modules/subscriptions';

export default function Layout({ children }) {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  useEffect(() => {
    // Only fetch subscription status if user is logged in
    if (user) {
      const fetchSubscriptionStatus = async () => {
        try {
          setSubscriptionLoading(true);
          const { data: { session } } = await supabase.auth.getSession();
          
          const response = await fetch('/api/subscriptions', {
            headers: {
              Authorization: `Bearer ${session?.access_token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch subscription status');
          }
          
          const data = await response.json();
          setSubscriptionStatus(data);
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          Sentry.captureException(error);
        } finally {
          setSubscriptionLoading(false);
        }
      };
      
      fetchSubscriptionStatus();
    }
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const navLinkClass = ({ isActive }) => 
    isActive 
      ? "text-indigo-600 font-medium" 
      : "text-gray-600 hover:text-gray-900";
  
  const handleDirectUpgrade = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Open currency selection modal
    setIsCurrencyModalOpen(true);
  };
  
  const handleCurrencyConfirm = async (selectedCurrency) => {
    setIsCurrencyModalOpen(false);
    
    try {
      setIsUpgradeLoading(true);
      console.log('Creating Stripe checkout session from navigation with currency:', selectedCurrency);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          currency: selectedCurrency,
          returnUrl: `${window.location.origin}/dashboard` // Return to dashboard after checkout
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `Failed to create subscription (Status: ${response.status})`);
      }
      
      const checkoutSession = await response.json();
      console.log('Received checkout session:', checkoutSession);

      if (!checkoutSession.url) {
        throw new Error('No checkout URL received from server');
      }

      // Redirect to Stripe checkout page
      console.log('Redirecting to Stripe checkout:', checkoutSession.url);
      window.location.href = checkoutSession.url;
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      Sentry.captureException(error);
      // If there's an error, navigate to the pricing page as fallback
      navigate('/pricing');
    } finally {
      setIsUpgradeLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
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
            
            {user && (
              <>
                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                  <NavLink to="/medications" className={navLinkClass}>Medications</NavLink>
                  <NavLink to="/side-effects" className={navLinkClass}>Side Effects</NavLink>
                  <NavLink to="/daily-checkins" className={navLinkClass}>Daily Check-ins</NavLink>
                  <NavLink to="/reports" className={navLinkClass}>Reports</NavLink>
                  
                  {subscriptionStatus?.hasActiveSubscription ? (
                    <ManageSubscriptionButton className="py-1 px-3 text-sm" />
                  ) : (
                    <button
                      onClick={handleDirectUpgrade}
                      disabled={isUpgradeLoading}
                      className={`${navLinkClass({ isActive: false })} cursor-pointer`}
                    >
                      {isUpgradeLoading ? 'Processing...' : 'Upgrade'}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </nav>
              
                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile navigation */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/medications" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={closeMobileMenu}
            >
              Medications
            </NavLink>
            <NavLink 
              to="/side-effects" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={closeMobileMenu}
            >
              Side Effects
            </NavLink>
            <NavLink 
              to="/daily-checkins" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={closeMobileMenu}
            >
              Daily Check-ins
            </NavLink>
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={closeMobileMenu}
            >
              Reports
            </NavLink>
            
            {subscriptionStatus?.hasActiveSubscription ? (
              <div className="px-3 py-2">
                <ManageSubscriptionButton className="w-full" />
              </div>
            ) : (
              <button 
                onClick={(e) => {
                  closeMobileMenu();
                  handleDirectUpgrade(e);
                }}
                disabled={isUpgradeLoading}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                {isUpgradeLoading ? 'Processing...' : 'Upgrade'}
              </button>
            )}
            
            <button 
              onClick={() => {
                handleSignOut();
                closeMobileMenu();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SideTrack
            </div>
            <a 
              href="https://www.zapt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="zapt-badge"
            >
              Made on ZAPT
            </a>
          </div>
        </div>
      </footer>
      
      {/* Currency selection modal */}
      <CurrencyModal 
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        onConfirm={handleCurrencyConfirm}
      />
    </div>
  );
}