"use client";

import { useEffect, useRef } from 'react';

interface ModuleCompletionSoundProps {
    play: boolean;
}

export default function ModuleCompletionSound({ play }: ModuleCompletionSoundProps) {
    // Create a more impressive victory sound using AudioContext
    const createVictorySound = () => {
        try {
            const audioContext = new AudioContext();

            // Function to create our oscillators
            const createOscillator = (type: OscillatorType, frequency: number, delay: number, duration: number, gainValue: number) => {
                const oscillator = audioContext.createOscillator();
                oscillator.type = type;
                oscillator.frequency.value = frequency;

                const gainNode = audioContext.createGain();
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + delay + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + delay + duration);

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start(audioContext.currentTime + delay);
                oscillator.stop(audioContext.currentTime + delay + duration);
            };

            // First thumping bass sound
            createOscillator('sine', 150, 0, 0.3, 0.8);

            // Second thumping bass sound (slightly higher pitch)
            createOscillator('sine', 180, 0.2, 0.3, 0.8);

            // Victory melody notes
            createOscillator('sine', 400, 0.4, 0.2, 0.5);
            createOscillator('sine', 600, 0.6, 0.2, 0.5);
            createOscillator('sine', 800, 0.8, 0.4, 0.5);

            // Add a final triumphant chord
            createOscillator('sine', 400, 1.2, 0.5, 0.4); // Base note
            createOscillator('sine', 500, 1.2, 0.5, 0.3); // Middle note
            createOscillator('sine', 600, 1.2, 0.5, 0.3); // Top note

        } catch (error) {
            console.error("Error creating module completion sound:", error);
        }
    };

    useEffect(() => {
        // Play the sound when the play prop is true
        if (play) {
            createVictorySound();
        }
    }, [play]);

    // No visual element to render
    return null;
} 