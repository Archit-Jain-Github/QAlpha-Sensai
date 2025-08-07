import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DropdownOption<T = any> {
    id: string | number;
    label: ReactNode;
    value: T;
}

interface MobileDropdownProps<T = any> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    options: DropdownOption<T>[];
    selectedId?: string | number;
    onSelect: (option: DropdownOption<T>) => void;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    closeButtonClassName?: string;
    optionClassName?: string;
    selectedOptionClassName?: string;
    renderOption?: (option: DropdownOption<T>, isSelected: boolean) => ReactNode;
}

function MobileDropdown<T = any>({
    isOpen,
    onClose,
    title,
    options,
    selectedId,
    onSelect,
    className = '',
    contentClassName = '',
    titleClassName = '',
    closeButtonClassName = '',
    optionClassName = '',
    selectedOptionClassName = '',
    renderOption
}: MobileDropdownProps<T>) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [animateIn, setAnimateIn] = React.useState(false);

    // Handle animation when opening and closing
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isOpen) {
            // Trigger animation after a small delay to ensure render
            timeoutId = setTimeout(() => setAnimateIn(true), 10);

            // Lock body scroll when dropdown is open
            if (typeof document !== 'undefined') {
                document.body.style.overflow = 'hidden';
            }
        } else {
            setAnimateIn(false);
        }

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (typeof document !== 'undefined') {
                document.body.style.overflow = '';
            }
        };
    }, [isOpen]);

    // Return null if not open
    if (!isOpen) return null;

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // Handle option selection
    const handleOptionSelect = (option: DropdownOption<T>) => {
        onSelect(option);
        onClose();
    };

    // Check if an option is selected
    const isOptionSelected = (option: DropdownOption<T>) => {
        return selectedId !== undefined && option.id === selectedId;
    };

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col justify-end transition-opacity duration-300 ease-in-out ${animateIn ? 'opacity-100' : 'opacity-0'} ${className}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={dropdownRef}
                className={`w-full bg-gradient-to-b from-slate-800 via-zinc-900 
             to-stone-900 border-t border-slate-700 rounded-t-xl p-4 transition-transform duration-300 ease-in-out max-h-[80vh] overflow-auto ${animateIn ? 'translate-y-0' : 'translate-y-full'} ${contentClassName}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-white font-light text-lg ${titleClassName}`}>{title}</h3>
                    <button
                        onClick={onClose}
                        className={`text-slate-300 hover:text-white transition-colors cursor-pointer ${closeButtonClassName}`}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-1 max-h-[calc(80vh-60px)]">
                    {options.map(option => (
                        <button
                            key={option.id}
                            className={`flex w-full items-center p-4 text-left rounded-lg my-1 transition-colors cursor-pointer ${isOptionSelected(option)
                                ? `bg-gradient-to-r from-slate-800 to-zinc-800 bg-opacity-90`
                                : `hover:bg-slate-800 hover:bg-opacity-50`
                                }`}
                            onClick={() => handleOptionSelect(option)}
                        >
                            {renderOption ? renderOption(option, isOptionSelected(option)) : option.label}
                        </button>
                    ))}
                </div>

                {/* Spacer for bottom safety area */}
                <div className="h-6" />
            </div>
        </div>
    );
}

export default MobileDropdown; 