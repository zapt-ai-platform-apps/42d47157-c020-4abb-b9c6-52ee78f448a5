import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Your Medication Journey, Simplified
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                SideTrack helps you monitor wellness, track medication effects, and share insights with your healthcare team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="btn-primary text-lg px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer inline-block text-center">
                  Get Started — Free
                </Link>
                <a href="#how-it-works" className="btn bg-white/20 hover:bg-white/30 text-white text-lg px-8 py-3 rounded-lg shadow-lg transition-all duration-300 cursor-pointer inline-block text-center backdrop-blur-sm">
                  Learn More
                </a>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <img src="https://images.unsplash.com/photo-1499933374294-4584851497cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NjQ4Nzh8MHwxfHNlYXJjaHw5fHxzbWFydHBob25lJTIwYXBwJTIwZm9yJTIwbWVkaWNhdGlvbiUyMHRyYWNraW5nJTIwaW4lMjBhJTIwcGVyc29uJTI3cyUyMGhhbmQlMkMlMjBicmlnaHQlMjBhbmQlMjBjaGVlcmZ1bCUyMGhvbWUlMjBlbnZpcm9ubWVudCUyQyUyMG5vdCUyMG1lZGljYWwlMkMlMjBubyUyMGhvc3BpdGFsJTIwc2V0dGluZ3N8ZW58MHx8fHwxNzQzNzEwMzA1fDA&ixlib=rb-4.0.3&q=80&w=1080" 
                 
                alt="SideTrack app interface on a smartphone with a person tracking their medication in a cozy home environment"
                data-image-request="smartphone app for medication tracking in a person's hand, bright and cheerful home environment, not medical, no hospital settings"
                className="rounded-2xl shadow-2xl max-w-full h-auto transform transition-all hover:scale-[1.02] duration-500 ease-in-out"
                style={{maxHeight: "500px", objectFit: "cover"}}
              />
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="white" className="w-full">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,75C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 mb-3">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Tools for Your Wellbeing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed with you in mind - intuitive features that help you stay on top of your health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl w-14 h-14 flex items-center justify-center mb-5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Medication Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Keep all your medications organized in one place with simple tracking tools.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl w-14 h-14 flex items-center justify-center mb-5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Wellness Journal</h3>
              <p className="text-gray-600 leading-relaxed">Record how you're feeling with a friendly interface that makes checking in easy.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl w-14 h-14 flex items-center justify-center mb-5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Daily Check-ins</h3>
              <p className="text-gray-600 leading-relaxed">Quick mood and energy level tracking helps spot patterns and improve your wellbeing.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl w-14 h-14 flex items-center justify-center mb-5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Reports</h3>
              <p className="text-gray-600 leading-relaxed">Create clear summaries to share with your healthcare team for more informed conversations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 mb-3">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SideTrack is designed to be intuitive and easy to use, so you can focus on what matters most - your health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Sign Up & Add Medications</h3>
              <p className="text-gray-600 text-center leading-relaxed">Create your free account and easily add your medications with a few simple taps.</p>
              <div className="mt-6 text-center">
                <img src="https://images.unsplash.com/photo-1485163819542-13adeb5e0068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NjQ4Nzh8MHwxfHNlYXJjaHwxMHx8cGVyc29uJTIwYWRkaW5nJTIwbWVkaWNhdGlvbiUyMHRvJTIwYSUyMG1vYmlsZSUyMGFwcCUyQyUyMHNpbXBsZSUyMGFuZCUyMGNsZWFuJTIwaW50ZXJmYWNlJTJDJTIwYnJpZ2h0JTIwY29sb3JzfGVufDB8fHx8MTc0MzcxMDMwNXww&ixlib=rb-4.0.3&q=80&w=1080" 
                   
                  alt="Adding medication to SideTrack"
                  data-image-request="person adding medication to a mobile app, simple and clean interface, bright colors"
                  className="h-40 mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Track Your Well-being</h3>
              <p className="text-gray-600 text-center leading-relaxed">Log how you're feeling each day with quick check-ins that take just seconds.</p>
              <div className="mt-6 text-center">
                <img src="https://images.unsplash.com/photo-1515511856280-7b23f68d2996?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NjQ4Nzh8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBsb2dnaW5nJTIwbW9vZCUyMGluJTIwYSUyMG1vYmlsZSUyMGFwcCUyQyUyMHNtaWxpbmclMkMlMjBsaXZpbmclMjByb29tJTIwc2V0dGluZ3xlbnwwfHx8fDE3NDM3MTAzMDZ8MA&ixlib=rb-4.0.3&q=80&w=1080" 
                   
                  alt="Tracking daily well-being in SideTrack"
                  data-image-request="person logging mood in a mobile app, smiling, living room setting"
                  className="h-40 mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Share Insights</h3>
              <p className="text-gray-600 text-center leading-relaxed">Generate easy-to-read reports that help your healthcare provider understand your experience.</p>
              <div className="mt-6 text-center">
                <img src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NjQ4Nzh8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBzaG93aW5nJTIwYSUyMGhlYWx0aCUyMHJlcG9ydCUyMHRvJTIwYSUyMGRvY3RvciUyMG9uJTIwYSUyMHRhYmxldCUyQyUyMGZyaWVuZGx5JTIwY29uc3VsdGF0aW9uJTJDJTIwYnJpZ2h0JTIwb2ZmaWNlfGVufDB8fHx8MTc0MzcxMDMwNnww&ixlib=rb-4.0.3&q=80&w=1080" 
                   
                  alt="Sharing a SideTrack report with doctor"
                  data-image-request="person showing a health report to a doctor on a tablet, friendly consultation, bright office"
                  className="h-40 mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 mb-3">Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Our Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from real people who use SideTrack to improve their health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Sarah M.</h4>
                  <p className="text-indigo-600 text-sm">Managing Multiple Medications</p>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">"SideTrack has made it so much easier to talk with my doctor about how I'm actually feeling. The reports show patterns I wouldn't have noticed otherwise."</p>
              <div className="mt-4 flex">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold">JT</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">James T.</h4>
                  <p className="text-indigo-600 text-sm">Chronic Condition Patient</p>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">"I love how simple SideTrack makes everything. I can quickly log how I'm feeling without getting overwhelmed by complicated screens or medical jargon."</p>
              <div className="mt-4 flex">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold">EL</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Emma L.</h4>
                  <p className="text-indigo-600 text-sm">New Medication User</p>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">"Starting a new medication was intimidating, but SideTrack helped me keep track of how I was feeling each day, which made me feel more in control of my health."</p>
              <div className="mt-4 flex">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take Control of Your Health Journey?</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of people who are using SideTrack to better understand their health and collaborate with their care providers.
            </p>
            <Link to="/login" className="btn bg-white text-indigo-600 hover:bg-gray-100 text-lg px-10 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer inline-block font-semibold">
              Start Your Free Journal
            </Link>
            <p className="mt-6 text-white/80 text-sm">No credit card required. Free forever.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=40&height=40" 
                  alt="SideTrack Logo"
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-semibold">SideTrack</span>
              </div>
              <p className="text-gray-400">Your compassionate companion for medication tracking and wellness journaling.</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Medication Tracking</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Wellness Journaling</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Daily Check-ins</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Doctor Reports</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} SideTrack. All rights reserved.</p>
            <a 
              href="https://www.zapt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white mt-4 md:mt-0"
            >
              Made on ZAPT
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}