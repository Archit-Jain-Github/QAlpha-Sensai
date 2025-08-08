import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessSound from '../../components/SuccessSound';

// Mock AudioContext and related audio nodes
const mockCreateOscillator = jest.fn().mockReturnValue({
    type: '',
    frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
    },
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

describe('SuccessSound Component', () => {
    beforeEach(() => {
        // Clear mock calls between tests
        mockCreateOscillator.mockClear();
        mockCreateGain.mockClear();
        mockAudioContextConstructor.mockClear();
    });

    it('should render without errors', () => {
        const { container } = render(<SuccessSound play={false} />);
        expect(container.firstChild).toBeNull(); // Component doesn't render anything
    });

    it('should call createSuccessSound when play is true', () => {
        render(<SuccessSound play={true} />);

        // Verify AudioContext was created
        expect(mockAudioContextConstructor).toHaveBeenCalled();
    });

    it('should not call createSuccessSound when play is false', () => {
        render(<SuccessSound play={false} />);

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

        render(<SuccessSound play={true} />);

        // Verify console.error was called with the error (this covers line 39)
        expect(consoleSpy).toHaveBeenCalledWith('Error creating success sound:', expect.any(Error));

        // Clean up spy
        consoleSpy.mockRestore();
    });
}); 