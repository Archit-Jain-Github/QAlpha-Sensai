import React from 'react';
import { render } from '@testing-library/react';
import CohortPage from '@/app/school/admin/[id]/cohorts/[cohortId]/page';

// Mock Next.js navigation - redirect should throw to interrupt execution
jest.mock('next/navigation', () => ({
    redirect: jest.fn(() => {
        throw new Error('NEXT_REDIRECT');
    })
}));

// Mock the ClientCohortPage component
jest.mock('@/app/school/admin/[id]/cohorts/[cohortId]/ClientCohortPage', () => {
    return jest.fn(() => <div data-testid="client-cohort-page">Client Cohort Page</div>);
});

// Import the mocked functions to access them in tests
const { redirect } = require('next/navigation');
const mockClientCohortPage = require('@/app/school/admin/[id]/cohorts/[cohortId]/ClientCohortPage');

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('CohortPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Valid cohortId scenarios', () => {
        it('should render ClientCohortPage with correct props when cohortId is valid', () => {
            const params = { id: 'school123', cohortId: 'cohort456' };

            const { getByTestId } = render(<CohortPage params={params} />);

            expect(getByTestId('client-cohort-page')).toBeInTheDocument();
            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: 'school123',
                cohortId: 'cohort456'
            });
            expect(redirect).not.toHaveBeenCalled();
        });

        it('should render ClientCohortPage when cohortId is a numeric string', () => {
            const params = { id: '123', cohortId: '789' };

            const { getByTestId } = render(<CohortPage params={params} />);

            expect(getByTestId('client-cohort-page')).toBeInTheDocument();
            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: '123',
                cohortId: '789'
            });
            expect(redirect).not.toHaveBeenCalled();
        });

        it('should render ClientCohortPage when cohortId contains special characters', () => {
            const params = { id: 'school-test', cohortId: 'cohort_123-abc' };

            const { getByTestId } = render(<CohortPage params={params} />);

            expect(getByTestId('client-cohort-page')).toBeInTheDocument();
            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: 'school-test',
                cohortId: 'cohort_123-abc'
            });
            expect(redirect).not.toHaveBeenCalled();
        });
    });

    describe('Invalid cohortId scenarios - redirects', () => {
        it('should redirect and log error when cohortId is undefined', () => {
            const params = { id: 'school123', cohortId: undefined as any };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", undefined);
            expect(redirect).toHaveBeenCalledWith('/school/admin/school123#cohorts');
            expect(mockClientCohortPage).not.toHaveBeenCalled();
        });

        it('should redirect and log error when cohortId is the string "undefined"', () => {
            const params = { id: 'school456', cohortId: 'undefined' };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", 'undefined');
            expect(redirect).toHaveBeenCalledWith('/school/admin/school456#cohorts');
            expect(mockClientCohortPage).not.toHaveBeenCalled();
        });

        it('should redirect when cohortId is an empty string', () => {
            const params = { id: 'school789', cohortId: '' };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", '');
            expect(redirect).toHaveBeenCalledWith('/school/admin/school789#cohorts');
            expect(mockClientCohortPage).not.toHaveBeenCalled();
        });

        it('should redirect when cohortId is null', () => {
            const params = { id: 'school000', cohortId: null as any };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", null);
            expect(redirect).toHaveBeenCalledWith('/school/admin/school000#cohorts');
            expect(mockClientCohortPage).not.toHaveBeenCalled();
        });

        it('should redirect when cohortId is false (falsy value)', () => {
            const params = { id: 'school111', cohortId: false as any };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", false);
            expect(redirect).toHaveBeenCalledWith('/school/admin/school111#cohorts');
            expect(mockClientCohortPage).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases with school id', () => {
        it('should handle numeric school id correctly', () => {
            const params = { id: '12345', cohortId: 'valid-cohort' };

            const { getByTestId } = render(<CohortPage params={params} />);

            expect(getByTestId('client-cohort-page')).toBeInTheDocument();
            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: '12345',
                cohortId: 'valid-cohort'
            });
        });

        it('should handle school id with special characters', () => {
            const params = { id: 'school-test_123', cohortId: 'valid-cohort' };

            const { getByTestId } = render(<CohortPage params={params} />);

            expect(getByTestId('client-cohort-page')).toBeInTheDocument();
            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: 'school-test_123',
                cohortId: 'valid-cohort'
            });
        });

        it('should redirect correctly with complex school id', () => {
            const params = { id: 'complex-school_123-test', cohortId: 'undefined' };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(redirect).toHaveBeenCalledWith('/school/admin/complex-school_123-test#cohorts');
        });
    });

    describe('Component props verification', () => {
        it('should pass exact schoolId and cohortId values to ClientCohortPage', () => {
            const params = { id: 'exact-school-id', cohortId: 'exact-cohort-id' };

            render(<CohortPage params={params} />);

            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(firstCallProps).toEqual({
                schoolId: 'exact-school-id',
                cohortId: 'exact-cohort-id'
            });
        });

        it('should pass only schoolId and cohortId props to ClientCohortPage', () => {
            const params = { id: 'school', cohortId: 'cohort' };

            render(<CohortPage params={params} />);

            expect(mockClientCohortPage).toHaveBeenCalledTimes(1);
            const [firstCallProps] = mockClientCohortPage.mock.calls[0];
            expect(Object.keys(firstCallProps)).toEqual(['schoolId', 'cohortId']);
        });
    });

    describe('Console error logging', () => {
        it('should log error when cohortId is invalid', () => {
            const params = { id: 'test', cohortId: undefined as any };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(console.error).toHaveBeenCalledWith("Invalid cohortId in URL:", undefined);
        });

        it('should not log error when cohortId is valid', () => {
            const params = { id: 'test', cohortId: 'valid' };

            render(<CohortPage params={params} />);

            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe('Redirect URL format', () => {
        it('should include #cohorts fragment in redirect URL', () => {
            const params = { id: 'test-school', cohortId: undefined as any };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(redirect).toHaveBeenCalledWith('/school/admin/test-school#cohorts');
        });

        it('should preserve exact school id in redirect URL', () => {
            const params = { id: 'very-specific-school-id-123', cohortId: '' };

            expect(() => render(<CohortPage params={params} />)).toThrow('NEXT_REDIRECT');

            expect(redirect).toHaveBeenCalledWith('/school/admin/very-specific-school-id-123#cohorts');
        });
    });
}); 