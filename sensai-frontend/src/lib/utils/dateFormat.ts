/**
 * Formats a scheduled date for display in tooltips and buttons
 * @param date The date to format
 * @returns A human-readable string representation of the date
 */
export const formatScheduleDate = (date: Date | null): string => {
    if (!date) return "";

    // If the date is today, show "Today at [time]"
    const today = new Date();
    if (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()) {
        return `Today at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }

    // If the date is tomorrow, show "Tomorrow at [time]"
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()) {
        return `Tomorrow at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otherwise, show the full date
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formats a date for full display in tooltips
 * @param date The date to format
 * @returns A detailed string representation of the date
 */
export const formatFullScheduleDate = (date: Date | null): string => {
    if (!date) return "";
    
    return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}; 