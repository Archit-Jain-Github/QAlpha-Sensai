import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LearnerScorecard from '../../components/LearnerScorecard';
import { ScorecardItem } from '../../types/quiz';
import React from 'react';

describe('LearnerScorecard Component', () => {
    // Test data
    const mockScorecard: ScorecardItem[] = [
        {
            category: 'Understanding',
            score: 8,
            max_score: 10,
            feedback: {
                correct: 'Shows strong understanding of core concepts.',
                wrong: 'Could be more precise with technical terms.'
            }
        },
        {
            category: 'Implementation',
            score: 6,
            max_score: 10,
            feedback: {
                correct: 'Successfully implemented the main features.',
                wrong: 'Some edge cases were not handled properly.'
            }
        },
        {
            category: 'Code Quality',
            score: 7,
            max_score: 10,
            feedback: {
                correct: 'Clean and readable code structure.',
                wrong: 'Variable naming could be improved.'
            }
        }
    ];

    it('should render correctly with scorecard data', () => {
        const { container } = render(<LearnerScorecard scorecard={mockScorecard} />);

        // Check for summary
        expect(screen.getByText('Performance Summary')).toBeInTheDocument();
        expect(screen.getByText('Overall Score')).toBeInTheDocument();

        // Total score should be 21/30
        expect(screen.getByText('21/30')).toBeInTheDocument();

        // Percentage should be 70%
        expect(screen.getByText('70%')).toBeInTheDocument();

        // Check for categories - using querySelector with specific parent containers to avoid duplicates
        const summary = container.querySelector('.bg-zinc-900.rounded-xl.p-5');
        expect(summary?.textContent).toContain('Understanding');
        expect(summary?.textContent).toContain('Implementation');
        expect(summary?.textContent).toContain('Code Quality');

        // Check score displays
        expect(screen.getByText('8/10')).toBeInTheDocument();
        expect(screen.getByText('6/10')).toBeInTheDocument();
        expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should return null when scorecard is empty', () => {
        const { container } = render(<LearnerScorecard scorecard={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('should expand detailed feedback when clicked', async () => {
        const { container } = render(<LearnerScorecard scorecard={mockScorecard} />);

        // Get all category boxes
        const categoryHeaders = screen.getAllByText('Understanding');
        const categoryBox = categoryHeaders[1].closest('.cursor-pointer');

        // Verify that feedback is not visible initially
        expect(container.querySelector('.border-emerald-900\\/30')).not.toBeInTheDocument();
        expect(container.querySelector('.border-amber-900\\/30')).not.toBeInTheDocument();

        // Click on the first category to expand it
        fireEvent.click(categoryBox!);

        // Wait for the expanded content to appear
        await waitFor(() => {
            // Check for feedback sections by their distinctive classes
            const strengthsSection = container.querySelector('.border-emerald-900\\/30');
            const improvementSection = container.querySelector('.border-amber-900\\/30');

            expect(strengthsSection).toBeInTheDocument();
            expect(improvementSection).toBeInTheDocument();

            // Check for the actual text content within those sections
            expect(strengthsSection?.textContent).toContain('Strengths');
            expect(strengthsSection?.textContent).toContain('Shows strong understanding of core concepts.');
            expect(improvementSection?.textContent).toContain('Areas for improvement');
            expect(improvementSection?.textContent).toContain('Could be more precise with technical terms.');
        });
    });

    it('should collapse feedback when expanded section is clicked again', async () => {
        const { container } = render(<LearnerScorecard scorecard={mockScorecard} />);

        // Get the first category box
        const categoryHeaders = screen.getAllByText('Understanding');
        const categoryBox = categoryHeaders[1].closest('.cursor-pointer');

        // First click to expand
        fireEvent.click(categoryBox!);

        // Wait for expansion
        await waitFor(() => {
            expect(container.querySelector('.border-emerald-900\\/30')).toBeInTheDocument();
        });

        // Second click to collapse
        fireEvent.click(categoryBox!);

        // Wait for collapse
        await waitFor(() => {
            expect(container.querySelector('.border-emerald-900\\/30')).not.toBeInTheDocument();
        });
    });

    it('should handle changing between expanded sections', async () => {
        const { container } = render(<LearnerScorecard scorecard={mockScorecard} />);

        // Get category boxes
        const understandingHeaders = screen.getAllByText('Understanding');
        const understandingBox = understandingHeaders[1].closest('.cursor-pointer');

        const implementationHeaders = screen.getAllByText('Implementation');
        const implementationBox = implementationHeaders[1].closest('.cursor-pointer');

        // Expand Understanding section
        fireEvent.click(understandingBox!);

        // Wait for expansion
        await waitFor(() => {
            const strengthsSection = container.querySelector('.border-emerald-900\\/30');
            expect(strengthsSection?.textContent).toContain('Shows strong understanding of core concepts.');
        });

        // Expand Implementation section - Understanding should collapse
        fireEvent.click(implementationBox!);

        // Wait for Implementation to expand and Understanding to collapse
        await waitFor(() => {
            // Understanding feedback should no longer be visible
            expect(container.textContent).not.toContain('Shows strong understanding of core concepts.');

            // Implementation feedback should be visible
            const strengthsSection = container.querySelector('.border-emerald-900\\/30');
            expect(strengthsSection?.textContent).toContain('Successfully implemented the main features.');
        });
    });

    it('should apply the correct colors based on score percentages', () => {
        const mockScorecardWithVariedScores: ScorecardItem[] = [
            {
                category: 'Excellent',
                score: 9,
                max_score: 10, // 90% - should be emerald
                feedback: { correct: 'Great work', wrong: '' }
            },
            {
                category: 'Good',
                score: 7,
                max_score: 10, // 70% - should be blue
                feedback: { correct: 'Good effort', wrong: '' }
            },
            {
                category: 'Average',
                score: 5,
                max_score: 10, // 50% - should be amber
                feedback: { correct: '', wrong: 'Needs improvement' }
            },
            {
                category: 'Poor',
                score: 3,
                max_score: 10, // 30% - should be rose
                feedback: { correct: '', wrong: 'Significant issues' }
            }
        ];

        const { container } = render(<LearnerScorecard scorecard={mockScorecardWithVariedScores} />);

        // Check that correct color classes are applied
        // We can't test exact elements as the DOM structure is complex,
        // but we can check that the correct color classes exist in the document
        expect(container.innerHTML).toContain('bg-emerald-500');
        expect(container.innerHTML).toContain('bg-blue-500');
        expect(container.innerHTML).toContain('bg-amber-500');
        expect(container.innerHTML).toContain('bg-rose-500');
    });

    it('should apply custom className when provided', () => {
        const { container } = render(
            <LearnerScorecard
                scorecard={mockScorecard}
                className="custom-test-class"
            />
        );

        const rootElement = container.firstChild;
        expect(rootElement).toHaveClass('custom-test-class');
        expect(rootElement).toHaveClass('pt-6');
    });
}); 