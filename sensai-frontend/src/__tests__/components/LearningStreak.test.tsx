import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LearningStreak from '../../components/LearningStreak';

// Mock current day to be consistent in tests
const mockCurrentDay = 3; // Wednesday (0-indexed)
jest.mock('react', () => {
    const originalReact = jest.requireActual('react');
    return {
        ...originalReact,
        useMemo: jest.fn((callback, deps) => {
            // If this is the getCurrentDayInIST calculation, return our mocked day
            if (deps.length === 0) {
                return mockCurrentDay;
            }
            // For all other useMemo calls, use the actual implementation
            return originalReact.useMemo(callback, deps);
        }),
    };
});

describe('LearningStreak Component', () => {
    const baseProps = {
        streakDays: 3,
        activeDays: ['M', 'T', 'W'], // Monday, Tuesday, Wednesday active
    };

    it('should render the streak days count correctly', () => {
        render(<LearningStreak {...baseProps} />);
        expect(screen.getByText('3 Days')).toBeInTheDocument();
    });

    it('should use singular form when streak is 1 day', () => {
        render(<LearningStreak {...baseProps} streakDays={1} />);

        // Look for the text content with exact text
        const dayText = screen.getByText('1 Day');
        expect(dayText).toBeInTheDocument();
    });

    it('should render 7 day indicators', () => {
        const { container } = render(<LearningStreak {...baseProps} />);

        // Look for all day elements
        const dayElements = container.querySelectorAll('.flex-1.h-8');
        expect(dayElements.length).toBe(7);
    });

    it('should highlight the current day with a border', () => {
        const { container } = render(<LearningStreak {...baseProps} />);

        // The 4th element (index 3) should be the current day with special border
        const dayElements = container.querySelectorAll('.flex-1.h-8');
        expect(dayElements[3]).toHaveClass('border-2');
        expect(dayElements[3]).toHaveClass('border-[#F9B84E]');
    });

    it('should render days as active when included in activeDays', () => {
        const { container } = render(<LearningStreak {...baseProps} />);

        // The days in activeDays should have the active styling
        const dayElements = container.querySelectorAll('.flex-1.h-8');

        // Given our mock current day is Wednesday (index 3), 
        // the active days (M, T, W) should be at positions 1, 2, and 3
        expect(dayElements[1]).toHaveClass('bg-[#F9B84E]');
        expect(dayElements[2]).toHaveClass('bg-[#F9B84E]');
        expect(dayElements[3]).toHaveClass('bg-[#F9B84E]');

        // Future days should never be active
        expect(dayElements[4]).not.toHaveClass('bg-[#F9B84E]');
        expect(dayElements[5]).not.toHaveClass('bg-[#F9B84E]');
        expect(dayElements[6]).not.toHaveClass('bg-[#F9B84E]');
    });

    it('should render days in the correct order with current day in the middle', () => {
        const { container } = render(<LearningStreak {...baseProps} />);

        // With Wednesday (W) as the current day, the order should be:
        // Sunday (S), Monday (M), Tuesday (T), Wednesday (W), Thursday (T), Friday (F), Saturday (S)
        const dayElements = container.querySelectorAll('.flex-1.h-8');

        // The 7 days should be in the right order
        expect(dayElements[0].textContent).toBe('S');
        expect(dayElements[1].textContent).toBe('M');
        expect(dayElements[2].textContent).toBe('T');
        expect(dayElements[3].textContent).toBe('W');
        expect(dayElements[4].textContent).toBe('T');
        expect(dayElements[5].textContent).toBe('F');
        expect(dayElements[6].textContent).toBe('S');
    });

    it('should show an emoji when streak is at least 1 day', () => {
        render(<LearningStreak {...baseProps} />);

        // There should be an emoji element
        const emojiElement = screen.getByRole('img', { name: 'Energizing emoji' });
        expect(emojiElement).toBeInTheDocument();
    });

    it('should not show an emoji when streak is 0 days', () => {
        render(<LearningStreak {...baseProps} streakDays={0} />);

        // There should not be an emoji element
        const emojiElement = screen.queryByRole('img', { name: 'Energizing emoji' });
        expect(emojiElement).not.toBeInTheDocument();
    });
}); 