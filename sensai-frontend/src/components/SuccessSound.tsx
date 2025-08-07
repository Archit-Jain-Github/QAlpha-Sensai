"use client";

import { useEffect, useRef } from 'react';

interface SuccessSoundProps {
    play: boolean;
}

export default function SuccessSound({ play }: SuccessSoundProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Create a short success sound using AudioContext
    // This avoids the need for an external sound file
    const createSuccessSound = () => {
        try {
            const audioContext = new AudioContext();

            // Create an oscillator node for the sound
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Start at 800Hz
            oscillator.frequency.exponentialRampToValueAtTime(1300, audioContext.currentTime + 0.1); // Ramp up to 1300Hz
            oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.3); // Then down to 500Hz

            // Create a gain node to control volume
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05); // Fade in
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3); // Fade out

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Start and stop the oscillator
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.error("Error creating success sound:", error);
        }
    };

    useEffect(() => {
        // Play the sound when the play prop is true
        if (play) {
            createSuccessSound();
        }
    }, [play]);

    // No visual element to render
    return null;
} 