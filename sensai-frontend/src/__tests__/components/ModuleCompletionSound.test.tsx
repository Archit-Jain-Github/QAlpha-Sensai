import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleCompletionSound from '../../components/ModuleCompletionSound';

// Mock AudioContext and its methods
const mockCreateOscillator = jest.fn().mockReturnValue({
    type: '',
    frequency: { value: 0 },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
});

const mockCreateGain = jest.fn().mockReturnValue({
    gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
});

class MockAudioContext {
    destination = {};
    currentTime = 0;
    createOscillator = mockCreateOscillator;
    createGain = mockCreateGain;
}

// Store the mock constructor for easier testing
const mockAudioContextConstructor = jest.fn().mockImplementation(() => new MockAudioContext());

// Setup AudioContext mock before tests
beforeAll(() => {
    // @ts-ignore
    global.AudioContext = mockAudioContextConstructor;
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

// Clean up after tests
afterAll(() => {
    jest.restoreAllMocks();
});

describe('ModuleCompletionSound Component', () => {
    beforeEach(() => {
        // Clear mock calls between tests
        mockCreateOscillator.mockClear();
        mockCreateGain.mockClear();
        mockAudioContextConstructor.mockClear();
    });

    it('should render without errors', () => {
        const { container } = render(<ModuleCompletionSound play={false} />);
        expect(container.firstChild).toBeNull(); // Component doesn't render anything
    });

    it('should create AudioContext and oscillators when play is true', () => {
        render(<ModuleCompletionSound play={true} />);

        // Verify AudioContext was created
        expect(mockAudioContextConstructor).toHaveBeenCalled();

        // Verify createOscillator was called multiple times (for each note)
        // The component creates 8 oscillators
        expect(mockCreateOscillator).toHaveBeenCalledTimes(8);

        // Verify createGain was called for each oscillator
        expect(mockCreateGain).toHaveBeenCalledTimes(8);
    });

    it('should not create AudioContext when play is false', () => {
        render(<ModuleCompletionSound play={false} />);

        // Verify AudioContext was not created
        expect(mockAudioContextConstructor).not.toHaveBeenCalled();
    });

    it('should handle AudioContext errors gracefully', () => {
        // Mock console.error to verify it's called
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock AudioContext constructor to throw an error
        const errorMessage = 'AudioContext failed';
        mockAudioContextConstructor.mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });

        render(<ModuleCompletionSound play={true} />);

        // Verify console.error was called with the error (this covers line 50)
        expect(consoleSpy).toHaveBeenCalledWith('Error creating module completion sound:', expect.any(Error));

        // Clean up spy
        consoleSpy.mockRestore();
    });
}); 