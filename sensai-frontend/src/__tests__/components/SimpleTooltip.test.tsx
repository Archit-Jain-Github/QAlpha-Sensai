import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimpleTooltip from '../../components/SimpleTooltip';
import React from 'react';

describe('SimpleTooltip Component', () => {
    const mockText = 'Tooltip text';
    const childText = 'Hover me';

    it('should render the children correctly', () => {
        render(
            <SimpleTooltip text={mockText}>
                <span>{childText}</span>
            </SimpleTooltip>
        );

        expect(screen.getByText(childText)).toBeInTheDocument();
        // Tooltip should not be visible initially
        expect(screen.queryByText(mockText)).not.toBeInTheDocument();
    });

    it('should show the tooltip on mouse enter and hide on mouse leave', () => {
        render(
            <SimpleTooltip text={mockText}>
                <span>{childText}</span>
            </SimpleTooltip>
        );

        // Get the container that has the mouse events
        const container = screen.getByText(childText).closest('div');

        // Initially tooltip should not be visible
        expect(screen.queryByText(mockText)).not.toBeInTheDocument();

        // Simulate mouse enter
        fireEvent.mouseEnter(container!);

        // Tooltip should now be visible
        expect(screen.getByText(mockText)).toBeInTheDocument();

        // Simulate mouse leave
        fireEvent.mouseLeave(container!);

        // Tooltip should be hidden again
        expect(screen.queryByText(mockText)).not.toBeInTheDocument();
    });

    it('should position the tooltip above the target element', () => {
        render(
            <SimpleTooltip text={mockText}>
                <span>{childText}</span>
            </SimpleTooltip>
        );

        // Simulate mouse enter to show the tooltip
        const container = screen.getByText(childText).closest('div');
        fireEvent.mouseEnter(container!);

        // Tooltip should be visible
        const tooltip = screen.getByText(mockText);

        // Check positioning classes
        const tooltipContainer = tooltip.closest('div');
        expect(tooltipContainer).toHaveClass('absolute');
        expect(tooltipContainer).toHaveClass('bottom-full');
        expect(tooltipContainer).toHaveClass('left-1/2');
        expect(tooltipContainer).toHaveClass('transform');
        expect(tooltipContainer).toHaveClass('-translate-x-1/2');
        expect(tooltipContainer).toHaveClass('mb-2');
    });

    it('should handle empty tooltip text', () => {
        const emptyTooltipText = '';
        render(
            <SimpleTooltip text={emptyTooltipText}>
                <span>{childText}</span>
            </SimpleTooltip>
        );

        // Show tooltip
        const container = screen.getByText(childText).closest('div');
        fireEvent.mouseEnter(container!);

        // Empty tooltip should still be rendered - check for the tooltip container by class
        const tooltipContainer = container?.parentElement?.querySelector('.absolute.bottom-full');
        expect(tooltipContainer).toBeTruthy();
    });

    it('should handle complex children', () => {
        render(
            <SimpleTooltip text={mockText}>
                <div>
                    <span>{childText}</span>
                    <button>Click me</button>
                </div>
            </SimpleTooltip>
        );

        // All child elements should be rendered
        expect(screen.getByText(childText)).toBeInTheDocument();
        expect(screen.getByText('Click me')).toBeInTheDocument();

        // Show tooltip
        const container = screen.getByText(childText).closest('div')?.parentElement;
        // Check if container exists before firing events
        if (container) {
            fireEvent.mouseEnter(container);

            // Tooltip should be visible
            expect(screen.getByText(mockText)).toBeInTheDocument();
        }
    });

    it('should add correct styling to the tooltip', () => {
        render(
            <SimpleTooltip text={mockText}>
                <span>{childText}</span>
            </SimpleTooltip>
        );

        // Show tooltip
        const container = screen.getByText(childText).closest('div');
        fireEvent.mouseEnter(container!);

        // Get tooltip
        const tooltipContainer = screen.getByText(mockText).closest('div');

        // Check for Tailwind classes
        expect(tooltipContainer).toHaveClass('bg-gray-900');
        expect(tooltipContainer).toHaveClass('text-white');
        expect(tooltipContainer).toHaveClass('text-xs');
        expect(tooltipContainer).toHaveClass('whitespace-nowrap');

        // Check for z-index
        expect(tooltipContainer).toHaveStyle('zIndex: 10000');
    });
}); 