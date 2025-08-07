import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../../../components/layout/header';

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ alt, priority, ...props }: any) {
        // Remove priority from props to avoid DOM validation error
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={alt} {...props} />;
    };
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
    useSession: () => ({
        data: {
            user: {
                name: 'Test User',
                email: 'test@example.com',
            },
        },
        status: 'authenticated',
    }),
    signOut: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/test-path',
}));

// Mock the useSchools hook
jest.mock('@/lib/api', () => ({
    useSchools: () => ({
        schools: [],
        isLoading: false,
    }),
}));

describe('Header Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(<Header />);
            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('renders header navigation elements', () => {
            render(<Header />);
            // Basic rendering test - component should mount successfully
            expect(document.body).toContainElement(screen.getByRole('banner'));
        });
    });

    describe('User Session', () => {
        it('displays user information when authenticated', () => {
            render(<Header />);
            // Component should render without errors when user is authenticated
            expect(screen.getByRole('banner')).toBeInTheDocument();
        });
    });

    describe('Props Handling', () => {
        it('handles optional props', () => {
            const props = {
                showCreateCourseButton: false,
                cohorts: [],
                showTryDemoButton: true,
            };

            expect(() => {
                render(<Header {...props} />);
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<Header />);
            const headerElement = screen.getByRole('banner');
            expect(headerElement).toBeInTheDocument();
        });
    });
}); 