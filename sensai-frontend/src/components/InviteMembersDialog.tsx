"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Mail } from 'lucide-react';

interface InviteMembersDialogProps {
    open: boolean;
    onClose: () => void;
    onInvite: (emails: string[]) => void;
}

export default function InviteMembersDialog({ open, onClose, onInvite }: InviteMembersDialogProps) {
    const [emailRows, setEmailRows] = useState<string[]>(['']);
    const [errors, setErrors] = useState<string[]>(['']);
    const [showErrors, setShowErrors] = useState(false);
    const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset state when dialog is opened
    useEffect(() => {
        if (open) {
            setEmailRows(['']);
            setErrors(['']);
            setShowErrors(false);
            setFocusedInputIndex(null);
            inputRefs.current = [null];
        }
    }, [open]);

    // Update input refs array when number of rows changes
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, emailRows.length);
    }, [emailRows.length]);

    // Scroll to bottom and focus new input when new email is added
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
        // Focus the last input if it exists
        const lastInput = inputRefs.current[inputRefs.current.length - 1];
        if (lastInput && focusedInputIndex === emailRows.length - 1) {
            lastInput.focus();
        }
    }, [emailRows.length, focusedInputIndex]);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateEmail = (email: string): boolean => {
        return emailRegex.test(email);
    };

    const validateAllEmails = () => {
        return emailRows.map(email => {
            if (!email.trim()) return 'Email is required';
            if (!validateEmail(email)) return 'Please enter a valid email';
            return '';
        });
    };

    const handleEmailChange = (index: number, value: string) => {
        const newEmails = [...emailRows];
        newEmails[index] = value;
        setEmailRows(newEmails);

        // Update error for this specific email
        const newErrors = [...errors];
        if (!value.trim()) {
            newErrors[index] = 'Email is required';
        } else if (!validateEmail(value)) {
            newErrors[index] = 'Please enter a valid email';
        } else {
            newErrors[index] = '';
        }
        setErrors(newErrors);
    };

    const addEmailRow = () => {
        setEmailRows([...emailRows, '']);
        setErrors([...errors, '']);
        setFocusedInputIndex(emailRows.length);
        inputRefs.current = [...inputRefs.current, null];
    };

    const removeEmailRow = (index: number) => {
        const newEmails = emailRows.filter((_, i) => i !== index);
        const newErrors = errors.filter((_, i) => i !== index);
        setEmailRows(newEmails);
        setErrors(newErrors);
    };

    const handleSubmit = () => {
        // Validate all emails
        const newErrors = validateAllEmails();
        setErrors(newErrors);
        setShowErrors(true);

        // If there are any errors, don't proceed
        if (newErrors.some(error => error)) {
            return;
        }

        // Filter out any empty emails and submit
        const validEmails = emailRows.filter(email => email.trim() && validateEmail(email));
        onInvite(validEmails);
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-[#1A1A1A] rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Dialog Content */}
                <div className="p-6 mt-4">
                    <div
                        ref={scrollContainerRef}
                        className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
                    >
                        {emailRows.map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <Mail
                                                size={18}
                                                className={`transition-colors ${focusedInputIndex === index ? 'text-white' : 'text-gray-500'}`}
                                            />
                                        </div>
                                        <input
                                            ref={el => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="email"
                                            value={email}
                                            onChange={(e) => handleEmailChange(index, e.target.value)}
                                            onFocus={() => setFocusedInputIndex(index)}
                                            onBlur={() => setFocusedInputIndex(null)}
                                            placeholder="Enter email address"
                                            className={`w-full bg-[#0A0A0A] pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none ${errors[index] && focusedInputIndex !== index
                                                ? 'border-2 border-red-500'
                                                : focusedInputIndex === index
                                                    ? 'border border-white'
                                                    : 'border-0'
                                                } focus:border focus:!border-white focus:ring-0 transition-all duration-0`}
                                        />
                                    </div>
                                    {errors[index] && showErrors && focusedInputIndex !== index && (
                                        <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
                                    )}
                                </div>
                                {emailRows.length > 1 && (
                                    <button
                                        onClick={() => removeEmailRow(index)}
                                        className="text-gray-400 hover:text-white transition-colors p-2 cursor-pointer focus:outline-none self-start mt-1.5"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={addEmailRow}
                        className="flex items-center gap-2 text-gray-400 hover:text-white w-full py-3 px-4 rounded-lg transition-colors mt-2 cursor-pointer focus:outline-none hover:bg-[#111]"
                    >
                        <Plus size={20} />
                        <span>Add another email</span>
                    </button>
                </div>

                {/* Dialog Footer */}
                <div className="flex justify-end gap-4 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-white text-black text-sm font-medium rounded-full hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    );
} 