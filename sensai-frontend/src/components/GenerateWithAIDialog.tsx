"use client"

import { useState, useRef, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, File, ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

// Set worker source using CDN (keeps the bundle smaller)
// Only set this in non-test environments to avoid import.meta.url issues
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
    } catch (error) {
        // Fallback for environments that don't support import.meta.url
        console.warn('Could not set PDF worker source:', error);
    }
}

interface GenerateWithAIDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: GenerateWithAIFormData) => void;
    validationError?: string | null;
}

export interface GenerateWithAIFormData {
    courseDescription: string;
    intendedAudience: string;
    referencePdf: File | null;
    instructionsForAI: string;
}

type Step = 'description' | 'audience' | 'reference' | 'instructions' | 'review';

interface FormErrors {
    courseDescription?: string;
    intendedAudience?: string;
    referencePdf?: string;
}

export default function GenerateWithAIDialog({ open, onClose, onSubmit, validationError }: GenerateWithAIDialogProps) {
    const [formData, setFormData] = useState<GenerateWithAIFormData>({
        courseDescription: '',
        intendedAudience: '',
        referencePdf: null,
        instructionsForAI: ''
    });

    // Add form errors state
    const [errors, setErrors] = useState<FormErrors>({});

    // Track which step the user is currently on
    const [currentStep, setCurrentStep] = useState<Step>('description');
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add inside the component, after the existing state declarations
    const [fileValidating, setFileValidating] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    // Reset state when dialog is opened
    const resetState = () => {
        setFormData({
            courseDescription: '',
            intendedAudience: '',
            referencePdf: null,
            instructionsForAI: ''
        });
        setFileName('');
        setCurrentStep('description');
        setIsSubmitting(false);
        setErrors({});
        setFileError(null)
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user types
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };


    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setFileValidating(false);

        if (numPages > 100) {
            setFileError(`The PDF has too many pages (${numPages}). A maximum of 100 pages is supported at a time. Please upload a shorter document, or generate in multiple parts by uploading smaller sections.`);

            // Optionally remove the file if it's invalid
            removeFile();
        } else {
            console.log(`PDF validation passed: ${numPages} pages`);
            // We're keeping the file since it's valid
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // Reset previous validation errors
            setFileError(null);

            // Check file type
            if (file.type !== 'application/pdf') {
                setErrors(prev => ({ ...prev, referencePdf: 'Please upload a PDF file' }));
                return;
            }

            // Check file size (32MB = 32 * 1024 * 1024 bytes)
            const maxSize = 32 * 1024 * 1024; // 32MB in bytes
            if (file.size > maxSize) {
                setFileError("PDF file is too large. Please upload a file smaller than 32MB, or generate in multiple parts by uploading smaller sections.");
                return;
            }

            // Start validating
            setFileValidating(true);

            // Update form data with the file - page count validation will happen separately
            setFormData(prev => ({ ...prev, referencePdf: file }));
            setFileName(file.name);

            // Clear error if it exists
            if (errors.referencePdf) {
                setErrors(prev => ({ ...prev, referencePdf: undefined }));
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, referencePdf: null }));
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Call onSubmit (handleGenerateCourse) but don't wait for it 
            // since it handles its own state management
            onSubmit(formData);

            // Immediately close the dialog and reset its state
            resetState();
            onClose();
        } catch (error) {
            console.error('Error generating course:', error);
            setIsSubmitting(false);
        }
    };

    const validateCurrentStep = (): boolean => {
        let isValid = true;
        const newErrors: FormErrors = {};

        if (currentStep === 'description') {
            if (!formData.courseDescription.trim()) {
                newErrors.courseDescription = 'Please describe what the course is about';
                isValid = false;
            }
        }

        if (currentStep === 'audience') {
            if (!formData.intendedAudience.trim()) {
                newErrors.intendedAudience = 'Please specify who this course is for';
                isValid = false;
            }
        }

        if (currentStep === 'reference') {
            if (!formData.referencePdf) {
                newErrors.referencePdf = 'Please upload a reference material';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            return;
        }

        // Move to next step based on current step
        switch (currentStep) {
            case 'description':
                setCurrentStep('audience');
                break;
            case 'audience':
                setCurrentStep('reference');
                break;
            case 'reference':
                setCurrentStep('instructions');
                break;
            case 'instructions':
                setCurrentStep('review');
                break;
            case 'review':
                handleSubmit();
                break;
        }
    };

    const prevStep = () => {
        // Clear errors when going back
        setErrors({});

        // Move to previous step based on current step
        switch (currentStep) {
            case 'audience':
                setCurrentStep('description');
                break;
            case 'reference':
                setCurrentStep('audience');
                break;
            case 'instructions':
                setCurrentStep('reference');
                break;
            case 'review':
                setCurrentStep('instructions');
                break;
        }
    };

    // Create a handler that completely ignores outside clicks
    const handleDialogClose = () => {
        resetState();
        onClose();
    };

    // Simple no-op function that ignores all outside clicks
    const noop = () => {
        // Intentionally empty - this prevents the dialog from closing on outside clicks
    };

    // Get step heading and description based on current step
    const getStepContent = () => {
        switch (currentStep) {
            case 'description':
                return {
                    heading: 'What is this course about?',
                    description: 'Describe what the course is about, the topics to be covered, and the main learning objectives'
                };
            case 'audience':
                return {
                    heading: 'Who is this course for?',
                    description: 'Describe who this course is for, their expected background and what they hope to achieve'
                };
            case 'reference':
                return {
                    heading: 'Upload reference material',
                    description: 'Add a PDF file to be used as reference to generate your course'
                };
            case 'instructions':
                return {
                    heading: 'Instructions for AI (optional)',
                    description: 'Provide any specific instructions for AI to keep in mind while generating your course. For example, the tone, style, and format of the course'
                };
            case 'review':
                return {
                    heading: 'Review and generate',
                    description: 'Review your inputs before starting the course generation'
                };
        }
    };

    // Calculate progress percentage
    const progressPercentage = (() => {
        switch (currentStep) {
            case 'description': return 20;
            case 'audience': return 40;
            case 'reference': return 60;
            case 'instructions': return 80;
            case 'review': return 100;
        }
    })();

    const stepContent = getStepContent();

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={noop}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-[#1A1A1A] shadow-xl transition-all">
                                {/* Progress bar */}
                                <div className="h-1 bg-gray-800 w-full">
                                    <div
                                        className="h-full bg-white transition-all duration-300 ease-in-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={handleDialogClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>

                                <div className="p-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-2xl font-light text-white"
                                    >
                                        {stepContent.heading}
                                    </Dialog.Title>

                                    <p className="text-gray-400 mt-2 mb-6">
                                        {stepContent.description}
                                    </p>

                                    {/* Description Step */}
                                    {currentStep === 'description' && (
                                        <div className="space-y-2">
                                            <textarea
                                                id="courseDescription"
                                                name="courseDescription"
                                                value={formData.courseDescription}
                                                onChange={handleTextChange}
                                                placeholder="A comprehensive guide to personal finance for beginners, covering budgeting essentials, debt management, building credit, emergency funds, and basic investment principles for long-term financial stability."
                                                className={`w-full h-32 px-4 py-3 bg-[#0D0D0D] text-white rounded-lg font-light placeholder-gray-500 outline-none ${errors.courseDescription ? 'border-2 border-red-500' : 'border-none'} focus:ring-2 focus:ring-white/20`}
                                            />
                                            {errors.courseDescription && (
                                                <div className="flex items-center text-red-500 text-sm mt-1">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors.courseDescription}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Audience Step */}
                                    {currentStep === 'audience' && (
                                        <div className="space-y-2">
                                            <textarea
                                                id="intendedAudience"
                                                name="intendedAudience"
                                                value={formData.intendedAudience}
                                                onChange={handleTextChange}
                                                placeholder="Recent graduates and young professionals starting their first full-time job, individuals with no prior financial education, or anyone looking to establish healthy financial habits and avoid common money mistakes in early career stages."
                                                className={`w-full h-32 px-4 py-3 bg-[#0D0D0D] text-white rounded-lg font-light placeholder-gray-500 outline-none ${errors.intendedAudience ? 'border-2 border-red-500' : 'border-none'} focus:ring-2 focus:ring-white/20`}
                                            />
                                            {errors.intendedAudience && (
                                                <div className="flex items-center text-red-500 text-sm mt-1">
                                                    <AlertCircle size={14} className="mr-1" />
                                                    {errors.intendedAudience}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Reference Material Step */}
                                    {currentStep === 'reference' && (
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="application/pdf"
                                                className="hidden"
                                            />

                                            {!fileName ? (
                                                <div
                                                    onClick={triggerFileInput}
                                                    className={`flex items-center justify-center w-full h-36 px-4 py-3 bg-[#0A0A0A] rounded-lg cursor-pointer hover:bg-[#111] transition-colors ${(errors.referencePdf || fileError) ? 'border-2 border-red-500' : 'border border-dashed border-gray-600 hover:border-white'}`}
                                                >
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <Upload size={24} className="mb-2" />
                                                        <p className="text-sm">Upload a PDF to use as reference material</p>
                                                        <p className="text-xs mt-1">Click or drag and drop</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between w-full px-4 py-4 bg-[#0A0A0A] border border-gray-700 rounded-lg">
                                                    <div className="flex items-center text-white">
                                                        {fileValidating ? (
                                                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                                        ) : (
                                                            <File size={20} className="mr-2" />
                                                        )}
                                                        <span className="text-sm truncate max-w-xs">
                                                            {fileValidating ? "Validating PDF..." : fileName}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        className="text-gray-400 hover:text-white cursor-pointer"
                                                        aria-label="Remove file"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}

                                            {(errors.referencePdf || fileError) && (
                                                <div className="flex items-start text-red-500 text-sm mt-2">
                                                    <AlertCircle size={14} className="mr-1 mt-1 flex-shrink-0" />
                                                    <div>
                                                        {fileError || errors.referencePdf}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Additional Instructions Step */}
                                    {currentStep === 'instructions' && (
                                        <div className="space-y-2">
                                            <textarea
                                                id="instructionsForAI"
                                                name="instructionsForAI"
                                                value={formData.instructionsForAI}
                                                onChange={handleTextChange}
                                                placeholder="Focus on practical, actionable advice rather than theory. Include real-world examples and templates for budgeting. Structure the course for a 4-week learning period with small, achievable weekly goals."
                                                className="w-full h-32 px-4 py-3 bg-[#0D0D0D] text-white rounded-lg font-light placeholder-gray-500 outline-none border-none focus:ring-2 focus:ring-white/20"
                                            />
                                        </div>
                                    )}

                                    {/* Review Step */}
                                    {currentStep === 'review' && (
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <h4 className="text-white font-medium">Course Description</h4>
                                                <p className="text-gray-300 bg-[#0D0D0D] p-3 rounded-lg whitespace-pre-wrap">{formData.courseDescription}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-white font-medium">Intended Audience</h4>
                                                <p className="text-gray-300 bg-[#0D0D0D] p-3 rounded-lg whitespace-pre-wrap">{formData.intendedAudience}</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-white font-medium">Reference Material</h4>
                                                <div className="flex items-center text-gray-300 bg-[#0D0D0D] p-3 rounded-lg">
                                                    <File size={16} className="mr-2" />
                                                    <span>{fileName}</span>
                                                </div>
                                            </div>

                                            {formData.instructionsForAI && (
                                                <div className="space-y-3">
                                                    <h4 className="text-white font-medium">Instructions for AI</h4>
                                                    <p className="text-gray-300 bg-[#0D0D0D] p-3 rounded-lg whitespace-pre-wrap">{formData.instructionsForAI}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Step navigation buttons */}
                                <div className="flex justify-between px-6 py-4 bg-[#111] border-t border-gray-800">
                                    {currentStep !== 'description' ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                                        >
                                            <ArrowLeft size={16} className="mr-2" />
                                            Back
                                        </button>
                                    ) : (
                                        <div></div> // Empty div to maintain layout
                                    )}

                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-white text-black text-sm font-medium rounded-full hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        {isSubmitting && currentStep === 'review' ? (
                                            <>
                                                <div className="w-4 h-4 border-t-2 border-b-2 border-black rounded-full animate-spin mr-2"></div>
                                                Generating...
                                            </>
                                        ) : currentStep === 'review' ? (
                                            <>
                                                <span>Generate Course</span>
                                                <Check size={16} className="ml-2" />
                                            </>
                                        ) : (
                                            <>
                                                <span>Continue</span>
                                                <ArrowRight size={16} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {formData.referencePdf && (
                                    <Document file={formData.referencePdf} onLoadSuccess={onDocumentLoadSuccess}>
                                    </Document>

                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
} 