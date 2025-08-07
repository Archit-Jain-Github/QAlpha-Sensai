import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from '../../../components/ui/button';

describe('Button Component', () => {
    describe('Basic rendering', () => {
        it('renders with default props', () => {
            render(<Button>Test Button</Button>);
            const button = screen.getByRole('button', { name: 'Test Button' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
        });

        it('renders children correctly', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            render(<Button className="custom-class">Test</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });
    });

    describe('Variants', () => {
        it('renders with default variant', () => {
            render(<Button variant="default">Default</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
        });

        it('renders with destructive variant', () => {
            render(<Button variant="destructive">Destructive</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
        });

        it('renders with outline variant', () => {
            render(<Button variant="outline">Outline</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('border', 'border-input', 'bg-background');
        });

        it('renders with secondary variant', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
        });

        it('renders with ghost variant', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
        });

        it('renders with link variant', () => {
            render(<Button variant="link">Link</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-primary', 'underline-offset-4');
        });
    });

    describe('Sizes', () => {
        it('renders with default size', () => {
            render(<Button size="default">Default</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10', 'px-4', 'py-2');
        });

        it('renders with small size', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
        });

        it('renders with large size', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-11', 'rounded-md', 'px-8');
        });

        it('renders with icon size', () => {
            render(<Button size="icon">Icon</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('h-10', 'w-10');
        });
    });

    describe('asChild prop', () => {
        it('renders as Slot when asChild is true', () => {
            render(
                <Button asChild>
                    <a href="/test">Link Button</a>
                </Button>
            );
            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/test');
            expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center');
        });

        it('renders as button when asChild is false', () => {
            render(<Button asChild={false}>Regular Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Event handling', () => {
        it('handles click events', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click me</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('handles other HTML button attributes', () => {
            render(
                <Button
                    type="submit"
                    disabled
                    aria-label="Custom label"
                    data-testid="test-button"
                >
                    Submit
                </Button>
            );

            const button = screen.getByTestId('test-button');
            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute('aria-label', 'Custom label');
        });
    });

    describe('Disabled state', () => {
        it('applies disabled styles when disabled', () => {
            render(<Button disabled>Disabled Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
        });

        it('does not handle click when disabled', () => {
            const handleClick = jest.fn();
            render(<Button disabled onClick={handleClick}>Disabled</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Focus and accessibility', () => {
        it('has correct focus styles', () => {
            render(<Button>Focus Test</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-ring',
                'focus-visible:ring-offset-2'
            );
        });

        it('is focusable', () => {
            render(<Button>Focusable</Button>);
            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();
        });
    });

    describe('Forward ref', () => {
        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLButtonElement>();
            render(<Button ref={ref}>Ref Test</Button>);

            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
            expect(ref.current?.textContent).toBe('Ref Test');
        });
    });

    describe('Combination of props', () => {
        it('works with multiple variant and size combinations', () => {
            const combinations = [
                { variant: 'default' as const, size: 'sm' as const },
                { variant: 'destructive' as const, size: 'lg' as const },
                { variant: 'outline' as const, size: 'icon' as const },
                { variant: 'secondary' as const, size: 'default' as const },
            ];

            combinations.forEach(({ variant, size }, index) => {
                const { unmount } = render(
                    <Button variant={variant} size={size}>
                        Test {index}
                    </Button>
                );
                const button = screen.getByRole('button');
                expect(button).toBeInTheDocument();
                unmount();
            });
        });
    });
});

describe('buttonVariants function', () => {
    it('generates correct classes for default configuration', () => {
        const classes = buttonVariants();
        expect(classes).toContain('inline-flex');
        expect(classes).toContain('bg-primary');
        expect(classes).toContain('h-10');
    });

    it('generates correct classes for custom variant', () => {
        const classes = buttonVariants({ variant: 'destructive' });
        expect(classes).toContain('bg-destructive');
    });

    it('generates correct classes for custom size', () => {
        const classes = buttonVariants({ size: 'lg' });
        expect(classes).toContain('h-11');
        expect(classes).toContain('px-8');
    });

    it('generates correct classes for custom variant and size', () => {
        const classes = buttonVariants({ variant: 'outline', size: 'sm' });
        expect(classes).toContain('border');
        expect(classes).toContain('h-9');
        expect(classes).toContain('px-3');
    });

    it('handles custom className', () => {
        const classes = buttonVariants({ className: 'custom-class' });
        expect(classes).toContain('custom-class');
    });
}); 