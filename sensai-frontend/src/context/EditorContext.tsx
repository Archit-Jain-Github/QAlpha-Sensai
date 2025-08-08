import React, { createContext, useContext, useState, useCallback } from 'react';

export type BlockType = 'paragraph' | 'heading' | 'bulletListItem' | 'numberedListItem' | 'checkListItem' | 'codeBlock' | 'video' | 'image' | 'audio';

export interface Block {
    id: string;
    type: BlockType;
    content: string;
    indent?: number;
}

interface EditorContextType {
    blocks: Block[];
    focusedBlockId: string | null;
    setFocusedBlockId: (id: string | null) => void;
    addBlock: (blockType: BlockType, afterId?: string, showMenu?: boolean) => string;
    updateBlockContent: (id: string, content: string) => void;
    updateBlockType: (id: string, type: BlockType) => void;
    deleteBlock: (id: string) => void;
    moveBlockUp: (id: string) => void;
    moveBlockDown: (id: string) => void;
    indentBlock: (id: string) => void;
    outdentBlock: (id: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};

const generateId = () => `block-${Math.random().toString(36).substring(2, 9)}`;

interface EditorProviderProps {
    children: React.ReactNode;
    initialBlocks?: Block[];
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
    children,
    initialBlocks = [{ id: generateId(), type: 'paragraph', content: '', indent: 0 }],
}) => {
    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    const addBlock = useCallback((blockType: BlockType = 'paragraph', afterId?: string, showMenu = true) => {
        const newBlock = { id: generateId(), type: blockType, content: '', indent: 0 };

        setBlocks(prevBlocks => {
            if (!afterId) {
                return [...prevBlocks, newBlock];
            }

            const index = prevBlocks.findIndex(block => block.id === afterId);
            if (index === -1) {
                return [...prevBlocks, newBlock];
            }

            const newBlocks = [...prevBlocks];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });

        // Set focus to the new block
        setTimeout(() => setFocusedBlockId(newBlock.id), 0);

        return newBlock.id;
    }, []);

    const updateBlockContent = useCallback((id: string, content: string) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === id ? { ...block, content } : block
            )
        );
    }, []);

    const updateBlockType = useCallback((id: string, type: BlockType) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === id ? { ...block, type } : block
            )
        );
    }, []);

    const deleteBlock = useCallback((id: string) => {
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(block => block.id === id);
            const newBlocks = prevBlocks.filter(block => block.id !== id);

            // Don't allow deleting last block
            if (newBlocks.length === 0) {
                return [{ id: generateId(), type: 'paragraph', content: '', indent: 0 }];
            }

            // Set focus to previous or next block
            if (index > 0) {
                setTimeout(() => setFocusedBlockId(prevBlocks[index - 1].id), 0);
            } else if (index === 0 && newBlocks.length > 0) {
                setTimeout(() => setFocusedBlockId(newBlocks[0].id), 0);
            }

            return newBlocks;
        });
    }, []);

    const moveBlockUp = useCallback((id: string) => {
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(block => block.id === id);
            if (index <= 0) return prevBlocks;

            const newBlocks = [...prevBlocks];
            const block = newBlocks[index];
            newBlocks[index] = newBlocks[index - 1];
            newBlocks[index - 1] = block;

            return newBlocks;
        });
    }, []);

    const moveBlockDown = useCallback((id: string) => {
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(block => block.id === id);
            if (index === -1 || index === prevBlocks.length - 1) return prevBlocks;

            const newBlocks = [...prevBlocks];
            const block = newBlocks[index];
            newBlocks[index] = newBlocks[index + 1];
            newBlocks[index + 1] = block;

            return newBlocks;
        });
    }, []);

    const indentBlock = useCallback((id: string) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === id ? { ...block, indent: (block.indent || 0) + 1 } : block
            )
        );
    }, []);

    const outdentBlock = useCallback((id: string) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block => {
                if (block.id === id && block.indent && block.indent > 0) {
                    return { ...block, indent: block.indent - 1 };
                }
                return block;
            })
        );
    }, []);

    const value = {
        blocks,
        focusedBlockId,
        setFocusedBlockId,
        addBlock,
        updateBlockContent,
        updateBlockType,
        deleteBlock,
        moveBlockUp,
        moveBlockDown,
        indentBlock,
        outdentBlock,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};
