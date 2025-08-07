import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';

// Mock @radix-ui/react-tabs
jest.mock('@radix-ui/react-tabs', () => ({
    Root: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
        <div ref={ref} data-testid="tabs-root" {...props}>
            {children}
        </div>
    )),
    List: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
        <div ref={ref} className={className} data-testid="tabs-list" {...props}>
            {children}
        </div>
    )),
    Trigger: React.forwardRef<HTMLButtonElement, any>(({ children, className, ...props }, ref) => (
        <button ref={ref} className={className} data-testid="tabs-trigger" {...props}>
            {children}
        </button>
    )),
    Content: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
        <div ref={ref} className={className} data-testid="tabs-content" {...props}>
            {children}
        </div>
    )),
}));

describe('Tabs Components', () => {
    describe('Tabs Root', () => {
        it('renders correctly', () => {
            render(<Tabs defaultValue="tab1">Content</Tabs>);
            const tabs = screen.getByTestId('tabs-root');
            expect(tabs).toBeInTheDocument();
            expect(tabs).toHaveTextContent('Content');
        });

        it('passes through props correctly', () => {
            render(<Tabs defaultValue="tab1" data-custom="test-value" />);
            const tabs = screen.getByTestId('tabs-root');
            expect(tabs).toHaveAttribute('data-custom', 'test-value');
        });
    });

    describe('TabsList', () => {
        it('renders with default classes', () => {
            render(<TabsList>List Content</TabsList>);
            const list = screen.getByTestId('tabs-list');
            expect(list).toBeInTheDocument();
            expect(list).toHaveClass(
                'inline-flex',
                'h-10',
                'items-center',
                'justify-center',
                'rounded-md',
                'bg-muted',
                'p-1',
                'text-muted-foreground'
            );
            expect(list).toHaveTextContent('List Content');
        });

        it('applies custom className', () => {
            render(<TabsList className="custom-list-class">List</TabsList>);
            const list = screen.getByTestId('tabs-list');
            expect(list).toHaveClass('custom-list-class');
            expect(list).toHaveClass('inline-flex', 'h-10');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<TabsList ref={ref}>List</TabsList>);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('passes through other props', () => {
            render(<TabsList data-custom="list-test" id="tabs-list-id">List</TabsList>);
            const list = screen.getByTestId('tabs-list');
            expect(list).toHaveAttribute('data-custom', 'list-test');
            expect(list).toHaveAttribute('id', 'tabs-list-id');
        });
    });

    describe('TabsTrigger', () => {
        it('renders with default classes', () => {
            render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>);
            const trigger = screen.getByTestId('tabs-trigger');
            expect(trigger).toBeInTheDocument();
            expect(trigger).toHaveClass(
                'inline-flex',
                'items-center',
                'justify-center',
                'whitespace-nowrap',
                'rounded-sm',
                'px-3',
                'py-1.5',
                'text-sm',
                'font-medium',
                'ring-offset-background',
                'transition-all',
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-ring',
                'focus-visible:ring-offset-2',
                'disabled:pointer-events-none',
                'disabled:opacity-50',
                'data-[state=active]:bg-background',
                'data-[state=active]:text-foreground',
                'data-[state=active]:shadow-sm'
            );
            expect(trigger).toHaveTextContent('Tab 1');
            expect(trigger).toHaveAttribute('value', 'tab1');
        });

        it('applies custom className', () => {
            render(<TabsTrigger className="custom-trigger-class" value="tab1">Tab</TabsTrigger>);
            const trigger = screen.getByTestId('tabs-trigger');
            expect(trigger).toHaveClass('custom-trigger-class');
            expect(trigger).toHaveClass('inline-flex', 'items-center');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLButtonElement>();
            render(<TabsTrigger ref={ref} value="tab1">Tab</TabsTrigger>);
            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        });

        it('passes through button props', () => {
            render(
                <TabsTrigger
                    value="tab1"
                    disabled
                    data-custom="trigger-test"
                    aria-label="Custom tab"
                >
                    Tab
                </TabsTrigger>
            );
            const trigger = screen.getByTestId('tabs-trigger');
            expect(trigger).toBeDisabled();
            expect(trigger).toHaveAttribute('data-custom', 'trigger-test');
            expect(trigger).toHaveAttribute('aria-label', 'Custom tab');
        });
    });

    describe('TabsContent', () => {
        it('renders with default classes', () => {
            render(<TabsContent value="tab1">Content 1</TabsContent>);
            const content = screen.getByTestId('tabs-content');
            expect(content).toBeInTheDocument();
            expect(content).toHaveClass(
                'mt-2',
                'ring-offset-background',
                'focus-visible:outline-none',
                'focus-visible:ring-2',
                'focus-visible:ring-ring',
                'focus-visible:ring-offset-2'
            );
            expect(content).toHaveTextContent('Content 1');
            expect(content).toHaveAttribute('value', 'tab1');
        });

        it('applies custom className', () => {
            render(<TabsContent className="custom-content-class" value="tab1">Content</TabsContent>);
            const content = screen.getByTestId('tabs-content');
            expect(content).toHaveClass('custom-content-class');
            expect(content).toHaveClass('mt-2', 'ring-offset-background');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<TabsContent ref={ref} value="tab1">Content</TabsContent>);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('passes through other props', () => {
            render(<TabsContent value="tab1" data-custom="content-test" id="content-id">Content</TabsContent>);
            const content = screen.getByTestId('tabs-content');
            expect(content).toHaveAttribute('data-custom', 'content-test');
            expect(content).toHaveAttribute('id', 'content-id');
        });

        it('renders children correctly', () => {
            render(
                <TabsContent value="tab1">
                    <div data-testid="content-child">Child Element</div>
                </TabsContent>
            );
            expect(screen.getByTestId('content-child')).toBeInTheDocument();
            expect(screen.getByText('Child Element')).toBeInTheDocument();
        });
    });

    describe('Complete Tabs Integration', () => {
        it('works together in a complete tabs setup', () => {
            render(
                <Tabs defaultValue="tab1" className="test-tabs">
                    <TabsList data-testid="complete-list">
                        <TabsTrigger value="tab1" data-testid="trigger-1">Tab 1</TabsTrigger>
                        <TabsTrigger value="tab2" data-testid="trigger-2">Tab 2</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" data-testid="content-1">
                        Content for Tab 1
                    </TabsContent>
                    <TabsContent value="tab2" data-testid="content-2">
                        Content for Tab 2
                    </TabsContent>
                </Tabs>
            );

            const tabs = screen.getByTestId('tabs-root');
            const list = screen.getByTestId('complete-list');
            const trigger1 = screen.getByTestId('trigger-1');
            const trigger2 = screen.getByTestId('trigger-2');
            const content1 = screen.getByTestId('content-1');
            const content2 = screen.getByTestId('content-2');

            expect(tabs).toHaveClass('test-tabs');
            expect(list).toBeInTheDocument();
            expect(trigger1).toHaveTextContent('Tab 1');
            expect(trigger2).toHaveTextContent('Tab 2');
            expect(content1).toHaveTextContent('Content for Tab 1');
            expect(content2).toHaveTextContent('Content for Tab 2');
        });

        it('works with minimal setup', () => {
            render(
                <Tabs defaultValue="single">
                    <TabsList>
                        <TabsTrigger value="single">Single Tab</TabsTrigger>
                    </TabsList>
                    <TabsContent value="single">Single Content</TabsContent>
                </Tabs>
            );

            expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
            expect(screen.getByText('Single Tab')).toBeInTheDocument();
            expect(screen.getByText('Single Content')).toBeInTheDocument();
        });
    });
}); 