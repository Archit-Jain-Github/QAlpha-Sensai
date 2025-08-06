import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dropdown, { DropdownOption } from '../../components/Dropdown';
import * as React from 'react';

// Mock the Tooltip component
jest.mock('../../components/Tooltip', () => {
    return function MockedTooltip({ children }: { children: React.ReactNode }) {
        return <div data-testid="tooltip-wrapper">{children}</div>;
    };
});

describe('Dropdown Component', () => {
    // Sample options for testing
    const mockOptions: DropdownOption[] = [
        { label: 'Option 1', value: 'value1', color: '#FF5757' },
        { label: 'Option 2', value: 'value2', color: '#47A2FF' },
        { label: 'Option 3', value: 'value3', color: '#56CF75', tooltip: 'Tooltip for option 3' },
    ];

    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with title and placeholder when no option is selected', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                placeholder="Select an option"
            />
        );

        expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
        expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should display selected option when one is provided', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                selectedOption={mockOptions[0]}
                onChange={mockOnChange}
            />
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should show options when clicked', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
            />
        );

        // Options should not be visible initially
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

        // Click to open dropdown
        fireEvent.click(screen.getByText('Select one or more options'));

        // Options should now be visible
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should call onChange with selected option in single select mode', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
            />
        );

        // Click to open dropdown
        fireEvent.click(screen.getByText('Select one or more options'));

        // Click on an option
        fireEvent.click(screen.getByText('Option 2'));

        // Check if onChange was called with the correct option
        expect(mockOnChange).toHaveBeenCalledWith(mockOptions[1]);
    });

    it('should support multiselect mode', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                multiselect={true}
            />
        );

        // Click to open dropdown
        fireEvent.click(screen.getByText('Select one or more options'));

        // Click on first option
        fireEvent.click(screen.getByText('Option 1'));

        // Check if onChange was called with an array containing the first option
        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0]]);

        // Dropdown should still be open in multiselect mode
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should toggle selected options in multiselect mode', () => {
        const { rerender } = render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                multiselect={true}
                selectedOptions={[mockOptions[0]]}
            />
        );

        // Option 1 should be displayed as selected
        expect(screen.getByText('Option 1')).toBeInTheDocument();

        // Click to open dropdown
        fireEvent.click(screen.getByText('Option 1'));

        // Click on the second option to add it
        fireEvent.click(screen.getByText('Option 2'));

        // Check if onChange was called with both options
        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0], mockOptions[1]]);

        // Update component with new selection
        rerender(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                multiselect={true}
                selectedOptions={[mockOptions[0], mockOptions[1]]}
            />
        );

        // Find the remove buttons for the selected options
        const removeButtons = screen.getAllByRole('button').filter(
            button => button.querySelector('svg') &&
                button.previousSibling?.textContent === 'Option 1'
        );

        // Click on the remove button for Option 1
        fireEvent.click(removeButtons[0]);

        // Check if onChange was called with only the second option
        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[1]]);
    });

    it('should be disabled when disabled prop is true', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                disabled={true}
            />
        );

        // Click on the disabled dropdown
        fireEvent.click(screen.getByText('Select one or more options'));

        // Dropdown should not open
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should render tooltip when disabled and disabledTooltip is provided', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                disabled={true}
                disabledTooltip="This dropdown is disabled"
            />
        );

        // The tooltip content should be wrapped when disabled with tooltip
        const dropdownElement = screen.getByText('Test Dropdown').closest('div');
        expect(dropdownElement).toBeInTheDocument();

        // Verify that clicking doesn't open dropdown when disabled
        const selectableArea = screen.getByText('Select one or more options').parentElement;
        fireEvent.click(selectableArea!);

        // Dropdown should not open
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should not render tooltip when disabled but no disabledTooltip provided', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                disabled={true}
            // No disabledTooltip provided
            />
        );

        // Should still render disabled dropdown but without tooltip wrapper
        // Look for the container div that actually has the disabled classes
        const selectableArea = screen.getByText('Select one or more options').closest('[class*="opacity-70"]');
        expect(selectableArea).toHaveClass('opacity-70', 'cursor-default');

        // Should not open when clicked
        fireEvent.click(selectableArea!);
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should show tooltips for options that have them', () => {
        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
            />
        );

        // Click to open dropdown
        fireEvent.click(screen.getByText('Select one or more options'));

        // Option 3 should have a tooltip
        expect(screen.getByText('Tooltip for option 3')).toBeInTheDocument();
    });

    it('should render with an icon when provided', () => {
        const TestIcon = () => <div data-testid="test-icon">Icon</div>;

        render(
            <Dropdown
                title="Test Dropdown"
                options={mockOptions}
                onChange={mockOnChange}
                icon={<TestIcon />}
            />
        );

        expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
}); 