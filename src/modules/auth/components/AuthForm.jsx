import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/supabaseClient';

export default function AuthForm() {
  return (
    <div className="w-full max-w-md p-6 mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Sign in with ZAPT</h2>
        <p className="text-sm text-gray-500">
          <a 
            href="https://www.zapt.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Learn more about ZAPT
          </a>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4f46e5',
                  brandAccent: '#6366f1',
                }
              }
            }
          }}
          providers={['google', 'facebook', 'apple']}
          magicLink={true}
          view="magic_link"
        />
      </div>
    </div>
  );
}