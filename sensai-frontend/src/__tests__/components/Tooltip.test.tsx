import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '../../components/Tooltip';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('Tooltip Component', () => {
    beforeEach(() => {
        jest.clearAllTimers();
    });

    it('should render children correctly', () => {
        render(
            <Tooltip content="Tooltip Content">
                <button>Hover Me</button>
            </Tooltip>
        );

        expect(screen.getByText('Hover Me')).toBeInTheDocument();
        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    });

    it('should show tooltip after delay on mouse enter', () => {
        render(
            <Tooltip content="Tooltip Content" delay={300}>
                <button>Hover Me</button>
            </Tooltip>
        );

        // Initially not visible
        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

        // Trigger mouse enter
        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);

        // Before timeout completes
        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();

        // After timeout completes
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    });

    it('should hide tooltip on mouse leave', () => {
        render(
            <Tooltip content="Tooltip Content" delay={0}>
                <button>Hover Me</button>
            </Tooltip>
        );

        // Trigger mouse enter
        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);

        // Fast-forward past the delay
        act(() => {
            jest.advanceTimersByTime(0);
        });

        expect(screen.getByText('Tooltip Content')).toBeInTheDocument();

        // Trigger mouse leave
        fireEvent.mouseLeave(screen.getByText('Hover Me').parentElement!);

        expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    });

    it('should apply different position classes based on position prop', () => {
        // Test top position (default)
        const { rerender } = render(
            <Tooltip content="Tooltip Content" delay={0}>
                <button>Hover Me</button>
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        let tooltipElement = screen.getByRole('tooltip');
        expect(tooltipElement).toHaveClass('bottom-full');

        // Test bottom position
        rerender(
            <Tooltip content="Tooltip Content" position="bottom" delay={0}>
                <button>Hover Me</button>
            </Tooltip>
        );

        fireEvent.mouseLeave(screen.getByText('Hover Me').parentElement!);
        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        tooltipElement = screen.getByRole('tooltip');
        expect(tooltipElement).toHaveClass('top-full');

        // Test left position
        rerender(
            <Tooltip content="Tooltip Content" position="left" delay={0}>
                <button>Hover Me</button>
            </Tooltip>
        );

        fireEvent.mouseLeave(screen.getByText('Hover Me').parentElement!);
        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        tooltipElement = screen.getByRole('tooltip');
        expect(tooltipElement).toHaveClass('right-full');

        // Test right position
        rerender(
            <Tooltip content="Tooltip Content" position="right" delay={0}>
                <button>Hover Me</button>
            </Tooltip>
        );

        fireEvent.mouseLeave(screen.getByText('Hover Me').parentElement!);
        fireEvent.mouseEnter(screen.getByText('Hover Me').parentElement!);
        act(() => {
            jest.advanceTimersByTime(0);
        });

        tooltipElement = screen.getByRole('tooltip');
        expect(tooltipElement).toHaveClass('left-full');
    });
}); 