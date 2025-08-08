"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";

// Add import for date picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Add custom styles for dark mode
import "./editor-styles.css";

// Import the BlockNoteEditor component
import BlockNoteEditor from "./BlockNoteEditor";
import ConfirmationDialog from "./ConfirmationDialog";
import { TaskData } from "@/types";
import { safeLocalStorage } from "@/lib/utils/localStorage";

// Add import for ChatView
import ChatView from "./ChatView";
import { ChatMessage } from "../types/quiz";

// Add import for PublishConfirmationDialog
import PublishConfirmationDialog from "./PublishConfirmationDialog";

// Define the editor handle with methods that can be called by parent components
export interface LearningMaterialEditorHandle {
    save: () => Promise<void>;
    cancel: () => void;
    hasContent: () => boolean;
    hasChanges: () => boolean;
}

interface LearningMaterialEditorProps {
    onChange?: (content: any[]) => void;
    isDarkMode?: boolean;
    className?: string;
    readOnly?: boolean;
    viewOnly?: boolean;
    showPublishConfirmation?: boolean;
    onPublishConfirm?: () => void;
    onPublishCancel?: () => void;
    taskId?: string;
    userId?: string;
    onPublishSuccess?: (updatedData?: TaskData) => void;
    onSaveSuccess?: (updatedData?: TaskData) => void;
    scheduledPublishAt?: string | null;
}

// Use forwardRef to pass the ref from parent to this component
const LearningMaterialEditor = forwardRef<LearningMaterialEditorHandle, LearningMaterialEditorProps>(({
    onChange,
    isDarkMode = true, // Default to dark mode
    className = "",
    readOnly = false,
    viewOnly = false,
    showPublishConfirmation = false,
    onPublishConfirm,
    onPublishCancel,
    taskId,
    userId = '',
    onPublishSuccess,
    onSaveSuccess,
    scheduledPublishAt = null,
}, ref) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editorContent, setEditorContent] = useState<any[]>([]);

    // Reference to the editor instance
    const editorRef = useRef<any>(null);

    // Add a ref to store the original data for reverting on cancel
    const originalDataRef = useRef<TaskData | null>(null);

    // Function to set the editor reference
    const setEditorInstance = (editor: any) => {
        editorRef.current = editor;
    };

    // Handle editor changes
    const handleEditorChange = (content: any[]) => {
        // Avoid unnecessary state updates if content hasn't changed
        if (JSON.stringify(content) !== JSON.stringify(editorContent)) {
            setEditorContent(content);
            if (onChange && !isPublishing) {
                onChange(content);
            }
        }
    };

    const initialContent = taskData?.blocks && taskData.blocks.length > 0 ? taskData.blocks : undefined;

    // Fetch task data when taskId changes
    useEffect(() => {
        if (taskId) {
            setIsLoading(true);

            // Use AbortController to cancel any in-flight requests
            const controller = new AbortController();

            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}`, {
                signal: controller.signal
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch task: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // We only use the data fetched from our own API call
                    // Title updates only happen after publishing, not during editing
                    if (!data.blocks || data.blocks.length === 0) {
                        data.blocks = [
                            {
                                type: "heading",
                                props: { level: 2 },
                                content: [{ "text": "Welcome to the Learning material editor!", "type": "text", styles: {} }],
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "This is where you will create your learning material. You can either modify this template or remove it entirely to start from scratch.", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "heading",
                                props: { level: 3 },
                                content: [{ "text": "Key Features", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Add new blocks by clicking the + icon that appears between blocks", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Reorder blocks using the side menu (hover near the left edge of any block and drag the button with 6 dots to reorder)", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Format text using the toolbar that appears when you select text", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "heading",
                                props: { level: 3 },
                                content: [{ "text": "Available Block Types", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Here are some examples of the different types of blocks you can use:", "type": "text", styles: {} }]
                            },
                            {
                                type: "heading",
                                props: { level: 2 },
                                content: [{ "text": "Headings (like this one)", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Bullet lists (like this)", "type": "text", styles: {} }]
                            },
                            {
                                type: "numberedListItem",
                                content: [{ "text": "Numbered lists (like this)", "type": "text", styles: {} }]
                            },
                            {
                                type: "checkListItem",
                                content: [{ "text": "Check lists (like this)", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Regular paragraphs for your main content", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Insert images/videos/audio clips by clicking the + icon on the left and selecting Image/Video/Audio", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Insert code blocks by clicking the + icon on the left and selecting Code Block", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "heading",
                                props: { level: 3 },
                                content: [{ "text": "Creating Nested Content", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "You can create nested content in two ways:", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Using the Tab key: Simply press Tab while your cursor is on a block to indent it", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Using the side menu: Hover near the left edge of a block, click the menu icon (the button with 6 dots), and drag the block to the desired nested position inside another block", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Here are examples of nested content:", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Nested Lists Example", "type": "text", styles: { "bold": true } }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Main topic 1", "type": "text", styles: {} }],
                                children: [
                                    {
                                        type: "bulletListItem",
                                        props: { indent: 1 },
                                        content: [{ "text": "Subtopic 1.1 (indented using Tab or side menu)", "type": "text", styles: {} }]
                                    },
                                    {
                                        type: "bulletListItem",
                                        props: { indent: 1 },
                                        content: [{ "text": "Subtopic 1.2", "type": "text", styles: {} }],
                                        children: [{
                                            type: "bulletListItem",
                                            props: { indent: 2 },
                                            content: [{ "text": "Further nested item (press Tab again to create deeper nesting)", "type": "text", styles: {} }]
                                        }]
                                    }
                                ]
                            },

                            {
                                type: "bulletListItem",
                                content: [{ "text": "Main topic 2", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Nested Numbered Lists", "type": "text", styles: { "bold": true } }],
                            },

                            {
                                type: "numberedListItem",
                                content: [{ "text": "First step", "type": "text", styles: {} }],
                                children: [
                                    {
                                        type: "numberedListItem",
                                        props: { indent: 1 },
                                        content: [{ "text": "Substep 1.1 (indented with Tab)", "type": "text", styles: {} }]
                                    },
                                    {
                                        type: "numberedListItem",
                                        props: { indent: 1 },
                                        content: [{ "text": "Substep 1.2", "type": "text", styles: {} }]
                                    },
                                ]
                            },
                            {
                                type: "numberedListItem",
                                content: [{ "text": "Second step", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Tips for working with nested content:", "type": "text", styles: { "bold": true } }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "To unnest/outdent an item, press Shift+Tab", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "You can mix bullet and numbered lists in your nesting hierarchy", "type": "text", styles: {} }]
                            },
                            {
                                type: "bulletListItem",
                                content: [{ "text": "Nesting helps create a clear organizational structure for complex topics", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "", "type": "text", styles: {} }]
                            },
                            {
                                type: "heading",
                                props: { level: 3 },
                                content: [{ "text": "Publishing Your Content", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "When you are ready to make your content available to learners, click the Publish button. You can always edit and republish your content later.", "type": "text", styles: {} }]
                            },
                            {
                                type: "paragraph",
                                content: [{ "text": "Feel free to delete or modify this template to create your own learning material!", "type": "text", styles: {} }]
                            }
                        ];
                    }

                    setTaskData(data);

                    // Store the original data for reverting on cancel
                    originalDataRef.current = { ...data };

                    // Initialize editorContent with the blocks from taskData
                    if (data.blocks && data.blocks.length > 0) {
                        setEditorContent(data.blocks);
                    }

                    setIsLoading(false);
                })
                .catch(error => {
                    // Ignore AbortError as it's expected when navigating away
                    if (error.name !== 'AbortError') {
                        console.error("Error fetching task data:", error);
                    }
                    setIsLoading(false);
                });

            // Clean up function will abort the fetch if the component unmounts
            // or if the effect runs again (i.e., taskId changes)
            return () => {
                controller.abort();
            };
        } else {
            // If no taskId is provided, set loading to false immediately
            // so the component can render the editor
            setIsLoading(false);
        }
    }, [taskId]);

    // Handle cancel in edit mode - revert to original data
    const handleCancel = () => {
        if (!originalDataRef.current) return;

        // Restore the original data
        setTaskData(originalDataRef.current);

        // Return the original title to the dialog header
        const dialogTitleElement = document.querySelector('.dialog-content-editor')?.parentElement?.querySelector('h2');
        if (dialogTitleElement && originalDataRef.current.title) {
            dialogTitleElement.textContent = originalDataRef.current.title;
        }
    };

    const handleConfirmPublish = async (scheduledPublishAt: string | null) => {
        if (!taskId) {
            console.error("Cannot publish: taskId is not provided");
            setPublishError("Cannot publish: Task ID is missing");
            return;
        }

        setIsPublishing(true);
        setPublishError(null);

        try {
            // Get the current title from the dialog - it may have been edited
            const dialogTitleElement = document.querySelector('.dialog-content-editor')?.parentElement?.querySelector('h2');
            const currentTitle = dialogTitleElement?.textContent || taskData?.title || "";

            // Use the current editor content
            const currentContent = editorContent.length > 0 ? editorContent : (taskData?.blocks || []);

            // Add scheduled publishing data if selected
            const publishData: any = {
                title: currentTitle,
                blocks: currentContent,
                scheduled_publish_at: scheduledPublishAt
            };

            // Make POST request to publish the learning material content
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}/learning_material`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(publishData),
            });

            if (!response.ok) {
                throw new Error(`Failed to publish learning material: ${response.status}`);
            }

            // Get the updated task data from the response
            const updatedTaskData = await response.json();

            // Ensure the status is set correctly based on scheduled status
            const publishedTaskData = {
                ...updatedTaskData,
                status: 'published',
                title: currentTitle,   // Use the current title from the dialog
                scheduled_publish_at: scheduledPublishAt // Include scheduled date
            };

            // Update our local state with the data from the API
            setTaskData(publishedTaskData);

            // First set publishing to false to avoid state updates during callbacks
            setIsPublishing(false);

            // Call the original onPublishConfirm callback if provided
            if (onPublishConfirm) {
                onPublishConfirm();
            }

            // Call the onPublishSuccess callback if provided
            if (onPublishSuccess) {
                // Use setTimeout to break the current render cycle
                setTimeout(() => {
                    onPublishSuccess(publishedTaskData);
                }, 0);
            }
        } catch (error) {
            console.error("Error publishing learning material:", error);
            setPublishError(error instanceof Error ? error.message : "Failed to publish learning material");
            setIsPublishing(false);
        }
    };

    const handleCancelPublish = () => {
        setPublishError(null);
        if (onPublishCancel) {
            onPublishCancel();
        }
    };

    // Handle saving changes when in edit mode
    const handleSave = async () => {
        if (!taskId) {
            console.error("Cannot save: taskId is not provided");
            return;
        }

        try {
            // Get the current title from the dialog - it may have been edited
            const dialogTitleElement = document.querySelector('.dialog-content-editor')?.parentElement?.querySelector('h2');
            const currentTitle = dialogTitleElement?.textContent || taskData?.title || "";

            // Use the current editor content
            const currentContent = editorContent.length > 0 ? editorContent : (taskData?.blocks || []);

            // Use the scheduledPublishAt prop instead of taskData.scheduled_publish_at
            const currentScheduledPublishAt = scheduledPublishAt !== undefined ? scheduledPublishAt : (taskData?.scheduled_publish_at || null);

            // Make POST request to update the learning material content, keeping the same status
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tasks/${taskId}/learning_material`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: currentTitle,
                    blocks: currentContent,
                    scheduled_publish_at: currentScheduledPublishAt,
                    status: taskData?.status
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save learning material: ${response.status}`);
            }

            // Get the updated task data from the response
            const updatedTaskData = await response.json();

            // Create updated data with the current title
            const updatedData = {
                ...updatedTaskData,
                title: currentTitle // Use the current title from the dialog
            };

            // Update our local state with the data from the API
            setTaskData(updatedData);

            // Call the onSaveSuccess callback if provided
            if (onSaveSuccess) {
                // Use setTimeout to break the current render cycle
                setTimeout(() => {
                    onSaveSuccess(updatedData);
                }, 0);
            }
        } catch (error) {
            console.error("Error saving learning material:", error);
        }
    };

    // Update the content when it changes
    useEffect(() => {
        if (onChange && taskData?.blocks) {
            onChange(taskData.blocks);
        }
    }, [taskData?.blocks, onChange]);

    // Expose methods via the forwarded ref
    useImperativeHandle(ref, () => ({
        save: handleSave,
        cancel: handleCancel,
        hasContent: () => {
            // First check the editorContent state
            const checkContent = (content: any[] | undefined) => {
                if (!content || content.length === 0) return false;

                // Check if there are any blocks beyond the first default paragraph
                if (content.length > 1) return true;

                // If there's only one block, check if it has actual content
                if (content.length === 1) {
                    const block = content[0];
                    // Use stringify to check if there's actual content
                    const blockContent = JSON.stringify(block.content);
                    // Check if it's not just an empty paragraph
                    if (blockContent &&
                        blockContent !== '{}' &&
                        blockContent !== '[]' &&
                        blockContent !== 'null' &&
                        blockContent !== '{"text":[]}' &&
                        blockContent !== '{"text":""}') {
                        return true;
                    }
                }

                return false;
            };

            // First check editorContent (which might be updated if user made changes)
            if (checkContent(editorContent)) {
                return true;
            }

            // If editorContent is empty but we have taskData, check that as a fallback
            if (taskData?.blocks) {
                return checkContent(taskData.blocks);
            }

            return false;
        },
        hasChanges: () => {
            // If we don't have original data to compare with, assume no changes
            if (!originalDataRef.current) return false;

            // Check if title has changed
            const dialogTitleElement = document.querySelector('.dialog-content-editor')?.parentElement?.querySelector('h2');
            const currentTitle = dialogTitleElement?.textContent || "";
            const originalTitle = originalDataRef.current.title || "";

            if (currentTitle !== originalTitle) {
                return true;
            }

            // Check if content has changed
            const originalContent = originalDataRef.current.blocks || [];

            // Convert both to JSON strings for deep comparison
            const currentContentStr = JSON.stringify(editorContent);
            const originalContentStr = JSON.stringify(originalContent);

            // Return true if there are changes
            return currentContentStr !== originalContentStr;
        }
    }));

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div
                    data-testid="editor-loading-spinner"
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"
                    aria-label="Loading..."
                >
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full ${className}`}>
            <div className="w-full flex flex-col my-4">
                <div className={`editor-container h-full min-h-screen overflow-y-auto overflow-hidden relative z-0`}>
                    <BlockNoteEditor
                        initialContent={initialContent}
                        onChange={handleEditorChange}
                        isDarkMode={isDarkMode}
                        readOnly={readOnly}
                        className="dark-editor min-h-screen"
                        onEditorReady={setEditorInstance}
                    />
                </div>
            </div>

            {/* Replace the ConfirmationDialog with PublishConfirmationDialog */}
            <PublishConfirmationDialog
                show={showPublishConfirmation}
                title="Ready to publish?"
                message="Make sure your content is complete and reviewed for errors before publishing"
                onConfirm={handleConfirmPublish}
                onCancel={handleCancelPublish}
                isLoading={isPublishing}
                errorMessage={publishError}
            />
        </div>
    );
});

// Add display name for better debugging
LearningMaterialEditor.displayName = 'LearningMaterialEditor';

export default LearningMaterialEditor;