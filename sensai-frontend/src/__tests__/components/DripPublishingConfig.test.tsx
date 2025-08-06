import React from 'react';
import { render, screen, fireEvent, waitFor, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import DripPublishingConfig, { DripPublishingConfigRef } from '@/components/DripPublishingConfig';
import Toast from '@/components/Toast';
import { useRef } from 'react';

const mockConfig = {
    drip_schedule_type: 'weekly' as const,
    drip_schedule_start_date: '2023-01-01',
    drip_schedule_interval: 7,
};

const mockModule = {
    id: 'module-1',
    title: 'Test Module',
    scheduled_publish_at: null,
};

// Mock DatePicker
jest.mock('react-datepicker', () => {
    return function MockDatePicker(props: any) {
        return (
            <input
                data-testid="date-picker"
                value={props.selected ? props.selected.toISOString() : ''}
                onChange={(e) => props.onChange(e.target.value ? new Date(e.target.value) : null)}
                placeholder={props.placeholderText}
                disabled={props.disabled}
            />
        );
    };
});

// Mock Toast component
jest.mock('../../components/Toast', () => {
    return function MockToast(props: any) {
        return props.show ? (
            <div data-testid="toast">
                <div data-testid="toast-title">{props.title}</div>
                <div data-testid="toast-description">{props.description}</div>
            </div>
        ) : null;
    };
});

describe('DripPublishingConfig Component', () => {
    const mockOnConfigChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with drip publishing disabled by default', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        expect(checkbox).not.toBeChecked();
        expect(mockOnConfigChange).toHaveBeenCalledWith(undefined);
    });

    it('should enable drip publishing when checkbox is checked', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
        expect(mockOnConfigChange).toHaveBeenCalledWith({
            is_drip_enabled: true,
            frequency_value: 1,
            frequency_unit: 'day',
            publish_at: null
        });
    });

    it('should show frequency controls when drip is enabled', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        expect(screen.getByText('Every')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('day')).toBeInTheDocument();
    });

    it('should handle frequency value changes', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '3' } });

        expect(mockOnConfigChange).toHaveBeenCalledWith({
            is_drip_enabled: true,
            frequency_value: 3,
            frequency_unit: 'day',
            publish_at: null
        });
    });

    it('should handle frequency unit changes', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        const unitSelect = screen.getByDisplayValue('day');
        fireEvent.change(unitSelect, { target: { value: 'week' } });

        expect(mockOnConfigChange).toHaveBeenCalledWith({
            is_drip_enabled: true,
            frequency_value: 1,
            frequency_unit: 'week',
            publish_at: null
        });
    });

    it('should show all time unit options', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        const unitSelect = screen.getByDisplayValue('day');

        const expectedUnits = ['minute', 'hour', 'day', 'week', 'month', 'year'];
        expectedUnits.forEach(unit => {
            expect(screen.getByRole('option', { name: new RegExp(unit) })).toBeInTheDocument();
        });
    });

    it('should enable specific start date option', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const dripCheckbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(dripCheckbox);

        const dateCheckbox = screen.getByLabelText(/set a specific start date/i);
        fireEvent.click(dateCheckbox);

        expect(dateCheckbox).toBeChecked();
        expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    });

    it('should handle date selection', () => {
        render(<DripPublishingConfig onConfigChange={mockOnConfigChange} />);

        const dripCheckbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(dripCheckbox);

        const dateCheckbox = screen.getByLabelText(/set a specific start date/i);
        fireEvent.click(dateCheckbox);

        const datePicker = screen.getByTestId('date-picker');
        const testDate = new Date('2023-12-25T10:00:00');
        fireEvent.change(datePicker, { target: { value: testDate.toISOString() } });

        expect(mockOnConfigChange).toHaveBeenCalledWith({
            is_drip_enabled: true,
            frequency_value: 1,
            frequency_unit: 'day',
            publish_at: testDate
        });
    });

    it('should validate frequency value when exposed validation is called', async () => {
        const ref = React.createRef<any>();
        render(<DripPublishingConfig ref={ref} onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '0' } });

        // Call validation through ref wrapped in act
        await act(async () => {
            const validationError = ref.current?.validateDripConfig();
            expect(validationError).toBe('Please enter a valid value for the release schedule');
        });
    });

    it('should validate date selection when required', async () => {
        const ref = React.createRef<any>();
        render(<DripPublishingConfig ref={ref} onConfigChange={mockOnConfigChange} />);

        const dripCheckbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(dripCheckbox);

        const dateCheckbox = screen.getByLabelText(/set a specific start date/i);
        fireEvent.click(dateCheckbox);

        // Call validation without setting a date wrapped in act
        await act(async () => {
            const validationError = ref.current?.validateDripConfig();
            expect(validationError).toBe('Please select a release date and time');
        });
    });

    it('should return null for valid configuration', async () => {
        const ref = React.createRef<any>();
        render(<DripPublishingConfig ref={ref} onConfigChange={mockOnConfigChange} />);

        const checkbox = screen.getByLabelText(/release modules gradually/i);
        fireEvent.click(checkbox);

        // Valid configuration should return null wrapped in act
        await act(async () => {
            const validationError = ref.current?.validateDripConfig();
            expect(validationError).toBeNull();
        });
    });

    it('should show toast for validation errors', async () => {
        const ref = React.createRef<DripPublishingConfigRef>();
        render(<DripPublishingConfig ref={ref} />);

        // Enable drip publishing but don't set frequency
        const enableCheckbox = screen.getByLabelText('Release modules gradually using a drip schedule');
        fireEvent.click(enableCheckbox);

        // Clear the frequency value to trigger validation error
        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '' } });

        // Trigger validation wrapped in act
        await act(async () => {
            ref.current?.validateDripConfig();
        });

        // Look for toast by its test-id attributes from the mock
        expect(screen.getByTestId('toast')).toBeInTheDocument();
        expect(screen.getByTestId('toast-title')).toHaveTextContent('Invalid publish settings');
        expect(screen.getByTestId('toast-description')).toHaveTextContent('Please enter a valid value for the release schedule');
    });

    it('should handle disabled drip publishing validation', async () => {
        const ref = React.createRef<any>();
        render(<DripPublishingConfig ref={ref} onConfigChange={mockOnConfigChange} />);

        // Don't enable drip publishing - wrap in act
        await act(async () => {
            const validationError = ref.current?.validateDripConfig();
            expect(validationError).toBeNull();
        });
    });

    it('should update plural/singular units based on frequency value', () => {
        render(<DripPublishingConfig />);

        // Enable drip publishing
        const enableCheckbox = screen.getByLabelText('Release modules gradually using a drip schedule');
        fireEvent.click(enableCheckbox);

        // Change frequency to 2
        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '2' } });

        // With value > 1, should show plural form in select options
        const unitSelect = screen.getByRole('combobox');
        expect(unitSelect).toBeInTheDocument();

        // Check that options contain plural forms
        expect(screen.getByText('days')).toBeInTheDocument();
    });

    it('should handle component without onConfigChange prop', () => {
        expect(() => {
            render(<DripPublishingConfig />);
        }).not.toThrow();
    });

    it('should auto-hide toast after timeout', async () => {
        const ref = React.createRef<DripPublishingConfigRef>();
        render(<DripPublishingConfig ref={ref} />);

        // Enable drip publishing but don't set frequency
        const enableCheckbox = screen.getByLabelText('Release modules gradually using a drip schedule');
        fireEvent.click(enableCheckbox);

        // Clear the frequency value to trigger validation error
        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '' } });

        // Trigger validation wrapped in act
        await act(async () => {
            ref.current?.validateDripConfig();
        });

        expect(screen.getByTestId('toast-title')).toHaveTextContent('Invalid publish settings');

        // Wait for auto-hide (4 seconds)
        await waitFor(() => {
            expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('should validate and show error for missing frequency unit when drip is enabled', async () => {
        const { result } = renderHook(() => useRef<DripPublishingConfigRef>(null));

        render(
            <DripPublishingConfig
                ref={result.current}
                onConfigChange={mockOnConfigChange}
            />
        );

        // Enable drip publishing
        const dripCheckbox = screen.getByLabelText(/Release modules gradually/);
        fireEvent.click(dripCheckbox);

        // Set frequency value but clear the unit - look for the select by role instead
        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '2' } });

        // Clear the frequency unit by selecting the disabled option - find by role
        const unitSelect = screen.getByRole('combobox');
        fireEvent.change(unitSelect, { target: { value: '' } });

        // Call validation - this should trigger the missing unit validation (line 81-83)
        await act(async () => {
            const error = result.current.current?.validateDripConfig();
            expect(error).toBe('Please enter a valid unit for the release schedule');
        });

        // Check that error toast is shown
        expect(screen.getByText('Invalid publish settings')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid unit for the release schedule')).toBeInTheDocument();
    });

    it('should validate and show error for invalid frequency value (zero)', async () => {
        const { result } = renderHook(() => useRef<DripPublishingConfigRef>(null));

        render(
            <DripPublishingConfig
                ref={result.current}
                onConfigChange={mockOnConfigChange}
            />
        );

        // Enable drip publishing
        const dripCheckbox = screen.getByLabelText(/Release modules gradually/);
        fireEvent.click(dripCheckbox);

        // Set invalid frequency value (0) - this should trigger line 68
        const frequencyInput = screen.getByDisplayValue('1');
        fireEvent.change(frequencyInput, { target: { value: '0' } });

        // Call validation
        await act(async () => {
            const error = result.current.current?.validateDripConfig();
            expect(error).toBe('Please enter a valid value for the release schedule');
        });

        // Check that error toast is shown
        expect(screen.getByText('Invalid publish settings')).toBeInTheDocument();
        expect(screen.getByText('Please enter a valid value for the release schedule')).toBeInTheDocument();
    });

    it('should validate and show error for missing publish date when release date is enabled', async () => {
        const { result } = renderHook(() => useRef<DripPublishingConfigRef>(null));

        render(
            <DripPublishingConfig
                ref={result.current}
                onConfigChange={mockOnConfigChange}
            />
        );

        // Enable drip publishing
        const dripCheckbox = screen.getByLabelText(/Release modules gradually/);
        fireEvent.click(dripCheckbox);

        // Enable release date but don't set a date
        const releaseDateCheckbox = screen.getByLabelText(/Set a specific start date/);
        fireEvent.click(releaseDateCheckbox);

        // Call validation without setting a date
        await act(async () => {
            const error = result.current.current?.validateDripConfig();
            expect(error).toBe('Please select a release date and time');
        });

        // Check that error toast is shown
        expect(screen.getByText('Invalid publish settings')).toBeInTheDocument();
        expect(screen.getByText('Please select a release date and time')).toBeInTheDocument();
    });
}); 