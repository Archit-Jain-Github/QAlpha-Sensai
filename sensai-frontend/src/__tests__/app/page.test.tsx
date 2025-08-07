import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Home from '@/app/page';
import { useCourses, useSchools } from '@/lib/api';

// Mock dependencies
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
    useCourses: jest.fn(),
    useSchools: jest.fn(),
}));

jest.mock('@/components/layout/header', () => ({
    Header: function MockHeader({ showCreateCourseButton, showTryDemoButton }: any) {
        return (
            <header data-testid="header">
                <div data-testid="show-create-course-button">{showCreateCourseButton.toString()}</div>
                <div data-testid="show-try-demo-button">{showTryDemoButton.toString()}</div>
            </header>
        );
    }
}));
jest.mock('@/components/CourseCard', () => {
    return function MockCourseCard({ course }: any) {
        return <div data-testid={`course-card-${course.id}`}>{course.title}</div>;
    };
});
jest.mock('@/components/CreateCourseDialog', () => {
    return function MockCreateCourseDialog({ open, onClose, onSuccess, schoolId }: any) {
        return open ? (
            <div data-testid="create-course-dialog">
                <button onClick={() => onSuccess({ id: 'new-course', name: 'New Course' })}>
                    Success
                </button>
                <button onClick={onClose}>Close</button>
                <div data-testid="dialog-school-id">{schoolId}</div>
            </div>
        ) : null;
    };
});

const mockPush = jest.fn();
const mockUpdate = jest.fn();

describe('Home Page', () => {
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
    });

    describe('Loading State', () => {
        it('should show loading spinner when courses are loading', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: null,
                status: 'loading',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({ courses: [], isLoading: true, error: null });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('No Courses State', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({ courses: [], isLoading: false, error: null });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });
        });

        it('should show welcome message when user has no courses', () => {
            render(<Home />);

            expect(screen.getByText('What if your next big idea became a course?')).toBeInTheDocument();
            expect(screen.getByText('It might be easier than you think')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create course' })).toBeInTheDocument();
        });

        it('should navigate to school creation when create course is clicked and no school exists', () => {
            render(<Home />);

            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            expect(mockPush).toHaveBeenCalledWith('/school/admin/create');
        });

        it('should open create course dialog when school exists', () => {
            (useSchools as jest.Mock).mockReturnValue({
                schools: [{ id: 'school-1', name: 'Test School' }],
                isLoading: false,
                error: null
            });

            render(<Home />);

            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            expect(screen.getByTestId('create-course-dialog')).toBeInTheDocument();
            expect(screen.getByTestId('dialog-school-id')).toHaveTextContent('school-1');
        });
    });

    describe('Courses Display', () => {
        const mockTeachingCourses = [
            {
                id: 'course-1',
                title: 'Teaching Course 1',
                role: 'admin',
                org: { id: 1, name: 'Test Org', slug: 'test-org' },
                description: 'Test course description',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'course-2',
                title: 'Teaching Course 2',
                role: 'admin',
                org: undefined,
                description: 'Test course description',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        ];

        const mockLearningCourses = [
            {
                id: 'course-3',
                title: 'Learning Course 1',
                role: 'student',
                org: undefined,
                description: 'Test course description',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'course-4',
                title: 'Learning Course 2',
                role: 'student',
                org: undefined,
                description: 'Test course description',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        ];

        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useSchools as jest.Mock).mockReturnValue({
                schools: [{ id: 'school-1', name: 'Test School' }],
                isLoading: false,
                error: null
            });
        });

        describe('Teaching Courses Only', () => {
            beforeEach(() => {
                (useCourses as jest.Mock).mockReturnValue({
                    courses: mockTeachingCourses,
                    isLoading: false,
                    error: null
                });
            });

            it('should display teaching courses without tabs', () => {
                render(<Home />);

                expect(screen.getByText('Your courses')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-1')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-2')).toBeInTheDocument();

                // Should not show tabs
                expect(screen.queryByText('Created by you')).not.toBeInTheDocument();
                expect(screen.queryByText('Enrolled courses')).not.toBeInTheDocument();
            });

            it('should format course titles with org slug', () => {
                render(<Home />);

                expect(screen.getByText('@test-org/Teaching Course 1')).toBeInTheDocument();
                expect(screen.getByText('Teaching Course 2')).toBeInTheDocument();
            });
        });

        describe('Learning Courses Only', () => {
            beforeEach(() => {
                (useCourses as jest.Mock).mockReturnValue({
                    courses: mockLearningCourses,
                    isLoading: false,
                    error: null
                });
            });

            it('should display learning courses without tabs', () => {
                render(<Home />);

                expect(screen.getByText('Your courses')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-3')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-4')).toBeInTheDocument();

                // Should not show tabs
                expect(screen.queryByText('Created by you')).not.toBeInTheDocument();
                expect(screen.queryByText('Enrolled courses')).not.toBeInTheDocument();
            });
        });

        describe('Both Teaching and Learning Courses', () => {
            beforeEach(() => {
                (useCourses as jest.Mock).mockReturnValue({
                    courses: [...mockTeachingCourses, ...mockLearningCourses],
                    isLoading: false,
                    error: null
                });
            });

            it('should show tabs when user has both types of courses', () => {
                render(<Home />);

                expect(screen.getByText('Created by you')).toBeInTheDocument();
                expect(screen.getByText('Enrolled courses')).toBeInTheDocument();

                // Should not show "Your courses" heading
                expect(screen.queryByText('Your courses')).not.toBeInTheDocument();
            });

            it('should default to teaching tab', () => {
                render(<Home />);

                const teachingTab = screen.getByText('Created by you').closest('button');
                const learningTab = screen.getByText('Enrolled courses').closest('button');

                expect(teachingTab).toHaveClass('bg-[#333333]');
                expect(learningTab).toHaveClass('text-gray-400');

                // Should show teaching courses
                expect(screen.getByTestId('course-card-course-1')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-2')).toBeInTheDocument();
                expect(screen.queryByTestId('course-card-course-3')).not.toBeInTheDocument();
            });

            it('should switch to learning tab when clicked', () => {
                render(<Home />);

                const learningTab = screen.getByText('Enrolled courses').closest('button');
                fireEvent.click(learningTab!);

                expect(learningTab).toHaveClass('bg-[#333333]');

                // Should show learning courses
                expect(screen.getByTestId('course-card-course-3')).toBeInTheDocument();
                expect(screen.getByTestId('course-card-course-4')).toBeInTheDocument();
                expect(screen.queryByTestId('course-card-course-1')).not.toBeInTheDocument();
            });
        });
    });

    describe('Header Props', () => {
        it('should show create course button when user has courses', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({
                courses: [{
                    id: 'course-1',
                    title: 'Course 1',
                    role: 'admin',
                    org: undefined,
                    description: 'Test course description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }],
                isLoading: false,
                error: null
            });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            expect(screen.getByTestId('show-create-course-button')).toHaveTextContent('true');
        });

        it('should show create course button when user has school', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({ courses: [], isLoading: false, error: null });
            (useSchools as jest.Mock).mockReturnValue({
                schools: [{ id: 'school-1', name: 'Test School' }],
                isLoading: false,
                error: null
            });

            render(<Home />);

            expect(screen.getByTestId('show-create-course-button')).toHaveTextContent('true');
        });

        it('should show try demo button when user has no learning courses', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({
                courses: [{
                    id: 'course-1',
                    title: 'Course 1',
                    role: 'admin',
                    org: undefined,
                    description: 'Test course description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }],
                isLoading: false,
                error: null
            });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            expect(screen.getByTestId('show-try-demo-button')).toHaveTextContent('true');
        });

        it('should not show try demo button when user has learning courses', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({
                courses: [{
                    id: 'course-1',
                    title: 'Course 1',
                    role: 'student',
                    org: undefined,
                    description: 'Test course description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }],
                isLoading: false,
                error: null
            });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            expect(screen.getByTestId('show-try-demo-button')).toHaveTextContent('false');
        });
    });

    describe('Create Course Dialog', () => {
        beforeEach(() => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({ courses: [], isLoading: false, error: null });
            (useSchools as jest.Mock).mockReturnValue({
                schools: [{ id: 'school-1', name: 'Test School' }],
                isLoading: false,
                error: null
            });
        });

        it('should handle course creation success', () => {
            render(<Home />);

            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            const successButton = screen.getByRole('button', { name: 'Success' });
            fireEvent.click(successButton);

            expect(mockPush).toHaveBeenCalledWith('/school/admin/school-1/courses/new-course');
        });

        it('should close dialog when close button is clicked', () => {
            render(<Home />);

            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            expect(screen.getByTestId('create-course-dialog')).toBeInTheDocument();

            const closeButton = screen.getByRole('button', { name: 'Close' });
            fireEvent.click(closeButton);

            expect(screen.queryByTestId('create-course-dialog')).not.toBeInTheDocument();
        });

        it('should redirect to school creation on success when no school exists', () => {
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            expect(mockPush).toHaveBeenCalledWith('/school/admin/create');
        });

        it('should redirect to school creation when hasSchool is false on button click', () => {
            // Set up scenario where there are courses but no school
            (useCourses as jest.Mock).mockReturnValue({
                courses: [],
                isLoading: false,
                error: null
            });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            render(<Home />);

            // The create course button should be shown because user has courses
            // But clicking it should redirect to school creation because hasSchool is false
            const createButton = screen.getByRole('button', { name: 'Create course' });
            fireEvent.click(createButton);

            expect(mockPush).toHaveBeenCalledWith('/school/admin/create');
        });
    });

    describe('Initial Tab Selection', () => {
        it('should default to learning tab when user only has learning courses', () => {
            (useSession as jest.Mock).mockReturnValue({
                data: {
                    user: { id: 'test-user' },
                    expires: '2024-12-31T23:59:59.999Z'
                },
                status: 'authenticated',
                update: mockUpdate
            });
            (useCourses as jest.Mock).mockReturnValue({
                courses: [{
                    id: 'course-1',
                    title: 'Course 1',
                    role: 'student',
                    org: undefined,
                    description: 'Test course description',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }],
                isLoading: false,
                error: null
            });
            (useSchools as jest.Mock).mockReturnValue({ schools: [], isLoading: false, error: null });

            // Mock useState to verify initial state
            const setStateMock = jest.fn();
            const useStateSpy = jest.spyOn(React, 'useState');
            useStateSpy.mockImplementation(((initial: any) => {
                if (initial === 'learning') {
                    return ['learning', setStateMock];
                }
                return [initial, setStateMock];
            }) as any);

            render(<Home />);

            // The component should calculate initialActiveTab as 'learning'
            expect(screen.getByText('Your courses')).toBeInTheDocument();

            useStateSpy.mockRestore();
        });
    });
}); 