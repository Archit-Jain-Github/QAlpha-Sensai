import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SchoolPickerDialog from '../../components/SchoolPickerDialog';

describe('SchoolPickerDialog Component', () => {
    // Mock props
    const mockSchools = [
        {
            id: 'school-1',
            name: 'Test School 1',
            role: 'owner',
            slug: 'test-school-1'
        },
        {
            id: 'school-2',
            name: 'Test School 2',
            role: 'admin',
            slug: 'test-school-2'
        },
        {
            id: 'school-3',
            name: 'Test School 3',
            role: 'member',
            slug: 'test-school-3'
        }
    ];

    const mockOnClose = jest.fn();
    const mockOnSelectSchool = jest.fn();
    const mockOnCreateSchool = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render anything when open is false', () => {
        const { container } = render(
            <SchoolPickerDialog
                open={false}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('should render the dialog when open is true', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.getByText('Select a School')).toBeInTheDocument();
    });

    it('should render all schools in the list', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.getByText('Test School 1')).toBeInTheDocument();
        expect(screen.getByText('Test School 2')).toBeInTheDocument();
        expect(screen.getByText('Test School 3')).toBeInTheDocument();
    });

    it('should display owner badge for schools where role is owner', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.getByText('Owner')).toBeInTheDocument();
    });

    it('should display admin badge for schools where role is admin', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should not show Create School button when user owns a school', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.queryByText('Create a School')).not.toBeInTheDocument();
    });

    it('should show Create School button when user does not own any schools', () => {
        const noOwnerSchools = [
            {
                id: 'school-2',
                name: 'Test School 2',
                role: 'admin',
                slug: 'test-school-2'
            },
            {
                id: 'school-3',
                name: 'Test School 3',
                role: 'member',
                slug: 'test-school-3'
            }
        ];

        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={noOwnerSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        expect(screen.getByText('Create a School')).toBeInTheDocument();
    });

    it('should call onClose when X button is clicked', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        // Instead of looking for button by role and name, find the close button 
        // by looking for a button element that's a sibling of the heading
        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectSchool with school ID when a school is clicked', () => {
        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={mockSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        fireEvent.click(screen.getByText('Test School 1'));
        expect(mockOnSelectSchool).toHaveBeenCalledTimes(1);
        expect(mockOnSelectSchool).toHaveBeenCalledWith('school-1');
    });

    it('should call onCreateSchool when Create School button is clicked', () => {
        const noOwnerSchools = [
            {
                id: 'school-2',
                name: 'Test School 2',
                role: 'admin',
                slug: 'test-school-2'
            }
        ];

        render(
            <SchoolPickerDialog
                open={true}
                onClose={mockOnClose}
                schools={noOwnerSchools}
                onSelectSchool={mockOnSelectSchool}
                onCreateSchool={mockOnCreateSchool}
            />
        );

        fireEvent.click(screen.getByText('Create a School'));
        expect(mockOnCreateSchool).toHaveBeenCalledTimes(1);
    });
}); 