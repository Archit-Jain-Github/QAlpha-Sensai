import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';

// Mock @radix-ui/react-avatar
jest.mock('@radix-ui/react-avatar', () => ({
    Root: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
        <div ref={ref} className={className} data-testid="avatar-root" {...props}>
            {children}
        </div>
    )),
    Image: React.forwardRef<HTMLImageElement, any>(({ className, ...props }, ref) => (
        <img ref={ref} className={className} data-testid="avatar-image" {...props} />
    )),
    Fallback: React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, ref) => (
        <div ref={ref} className={className} data-testid="avatar-fallback" {...props}>
            {children}
        </div>
    )),
}));

describe('Avatar Components', () => {
    describe('Avatar Root', () => {
        it('renders with default classes', () => {
            render(<Avatar />);
            const avatar = screen.getByTestId('avatar-root');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveClass(
                'relative',
                'flex',
                'h-10',
                'w-10',
                'shrink-0',
                'overflow-hidden',
                'rounded-full'
            );
        });

        it('applies custom className', () => {
            render(<Avatar className="custom-avatar-class" />);
            const avatar = screen.getByTestId('avatar-root');
            expect(avatar).toHaveClass('custom-avatar-class');
            expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10');
        });

        it('passes through other props', () => {
            render(<Avatar data-custom="test-value" id="avatar-test" />);
            const avatar = screen.getByTestId('avatar-root');
            expect(avatar).toHaveAttribute('data-custom', 'test-value');
            expect(avatar).toHaveAttribute('id', 'avatar-test');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<Avatar ref={ref} />);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });

        it('renders children correctly', () => {
            render(
                <Avatar>
                    <div data-testid="child-element">Child Content</div>
                </Avatar>
            );
            expect(screen.getByTestId('child-element')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });
    });

    describe('AvatarImage', () => {
        it('renders with default classes', () => {
            render(<AvatarImage src="/test-image.jpg" alt="Test Avatar" />);
            const image = screen.getByTestId('avatar-image');
            expect(image).toBeInTheDocument();
            expect(image).toHaveClass('aspect-square', 'h-full', 'w-full');
            expect(image).toHaveAttribute('src', '/test-image.jpg');
            expect(image).toHaveAttribute('alt', 'Test Avatar');
        });

        it('applies custom className', () => {
            render(<AvatarImage className="custom-image-class" />);
            const image = screen.getByTestId('avatar-image');
            expect(image).toHaveClass('custom-image-class');
            expect(image).toHaveClass('aspect-square', 'h-full', 'w-full');
        });

        it('passes through image props', () => {
            render(
                <AvatarImage
                    src="/avatar.png"
                    alt="User Avatar"
                    loading="lazy"
                    crossOrigin="anonymous"
                />
            );
            const image = screen.getByTestId('avatar-image');
            expect(image).toHaveAttribute('src', '/avatar.png');
            expect(image).toHaveAttribute('alt', 'User Avatar');
            expect(image).toHaveAttribute('loading', 'lazy');
            expect(image).toHaveAttribute('crossorigin', 'anonymous');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLImageElement>();
            render(<AvatarImage ref={ref} />);
            expect(ref.current).toBeInstanceOf(HTMLImageElement);
        });
    });

    describe('AvatarFallback', () => {
        it('renders with default classes', () => {
            render(<AvatarFallback>AB</AvatarFallback>);
            const fallback = screen.getByTestId('avatar-fallback');
            expect(fallback).toBeInTheDocument();
            expect(fallback).toHaveClass(
                'flex',
                'h-full',
                'w-full',
                'items-center',
                'justify-center',
                'rounded-full',
                'bg-muted'
            );
            expect(fallback).toHaveTextContent('AB');
        });

        it('applies custom className', () => {
            render(<AvatarFallback className="custom-fallback-class">JD</AvatarFallback>);
            const fallback = screen.getByTestId('avatar-fallback');
            expect(fallback).toHaveClass('custom-fallback-class');
            expect(fallback).toHaveClass('flex', 'h-full', 'w-full');
        });

        it('renders children correctly', () => {
            render(
                <AvatarFallback>
                    <span data-testid="fallback-content">User</span>
                </AvatarFallback>
            );
            expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
            expect(screen.getByText('User')).toBeInTheDocument();
        });

        it('passes through other props', () => {
            render(<AvatarFallback data-custom="fallback-test" role="img">FB</AvatarFallback>);
            const fallback = screen.getByTestId('avatar-fallback');
            expect(fallback).toHaveAttribute('data-custom', 'fallback-test');
            expect(fallback).toHaveAttribute('role', 'img');
        });

        it('forwards ref correctly', () => {
            const ref = React.createRef<HTMLDivElement>();
            render(<AvatarFallback ref={ref}>Test</AvatarFallback>);
            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });
    });

    describe('Avatar Component Integration', () => {
        it('works together in a complete avatar setup', () => {
            render(
                <Avatar className="large-avatar">
                    <AvatarImage src="/user.jpg" alt="User Profile" />
                    <AvatarFallback>UN</AvatarFallback>
                </Avatar>
            );

            const avatar = screen.getByTestId('avatar-root');
            const image = screen.getByTestId('avatar-image');
            const fallback = screen.getByTestId('avatar-fallback');

            expect(avatar).toHaveClass('large-avatar');
            expect(image).toHaveAttribute('src', '/user.jpg');
            expect(fallback).toHaveTextContent('UN');
        });

        it('handles avatar with only fallback', () => {
            render(
                <Avatar>
                    <AvatarFallback>NO</AvatarFallback>
                </Avatar>
            );

            expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
            expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('NO');
            expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
        });

        it('handles avatar with only image', () => {
            render(
                <Avatar>
                    <AvatarImage src="/profile.png" alt="Profile" />
                </Avatar>
            );

            expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
            expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', '/profile.png');
            expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument();
        });
    });

    describe('Display Names', () => {
        it('components are properly exported', () => {
            // Verify components are properly exported and can be used
            expect(Avatar).toBeDefined();
            expect(AvatarImage).toBeDefined();
            expect(AvatarFallback).toBeDefined();
        });
    });
}); 