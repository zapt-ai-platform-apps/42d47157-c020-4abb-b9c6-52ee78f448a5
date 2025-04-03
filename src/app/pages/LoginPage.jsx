import React from 'react';
import { AuthForm } from '@/modules/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-20 w-auto"
          src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=100&height=100"
          alt="SideTrack Logo"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SideTrack
        </h2>
        <p className="mt-2 text-center text-gray-600">
          Track medication side effects and create doctor-ready reports
        </p>
      </div>

      <AuthForm />
    </div>
  );
}