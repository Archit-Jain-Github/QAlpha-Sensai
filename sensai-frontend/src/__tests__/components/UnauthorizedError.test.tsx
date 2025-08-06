import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnauthorizedError from '../../components/UnauthorizedError';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('UnauthorizedError Component', () => {
    it('should render the error message and button', () => {
        render(<UnauthorizedError />);

        expect(screen.getByText('Peeking where you should not')).toBeInTheDocument();
        expect(screen.getByText('Looks like you\'ve stumbled into the secret clubhouse reserved only for school admins')).toBeInTheDocument();
        expect(screen.getByText('Back to Safety')).toBeInTheDocument();
    });

    it('should call router.push when button is clicked', () => {
        // Create a mock for router.push
        const pushMock = jest.fn();

        // Override the useRouter mock for this test
        jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
            push: pushMock,
        }));

        render(<UnauthorizedError />);

        // Click the button
        fireEvent.click(screen.getByText('Back to Safety'));

        // Verify that router.push was called with correct path
        expect(pushMock).toHaveBeenCalledWith('/');

        // Clean up the mock
        jest.restoreAllMocks();
    });

    it('should render the EyeOff icon', () => {
        render(<UnauthorizedError />);

        // Find the icon container using a more reliable selector
        const iconContainer = screen.getByTestId('error-icon') || screen.getByRole('img', { hidden: true });

        // Assert that there is an element with the correct classes
        expect(document.querySelector('.bg-purple-600\\/20.rounded-full')).toBeInTheDocument();
    });

    it('should have correct styling for error container', () => {
        render(<UnauthorizedError />);

        // Get the main container
        const mainContainer = screen.getByText('Peeking where you should not')
            .closest('div')
            ?.parentElement;

        expect(mainContainer).toHaveClass('min-h-screen');
        expect(mainContainer).toHaveClass('bg-black');
        expect(mainContainer).toHaveClass('text-white');
        expect(mainContainer).toHaveClass('flex');
    });
}); 