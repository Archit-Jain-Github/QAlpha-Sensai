"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff } from 'lucide-react';

export default function UnauthorizedError() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center justify-center max-w-md text-center">
                <div data-testid="error-icon" className="flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-6">
                    <EyeOff size={32} className="text-purple-400" />
                </div>
                <h1 className="text-3xl font-light mb-4">Peeking where you should not</h1>
                <p className="text-gray-400 mb-8">
                    Looks like you've stumbled into the secret clubhouse reserved only for school admins
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-white text-black text-sm font-medium rounded-full hover:opacity-90 transition-opacity inline-block cursor-pointer"
                >
                    Back to Safety
                </button>
            </div>
        </div>
    );
} 