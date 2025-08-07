import React, { useState, ReactNode } from 'react';

interface SimpleTooltipProps {
    children: ReactNode;
    text: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {children}
            </div>

            {showTooltip && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 rounded bg-gray-900 text-white text-xs whitespace-nowrap"
                    style={{ zIndex: 10000 }}
                >
                    {text}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default SimpleTooltip; 