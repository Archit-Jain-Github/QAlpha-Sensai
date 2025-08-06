import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent
} from '../../../components/ui/card';

describe('Card Components', () => {
    describe('Card', () => {
        it('renders with default classes', () => {
            render(<Card data-testid="card">Card Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toBeInTheDocument();
            expect(card).toHaveClass(
                'rounded-lg',
                'border',
                'bg-card',
                'text-card-foreground',
                'shadow-sm'
            );
            expect(card).toHaveTextContent('Card Content');
        });

        it('applies custom className', () => {
            render(<Card className="custom-card-class" data-testid="card" />);
            const card = screen.getByTestId('card');
            expect(card).toHaveClass('custom-card-class');
            expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
        });

        it('passes through other props', () => {
            render(<Card data-custom="test-value" id="card-test" data-testid="card" />);
            const card = screen.getByTestId('card');
            expect(card).toHaveAttribute('data-custom', 'test-value');
            expect(card).toHaveAttribute('id', 'card-test');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<Card ref={ref} data-testid="card" />);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
            expect(ref.current).toBe(screen.getByTestId('card'));
        });

        it('renders children correctly', () => {
            render(
                <Card data-testid="card">
                    <div data-testid="child-element">Child Content</div>
                </Card>
            );
            expect(screen.getByTestId('child-element')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });
    });

    describe('CardHeader', () => {
        it('renders with default classes', () => {
            render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
            const header = screen.getByTestId('card-header');
            expect(header).toBeInTheDocument();
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
            expect(header).toHaveTextContent('Header Content');
        });

        it('applies custom className', () => {
            render(<CardHeader className="custom-header-class" data-testid="card-header" />);
            const header = screen.getByTestId('card-header');
            expect(header).toHaveClass('custom-header-class');
            expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<CardHeader ref={ref} data-testid="card-header" />);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('renders children correctly', () => {
            render(
                <CardHeader data-testid="card-header">
                    <span data-testid="header-child">Header Child</span>
                </CardHeader>
            );
            expect(screen.getByTestId('header-child')).toBeInTheDocument();
        });
    });

    describe('CardTitle', () => {
        it('renders as h3 with default classes', () => {
            render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
            const title = screen.getByTestId('card-title');
            expect(title).toBeInTheDocument();
            expect(title.tagName).toBe('H3');
            expect(title).toHaveClass(
                'text-2xl',
                'font-semibold',
                'leading-none',
                'tracking-tight'
            );
            expect(title).toHaveTextContent('Card Title');
        });

        it('applies custom className', () => {
            render(<CardTitle className="custom-title-class" data-testid="card-title">Title</CardTitle>);
            const title = screen.getByTestId('card-title');
            expect(title).toHaveClass('custom-title-class');
            expect(title).toHaveClass('text-2xl', 'font-semibold');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLHeadingElement>();
            render(<CardTitle ref={ref} data-testid="card-title">Title</CardTitle>);
            expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
            expect(ref.current?.tagName).toBe('H3');
        });

        it('passes through other props', () => {
            render(<CardTitle id="title-test" data-custom="title-value" data-testid="card-title">Title</CardTitle>);
            const title = screen.getByTestId('card-title');
            expect(title).toHaveAttribute('id', 'title-test');
            expect(title).toHaveAttribute('data-custom', 'title-value');
        });
    });

    describe('CardDescription', () => {
        it('renders as p with default classes', () => {
            render(<CardDescription data-testid="card-description">Card Description</CardDescription>);
            const description = screen.getByTestId('card-description');
            expect(description).toBeInTheDocument();
            expect(description.tagName).toBe('P');
            expect(description).toHaveClass('text-sm', 'text-muted-foreground');
            expect(description).toHaveTextContent('Card Description');
        });

        it('applies custom className', () => {
            render(<CardDescription className="custom-desc-class" data-testid="card-description">Description</CardDescription>);
            const description = screen.getByTestId('card-description');
            expect(description).toHaveClass('custom-desc-class');
            expect(description).toHaveClass('text-sm', 'text-muted-foreground');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLParagraphElement>();
            render(<CardDescription ref={ref} data-testid="card-description">Description</CardDescription>);
            expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
        });

        it('passes through other props', () => {
            render(<CardDescription id="desc-test" data-testid="card-description">Description</CardDescription>);
            const description = screen.getByTestId('card-description');
            expect(description).toHaveAttribute('id', 'desc-test');
        });
    });

    describe('CardContent', () => {
        it('renders with default classes', () => {
            render(<CardContent data-testid="card-content">Card Content</CardContent>);
            const content = screen.getByTestId('card-content');
            expect(content).toBeInTheDocument();
            expect(content).toHaveClass('p-6', 'pt-0');
            expect(content).toHaveTextContent('Card Content');
        });

        it('applies custom className', () => {
            render(<CardContent className="custom-content-class" data-testid="card-content" />);
            const content = screen.getByTestId('card-content');
            expect(content).toHaveClass('custom-content-class');
            expect(content).toHaveClass('p-6', 'pt-0');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<CardContent ref={ref} data-testid="card-content" />);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('renders children correctly', () => {
            render(
                <CardContent data-testid="card-content">
                    <p data-testid="content-child">Content Child</p>
                </CardContent>
            );
            expect(screen.getByTestId('content-child')).toBeInTheDocument();
        });
    });

    describe('CardFooter', () => {
        it('renders with default classes', () => {
            render(<CardFooter data-testid="card-footer">Footer Content</CardFooter>);
            const footer = screen.getByTestId('card-footer');
            expect(footer).toBeInTheDocument();
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
            expect(footer).toHaveTextContent('Footer Content');
        });

        it('applies custom className', () => {
            render(<CardFooter className="custom-footer-class" data-testid="card-footer" />);
            const footer = screen.getByTestId('card-footer');
            expect(footer).toHaveClass('custom-footer-class');
            expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<CardFooter ref={ref} data-testid="card-footer" />);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('renders children correctly', () => {
            render(
                <CardFooter data-testid="card-footer">
                    <button data-testid="footer-button">Action</button>
                </CardFooter>
            );
            expect(screen.getByTestId('footer-button')).toBeInTheDocument();
        });
    });

    describe('Complete Card Integration', () => {
        it('works together in a complete card setup', () => {
            render(
                <Card className="test-card" data-testid="complete-card">
                    <CardHeader data-testid="complete-header">
                        <CardTitle data-testid="complete-title">Sample Card</CardTitle>
                        <CardDescription data-testid="complete-description">
                            This is a sample card description
                        </CardDescription>
                    </CardHeader>
                    <CardContent data-testid="complete-content">
                        <p>This is the main content of the card</p>
                    </CardContent>
                    <CardFooter data-testid="complete-footer">
                        <button>Action Button</button>
                    </CardFooter>
                </Card>
            );

            expect(screen.getByTestId('complete-card')).toHaveClass('test-card');
            expect(screen.getByTestId('complete-title')).toHaveTextContent('Sample Card');
            expect(screen.getByTestId('complete-description')).toHaveTextContent('This is a sample card description');
            expect(screen.getByTestId('complete-content')).toHaveTextContent('This is the main content of the card');
            expect(screen.getByTestId('complete-footer')).toContainElement(screen.getByRole('button', { name: 'Action Button' }));
        });

        it('works with minimal setup', () => {
            render(
                <Card data-testid="minimal-card">
                    <CardContent>Just content</CardContent>
                </Card>
            );

            expect(screen.getByTestId('minimal-card')).toBeInTheDocument();
            expect(screen.getByText('Just content')).toBeInTheDocument();
        });
    });

    describe('Display Names', () => {
        it('has correct display names', () => {
            expect(Card.displayName).toBe('Card');
            expect(CardHeader.displayName).toBe('CardHeader');
            expect(CardTitle.displayName).toBe('CardTitle');
            expect(CardDescription.displayName).toBe('CardDescription');
            expect(CardContent.displayName).toBe('CardContent');
            expect(CardFooter.displayName).toBe('CardFooter');
        });
    });
}); 