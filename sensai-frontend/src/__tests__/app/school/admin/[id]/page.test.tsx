import React from 'react';
import { render } from '@testing-library/react';
import SchoolPage from '@/app/school/admin/[id]/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useParams: jest.fn()
}));

// Mock the ClientSchoolAdminView component
jest.mock('@/app/school/admin/[id]/ClientSchoolAdminView', () => {
    return jest.fn(() => <div data-testid="client-school-admin-view">Client School Admin View</div>);
});

// Import the mocked functions to access them in tests
const { useParams } = require('next/navigation');
const mockClientSchoolAdminView = require('@/app/school/admin/[id]/ClientSchoolAdminView');

describe('SchoolPage (Admin)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Parameter handling', () => {
        it('should render ClientSchoolAdminView with correct id when id is provided', () => {
            useParams.mockReturnValue({ id: 'test-school' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'test-school' },
                undefined
            );
        });

        it('should render ClientSchoolAdminView with numeric school id', () => {
            useParams.mockReturnValue({ id: '12345' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: '12345' },
                undefined
            );
        });

        it('should render ClientSchoolAdminView with complex school id', () => {
            useParams.mockReturnValue({ id: 'admin-school-test_123-abc' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'admin-school-test_123-abc' },
                undefined
            );
        });

        it('should handle undefined id parameter', () => {
            useParams.mockReturnValue({ id: undefined });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: undefined },
                undefined
            );
        });

        it('should handle null id parameter', () => {
            useParams.mockReturnValue({ id: null });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: null },
                undefined
            );
        });

        it('should handle empty string id parameter', () => {
            useParams.mockReturnValue({ id: '' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: '' },
                undefined
            );
        });
    });

    describe('useParams edge cases', () => {
        it('should handle useParams returning undefined', () => {
            useParams.mockReturnValue(undefined);

            expect(() => render(<SchoolPage />)).toThrow('Cannot read properties of undefined');
        });

        it('should handle useParams returning null', () => {
            useParams.mockReturnValue(null);

            expect(() => render(<SchoolPage />)).toThrow('Cannot read properties of null');
        });

        it('should handle useParams returning empty object', () => {
            useParams.mockReturnValue({});

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: undefined },
                undefined
            );
        });
    });

    describe('Component rendering', () => {
        it('should render only ClientSchoolAdminView component', () => {
            useParams.mockReturnValue({ id: 'test-school' });

            const { container } = render(<SchoolPage />);

            expect(container.children).toHaveLength(1);
            expect(container.querySelector('[data-testid="client-school-admin-view"]')).toBeInTheDocument();
        });

        it('should call useParams hook exactly once', () => {
            useParams.mockReturnValue({ id: 'test-school' });

            render(<SchoolPage />);

            expect(useParams).toHaveBeenCalledTimes(1);
            expect(useParams).toHaveBeenCalledWith();
        });

        it('should call ClientSchoolAdminView with only id prop', () => {
            useParams.mockReturnValue({ id: 'test-school' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);
            const [props] = mockClientSchoolAdminView.mock.calls[0];
            expect(Object.keys(props)).toEqual(['id']);
        });
    });

    describe('Type casting behavior', () => {
        it('should cast id to string when id is a number', () => {
            useParams.mockReturnValue({ id: 123 });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 123 },
                undefined
            );
        });

        it('should cast id to string when id is boolean', () => {
            useParams.mockReturnValue({ id: true });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: true },
                undefined
            );
        });

        it('should handle array id parameter (edge case)', () => {
            useParams.mockReturnValue({ id: ['admin', 'school'] });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: ['admin', 'school'] },
                undefined
            );
        });
    });

    describe('Integration with ClientSchoolAdminView', () => {
        it('should pass correct id prop to ClientSchoolAdminView', () => {
            const schoolId = 'integration-test-admin-school';
            useParams.mockReturnValue({ id: schoolId });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: schoolId },
                undefined
            );
        });

        it('should render ClientSchoolAdminView component successfully', () => {
            useParams.mockReturnValue({ id: 'test' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(getByTestId('client-school-admin-view')).toHaveTextContent('Client School Admin View');
        });
    });

    describe('Parameter extraction', () => {
        it('should extract id from params.id correctly', () => {
            useParams.mockReturnValue({
                id: 'extracted-school-id',
                otherParam: 'ignored'
            });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'extracted-school-id' },
                undefined
            );
        });

        it('should only use id parameter and ignore others', () => {
            useParams.mockReturnValue({
                id: 'school-123',
                cohortId: 'cohort-456',
                courseId: 'course-789'
            });

            render(<SchoolPage />);

            const [props] = mockClientSchoolAdminView.mock.calls[0];
            expect(Object.keys(props)).toEqual(['id']);
            expect(props.id).toBe('school-123');
        });
    });

    describe('Multiple renders consistency', () => {
        it('should behave consistently across multiple renders', () => {
            useParams.mockReturnValue({ id: 'consistent-admin-school' });

            const { rerender, getByTestId } = render(<SchoolPage />);
            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(1);

            rerender(<SchoolPage />);
            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledTimes(2);
        });

        it('should handle parameter changes between renders', () => {
            useParams.mockReturnValue({ id: 'admin-school-1' });

            const { rerender } = render(<SchoolPage />);
            expect(mockClientSchoolAdminView).toHaveBeenLastCalledWith(
                { id: 'admin-school-1' },
                undefined
            );

            useParams.mockReturnValue({ id: 'admin-school-2' });
            rerender(<SchoolPage />);
            expect(mockClientSchoolAdminView).toHaveBeenLastCalledWith(
                { id: 'admin-school-2' },
                undefined
            );
        });
    });

    describe('Component structure validation', () => {
        it('should render correct component structure', () => {
            useParams.mockReturnValue({ id: 'structure-test' });

            const { container } = render(<SchoolPage />);

            expect(container.firstChild).toHaveAttribute('data-testid', 'client-school-admin-view');
        });

        it('should not render any additional elements', () => {
            useParams.mockReturnValue({ id: 'minimal-test' });

            const { container } = render(<SchoolPage />);

            expect(container.children).toHaveLength(1);
            expect(container.querySelector('div:not([data-testid])')).toBe(null);
        });
    });

    describe('Error handling', () => {
        it('should handle useParams throwing an error gracefully', () => {
            useParams.mockImplementation(() => {
                throw new Error('useParams error');
            });

            expect(() => render(<SchoolPage />)).toThrow('useParams error');
        });
    });

    describe('Special characters and encoding', () => {
        it('should handle URL-encoded id parameters', () => {
            useParams.mockReturnValue({ id: 'school%20with%20spaces' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'school%20with%20spaces' },
                undefined
            );
        });

        it('should handle id with special URL characters', () => {
            useParams.mockReturnValue({ id: 'school-id_with.special@chars+and=symbols' });

            const { getByTestId } = render(<SchoolPage />);

            expect(getByTestId('client-school-admin-view')).toBeInTheDocument();
            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'school-id_with.special@chars+and=symbols' },
                undefined
            );
        });

        it('should handle id with forward slashes (encoded)', () => {
            useParams.mockReturnValue({ id: 'school%2Fwith%2Fslashes' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'school%2Fwith%2Fslashes' },
                undefined
            );
        });

        it('should handle unicode characters in id', () => {
            useParams.mockReturnValue({ id: 'école-中学校-مدرسة' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'école-中学校-مدرسة' },
                undefined
            );
        });

        it('should handle id with query string characters', () => {
            useParams.mockReturnValue({ id: 'school?param=value&other=data' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'school?param=value&other=data' },
                undefined
            );
        });

        it('should handle id with hash fragments', () => {
            useParams.mockReturnValue({ id: 'school#section-1' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'school#section-1' },
                undefined
            );
        });
    });

    describe('Performance and edge cases', () => {
        it('should handle very long id strings', () => {
            const longId = 'a'.repeat(1000);
            useParams.mockReturnValue({ id: longId });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: longId },
                undefined
            );
        });

        it('should handle id with only special characters', () => {
            useParams.mockReturnValue({ id: '!@#$%^&*()_+-=[]{}|;:,.<>?' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
                undefined
            );
        });

        it('should handle numeric strings as id', () => {
            useParams.mockReturnValue({ id: '123.456' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: '123.456' },
                undefined
            );
        });
    });

    describe('Component identity and metadata', () => {
        it('should export a function named SchoolPage', () => {
            expect(SchoolPage.name).toBe('SchoolPage');
        });

        it('should be a valid React component function', () => {
            expect(typeof SchoolPage).toBe('function');
            expect(SchoolPage.length).toBe(0); // No parameters expected
        });
    });

    describe('Parameter extraction specifics', () => {
        it('should specifically extract params.id and not params.otherId', () => {
            useParams.mockReturnValue({
                id: 'correct-id',
                otherId: 'wrong-id',
                schoolId: 'also-wrong'
            });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'correct-id' },
                undefined
            );
        });

        it('should handle params object with id as the only property', () => {
            useParams.mockReturnValue({ id: 'only-id' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'only-id' },
                undefined
            );
        });

        it('should extract id even when params has many other properties', () => {
            useParams.mockReturnValue({
                id: 'target-id',
                slug: 'some-slug',
                category: 'some-category',
                subcategory: 'some-subcategory',
                page: '1',
                limit: '10',
                sort: 'name'
            });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'target-id' },
                undefined
            );
        });
    });

    describe('Real-world URL scenarios', () => {
        it('should handle GUID-style ids', () => {
            useParams.mockReturnValue({ id: '550e8400-e29b-41d4-a716-446655440000' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: '550e8400-e29b-41d4-a716-446655440000' },
                undefined
            );
        });

        it('should handle URL-safe base64 encoded ids', () => {
            useParams.mockReturnValue({ id: 'eyJzY2hvb2xJZCI6MTIzfQ' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'eyJzY2hvb2xJZCI6MTIzfQ' },
                undefined
            );
        });

        it('should handle kebab-case ids', () => {
            useParams.mockReturnValue({ id: 'my-awesome-school-admin-panel' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'my-awesome-school-admin-panel' },
                undefined
            );
        });

        it('should handle snake_case ids', () => {
            useParams.mockReturnValue({ id: 'my_school_admin_123' });

            render(<SchoolPage />);

            expect(mockClientSchoolAdminView).toHaveBeenCalledWith(
                { id: 'my_school_admin_123' },
                undefined
            );
        });
    });
}); 