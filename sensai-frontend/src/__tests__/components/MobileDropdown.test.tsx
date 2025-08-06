import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileDropdown, { DropdownOption } from '../../components/MobileDropdown';

// Mock setTimeout and clearTimeout for animation testing
jest.useFakeTimers();

describe('MobileDropdown Component', () => {
    const mockOptions: DropdownOption[] = [
        { id: '1', label: 'Option 1', value: 'value1' },
        { id: '2', label: 'Option 2', value: 'value2' },
        { id: '3', label: 'Option 3', value: 'value3' },
    ];

    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should not render when isOpen is false', () => {
        render(
            <MobileDropdown
                isOpen={false}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Dropdown')).toBeInTheDocument();
    });

    it('should render all options', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should call onClose when the backdrop is clicked', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        // Click on the backdrop (the dialog itself, not its children)
        fireEvent.click(screen.getByRole('dialog'));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when the X button is clicked', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        // Click on the close button
        fireEvent.click(screen.getByLabelText('Close'));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with the right option and close when an option is clicked', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        // Click on an option
        fireEvent.click(screen.getByText('Option 2'));

        // Check if onSelect and onClose were called
        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[1]);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should apply animation classes when opened', () => {
        const { container } = render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
            />
        );

        // Initially it should have opacity-0 class
        expect(screen.getByRole('dialog')).toHaveClass('opacity-0');

        // After timeout, it should have opacity-100 class
        act(() => {
            jest.advanceTimersByTime(20);
        });

        expect(screen.getByRole('dialog')).toHaveClass('opacity-100');
    });

    it('should highlight the selected option when selectedId is provided', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                selectedId="2"
                onSelect={mockOnSelect}
            />
        );

        // Find all option buttons
        const options = screen.getAllByRole('button').filter(
            button => button.textContent === 'Option 1' ||
                button.textContent === 'Option 2' ||
                button.textContent === 'Option 3'
        );

        // The second option should have the selected class
        expect(options[1]).toHaveClass('bg-gradient-to-r');

        // Other options shouldn't have the selected class
        expect(options[0]).not.toHaveClass('bg-gradient-to-r');
        expect(options[2]).not.toHaveClass('bg-gradient-to-r');
    });

    it('should use custom renderOption function when provided', () => {
        const renderOption = jest.fn((option, isSelected) => (
            <div data-testid={`custom-option-${option.id}`}>
                {option.label} {isSelected ? '(Selected)' : ''}
            </div>
        ));

        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                selectedId="2"
                onSelect={mockOnSelect}
                renderOption={renderOption}
            />
        );

        // Custom render function should be called for each option
        expect(renderOption).toHaveBeenCalledTimes(3);

        // Check if custom elements are rendered
        expect(screen.getByTestId('custom-option-1')).toBeInTheDocument();
        expect(screen.getByTestId('custom-option-2')).toBeInTheDocument();
        expect(screen.getByTestId('custom-option-3')).toBeInTheDocument();

        // Check if selected state is passed correctly
        expect(screen.getByTestId('custom-option-2').textContent).toContain('(Selected)');
        expect(screen.getByTestId('custom-option-1').textContent).not.toContain('(Selected)');
    });

    it('should apply custom class names when provided', () => {
        render(
            <MobileDropdown
                isOpen={true}
                onClose={mockOnClose}
                title="Test Dropdown"
                options={mockOptions}
                onSelect={mockOnSelect}
                className="custom-container"
                contentClassName="custom-content"
                titleClassName="custom-title"
                closeButtonClassName="custom-close"
            />
        );

        expect(screen.getByRole('dialog')).toHaveClass('custom-container');
        expect(screen.getByText('Test Dropdown')).toHaveClass('custom-title');
        expect(screen.getByLabelText('Close')).toHaveClass('custom-close');

        // Find the content div (should be the direct child of the dialog)
        const contentDiv = screen.getByRole('dialog').firstChild as HTMLElement;
        expect(contentDiv).toHaveClass('custom-content');
    });
}); 