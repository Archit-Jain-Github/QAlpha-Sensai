import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseCohortSelectionDialog } from '../../components/CourseCohortSelectionDialog';

// Mock the CreateCohortDialog component
jest.mock('../../components/CreateCohortDialog', () => {
    return function MockCreateCohortDialog() {
        return <div data-testid="create-cohort-dialog">Create Cohort Dialog Mock</div>;
    };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode, href: string }) {
        return <a href={href}>{children}</a>;
    };
});

describe('CourseCohortSelectionDialog Component', () => {
    // Common props for testing
    const mockCohorts = [
        { id: 1, name: 'Cohort 1' },
        { id: 2, name: 'Cohort 2' },
        { id: 3, name: 'Cohort 3' }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        originButtonRef: { current: document.createElement('button') },
        isPublishing: false,
        onConfirm: jest.fn(),
        showLoading: false,
        hasError: false,
        errorMessage: '',
        onRetry: jest.fn(),
        cohorts: mockCohorts,
        selectedCohort: null,
        onSelectCohort: jest.fn(),
        onSearchChange: jest.fn(),
        searchQuery: '',
        filteredCohorts: mockCohorts,
        totalSchoolCohorts: 3,
        schoolId: 'school1',
        onOpenCreateCohortDialog: jest.fn(),
        onAutoCreateAndPublish: jest.fn(),
        onDripConfigChange: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(
            <CourseCohortSelectionDialog {...defaultProps} />
        );

        // Check if the dialog is rendered
        expect(screen.getByPlaceholderText('Search for a cohort')).toBeInTheDocument();

        // Check if cohorts are displayed
        expect(screen.getByText('Cohort 1')).toBeInTheDocument();
        expect(screen.getByText('Cohort 2')).toBeInTheDocument();
        expect(screen.getByText('Cohort 3')).toBeInTheDocument();

        // Check if buttons are rendered
        expect(screen.getByText('Add course to selected cohort')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<CourseCohortSelectionDialog {...defaultProps} isOpen={false} />);

        // Dialog should not be rendered
        expect(screen.queryByPlaceholderText('Search for a cohort')).not.toBeInTheDocument();
    });

    it('displays loading state correctly', () => {
        render(<CourseCohortSelectionDialog {...defaultProps} showLoading={true} />);

        // Loading spinner should be visible - look for the div with spinner classes
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

        // Search box should not be visible when loading
        expect(screen.queryByPlaceholderText('Search for a cohort')).not.toBeInTheDocument();
    });

    it('displays error state correctly', () => {
        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                hasError={true}
                errorMessage="An error occurred"
            />
        );

        // Error message should be visible
        expect(screen.getByText('An error occurred')).toBeInTheDocument();

        // Retry button should be visible
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it('calls onSelectCohort when a cohort is clicked', () => {
        render(<CourseCohortSelectionDialog {...defaultProps} />);

        // Click on the first cohort
        fireEvent.click(screen.getByText('Cohort 1'));

        // onSelectCohort should be called with the cohort
        expect(defaultProps.onSelectCohort).toHaveBeenCalledWith(mockCohorts[0]);
    });

    it('displays selected cohorts correctly', () => {
        const selectedCohort = { id: 1, name: 'Cohort 1' };

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                selectedCohort={selectedCohort}
            />
        );

        // Selected cohort should have a check mark
        const selectedCohortElement = screen.getByText('Cohort 1');
        expect(selectedCohortElement).toBeInTheDocument();

        // Check mark should be present next to selected cohort
        const checkIcon = selectedCohortElement.parentElement?.querySelector('div[class*="bg-green-600"]');
        expect(checkIcon).toBeInTheDocument();
    });

    it('calls onRemoveCohort when remove button is clicked', () => {
        const selectedCohort = { id: 1, name: 'Cohort 1' };

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                selectedCohort={selectedCohort}
            />
        );

        // Find and click the selected cohort to deselect it
        const selectedCohortElement = screen.getByText('Cohort 1');
        fireEvent.click(selectedCohortElement);

        // onSelectCohort should be called with null to deselect
        expect(defaultProps.onSelectCohort).toHaveBeenCalledWith(null);
    });

    it('calls onSearchChange when search input changes', () => {
        render(
            <CourseCohortSelectionDialog {...defaultProps} />
        );

        // Change the search input
        const searchInput = screen.getByPlaceholderText('Search for a cohort');
        fireEvent.change(searchInput, { target: { value: 'Cohort 1' } });

        // onSearchChange should be called
        expect(defaultProps.onSearchChange).toHaveBeenCalled();
    });

    it('filters cohorts based on searchQuery', () => {
        const filteredCohorts = [mockCohorts[0]]; // Only Cohort 1 matches the search

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                searchQuery="Cohort 1"
                filteredCohorts={filteredCohorts}
            />
        );

        // Cohort 1 should be visible
        expect(screen.getByText('Cohort 1')).toBeInTheDocument();

        // Cohort 2 and 3 should not be visible
        expect(screen.queryByText('Cohort 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Cohort 3')).not.toBeInTheDocument();
    });

    it('calls onConfirm when the confirm button is clicked', () => {
        const selectedCohort = { id: 1, name: 'Cohort 1' };

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                selectedCohort={selectedCohort}
            />
        );

        // Find and click the confirm button
        const confirmButton = screen.getByText('Add course to selected cohort');
        fireEvent.click(confirmButton);

        // onConfirm should be called
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('shows different button text when publishing', () => {
        const selectedCohort = { id: 1, name: 'Cohort 1' };

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                isPublishing={true}
                selectedCohort={selectedCohort}
            />
        );

        // Button text should indicate publishing
        expect(screen.getByText('Publish course to selected cohort')).toBeInTheDocument();
    });

    it('shows loading state when action is in progress', () => {
        const { unmount } = render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                showLoading={true}
            />
        );

        // Loading spinner should be shown
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

        // Clean up and test for publishing
        unmount();

        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                showLoading={true}
                isPublishing={true}
            />
        );

        // Loading spinner should still be shown for publishing
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('calls onOpenCreateCohortDialog when "Create New Cohort" is clicked', () => {
        render(
            <CourseCohortSelectionDialog
                {...defaultProps}
                totalSchoolCohorts={0}
                cohorts={[]}
                filteredCohorts={[]}
            />
        );

        // Find and click the "Create New Cohort" button
        const createButton = screen.getByText('Create cohort');
        fireEvent.click(createButton);

        // onOpenCreateCohortDialog should be called
        expect(defaultProps.onOpenCreateCohortDialog).toHaveBeenCalled();
    });
}); 