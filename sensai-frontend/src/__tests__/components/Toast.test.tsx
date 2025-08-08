import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from '../../components/Toast';
import React from 'react';

// Mocking Lucide icons
jest.mock('lucide-react', () => ({
    X: () => <div data-testid="x-icon" />
}));

describe('Toast Component', () => {
    // Test data
    const mockProps = {
        show: true,
        title: 'Test Toast',
        description: 'This is a test toast message',
        emoji: '🔔',
        onClose: jest.fn()
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('should not render when show is false', () => {
        const { container } = render(
            <Toast
                show={false}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should render when show is true', () => {
        render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        expect(screen.getByText(mockProps.title)).toBeInTheDocument();
        expect(screen.getByText(mockProps.description)).toBeInTheDocument();
        expect(screen.getByText(mockProps.emoji)).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        // Find and click the close button
        const closeButton = screen.getByTestId('x-icon').closest('button');
        fireEvent.click(closeButton!);

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should have desktop styling by default', () => {
        const { container } = render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        // Get the main toast container (the fixed div, not the flex item)
        const toastContainer = container.firstChild as HTMLElement;

        // Desktop-specific classes
        expect(toastContainer).toHaveClass('bottom-4');
        expect(toastContainer).toHaveClass('right-4');
        expect(toastContainer).toHaveClass('rounded-lg');
        expect(toastContainer).toHaveClass('max-w-md');

        // Should not have mobile-specific classes
        expect(toastContainer).not.toHaveClass('top-0');
        expect(toastContainer).not.toHaveClass('left-0');
        expect(toastContainer).not.toHaveClass('right-0');
        expect(toastContainer).not.toHaveClass('w-full');
        expect(toastContainer).not.toHaveClass('rounded-none');
    });

    it('should have mobile styling when isMobileView is true', () => {
        const { container } = render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
                isMobileView={true}
            />
        );

        // Get the main toast container (the fixed div, not the flex item)
        const toastContainer = container.firstChild as HTMLElement;

        // Mobile-specific classes
        expect(toastContainer).toHaveClass('top-0');
        expect(toastContainer).toHaveClass('left-0');
        expect(toastContainer).toHaveClass('right-0');
        expect(toastContainer).toHaveClass('w-full');
        expect(toastContainer).toHaveClass('rounded-none');

        // Should not have desktop-specific classes
        expect(toastContainer).not.toHaveClass('bottom-4');
        expect(toastContainer).not.toHaveClass('right-4');
        expect(toastContainer).not.toHaveClass('rounded-lg');
        expect(toastContainer).not.toHaveClass('max-w-md');
    });

    it('should render emoji in a rounded container', () => {
        render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        const emojiContainer = screen.getByText(mockProps.emoji).closest('div');

        expect(emojiContainer).toHaveClass('w-10');
        expect(emojiContainer).toHaveClass('h-10');
        expect(emojiContainer).toHaveClass('bg-amber-50');
        expect(emojiContainer).toHaveClass('rounded-full');
    });

    it('should have common styles regardless of view mode', () => {
        const { container } = render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        // Get the main toast container (the fixed div, not the flex item)
        const toastContainer = container.firstChild as HTMLElement;

        // Common styles
        expect(toastContainer).toHaveClass('bg-white');
        expect(toastContainer).toHaveClass('text-black');
        expect(toastContainer).toHaveClass('px-6');
        expect(toastContainer).toHaveClass('py-4');
        expect(toastContainer).toHaveClass('shadow-lg');
        expect(toastContainer).toHaveClass('z-100');
        expect(toastContainer).toHaveClass('flex');
        expect(toastContainer).toHaveClass('items-center');
        expect(toastContainer).toHaveClass('gap-4');
    });

    it('should style title and description appropriately', () => {
        render(
            <Toast
                show={true}
                title={mockProps.title}
                description={mockProps.description}
                emoji={mockProps.emoji}
                onClose={mockProps.onClose}
            />
        );

        // Title should have appropriate styling
        const title = screen.getByText(mockProps.title);
        expect(title).toHaveClass('font-medium');
        expect(title).toHaveClass('text-base');

        // Description should have appropriate styling
        const description = screen.getByText(mockProps.description);
        expect(description).toHaveClass('text-sm');
        expect(description).toHaveClass('text-gray-600');
        expect(description).toHaveClass('mt-0.5');
        expect(description).toHaveClass('leading-tight');
    });
}); 