'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Briefcase, FileText } from 'lucide-react';

export default function AppHomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect to jobs page automatically after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/app/home/jobs');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gradient-ms mb-4">
          Welcome to ADA4Career!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Hello {user?.email || 'User'}! 👋
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to the jobs dashboard...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/app/home/jobs')}>
          <CardHeader className="text-center">
            <Briefcase className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <CardTitle className="text-lg">Find Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Discover job opportunities that match your skills
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/app/cv-builder')}>
          <CardHeader className="text-center">
            <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-lg">Web3 CV Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Create your blockchain-verified CV
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/app/home/career-tree')}>
          <CardHeader className="text-center">
            <User className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <CardTitle className="text-lg">Career Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Plan your career development path
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
        <span className="text-sm text-gray-500">Preparing your dashboard...</span>
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={() => router.push('/app/home/jobs')}>
          Go to Jobs Dashboard
        </Button>
      </div>
    </div>
  );
}