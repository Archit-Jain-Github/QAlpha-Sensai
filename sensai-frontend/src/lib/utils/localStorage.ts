// Safe localStorage wrapper to handle SSR and errors
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            if (typeof window !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }
}; 