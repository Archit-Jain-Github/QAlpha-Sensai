import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/login/page';

// Mock dependencies
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
    useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }: any) {
        return <img src={src} alt={alt} {...props} />;
    };
});
jest.mock('next/link', () => {
    return function MockLink({ href, children, ...props }: any) {
        return <a href={href} {...props}>{children}</a>;
    };
});

const mockPush = jest.fn();

describe('Login Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock hooks
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            prefetch: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        });

        // Mock URLSearchParams
        const mockSearchParams = {
            get: jest.fn((key: string) => {
                if (key === 'callbackUrl') return null;
                return null;
            }),
        };
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    });

    describe('Loading State', () => {
        it('should show loading spinner when session is loading', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'loading',
                update: jest.fn(),
            });

            render(<LoginPage />);

            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('Unauthenticated State', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn(),
            });
        });

        it('should render login form with branding', () => {
            render(<LoginPage />);

            expect(screen.getByText('Teach')).toBeInTheDocument();
            expect(screen.getByText('smarter')).toBeInTheDocument();
            expect(screen.getByText('Reach')).toBeInTheDocument();
            expect(screen.getByText('further')).toBeInTheDocument();
            expect(screen.getByAltText('SensAI Logo')).toBeInTheDocument();
        });

        it('should display product description', () => {
            render(<LoginPage />);

            expect(screen.getByText(/SensAI is an AI-powered LMS/)).toBeInTheDocument();
        });

        it('should show Google login button', () => {
            render(<LoginPage />);

            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            expect(loginButton).toBeInTheDocument();
        });

        it('should call signIn when Google login button is clicked', () => {
            render(<LoginPage />);

            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            fireEvent.click(loginButton);

            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
        });

        it('should use callback URL from search params', () => {
            const mockSearchParams = {
                get: jest.fn((key: string) => {
                    if (key === 'callbackUrl') return '/dashboard';
                    return null;
                }),
            };
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            render(<LoginPage />);

            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            fireEvent.click(loginButton);

            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
        });

        it('should display terms and privacy policy links', () => {
            render(<LoginPage />);

            const termsLink = screen.getByRole('link', { name: /Terms & Conditions/i });
            const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });

            expect(termsLink).toBeInTheDocument();
            expect(privacyLink).toBeInTheDocument();
            expect(termsLink).toHaveAttribute('href', expect.stringContaining('notion.site'));
            expect(privacyLink).toHaveAttribute('href', expect.stringContaining('notion.site'));
        });

        it('should have proper styling classes', () => {
            render(<LoginPage />);

            // Check main container has dark background
            const mainContainer = document.querySelector('.min-h-screen.bg-black');
            expect(mainContainer).toBeInTheDocument();

            // Check login button styling
            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            expect(loginButton).toHaveClass('bg-white', 'text-black', 'rounded-full');
        });
    });

    describe('Authenticated State', () => {
        it('should redirect to callback URL when user is authenticated', async () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user', name: 'Test User', email: 'test@example.com' },
                    expires: '2024-12-31T23:59:59.999Z',
                },
                status: 'authenticated',
                update: jest.fn(),
            });

            render(<LoginPage />);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });

        it('should redirect to custom callback URL when provided', async () => {
            const mockSearchParams = {
                get: jest.fn((key: string) => {
                    if (key === 'callbackUrl') return '/custom-redirect';
                    return null;
                }),
            };
            (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user', name: 'Test User', email: 'test@example.com' },
                    expires: '2024-12-31T23:59:59.999Z',
                },
                status: 'authenticated',
                update: jest.fn(),
            });

            render(<LoginPage />);

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/custom-redirect');
            });
        });
    });

    describe('Google SVG Icon', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn(),
            });
        });

        it('should render Google icon with correct colors', () => {
            render(<LoginPage />);

            const googleIcon = document.querySelector('svg');
            expect(googleIcon).toBeInTheDocument();

            // Check for Google brand colors in the SVG paths
            const bluePath = document.querySelector('path[fill="#4285F4"]');
            const greenPath = document.querySelector('path[fill="#34A853"]');
            const yellowPath = document.querySelector('path[fill="#FBBC05"]');
            const redPath = document.querySelector('path[fill="#EA4335"]');

            expect(bluePath).toBeInTheDocument();
            expect(greenPath).toBeInTheDocument();
            expect(yellowPath).toBeInTheDocument();
            expect(redPath).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn(),
            });
        });

        it('should have responsive grid layout classes', () => {
            render(<LoginPage />);

            const gridContainer = document.querySelector('.md\\:grid.md\\:grid-cols-12');
            expect(gridContainer).toBeInTheDocument();
        });

        it('should have responsive text sizing', () => {
            render(<LoginPage />);

            const heading = screen.getByText('Teach').closest('h1');
            expect(heading).toHaveClass('text-4xl', 'md:text-5xl');
        });

        it('should have responsive image sizing', () => {
            render(<LoginPage />);

            const logo = screen.getByAltText('SensAI Logo');
            expect(logo).toHaveClass('w-[180px]', 'md:w-[240px]');
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'unauthenticated',
                update: jest.fn(),
            });
        });

        it('should have proper alt text for logo', () => {
            render(<LoginPage />);

            const logo = screen.getByAltText('SensAI Logo');
            expect(logo).toBeInTheDocument();
        });

        it('should have proper button role and accessible text', () => {
            render(<LoginPage />);

            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            expect(loginButton).toBeInTheDocument();
        });

        it('should have proper link roles for terms and privacy', () => {
            render(<LoginPage />);

            const termsLink = screen.getByRole('link', { name: /Terms & Conditions/i });
            const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });

            expect(termsLink).toBeInTheDocument();
            expect(privacyLink).toBeInTheDocument();
        });

        it('should have focus and hover states', () => {
            render(<LoginPage />);

            const loginButton = screen.getByRole('button', { name: /Sign in with Google/i });
            expect(loginButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'hover:bg-gray-100');
        });
    });
}); 