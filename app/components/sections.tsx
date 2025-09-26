import React, { useState, useEffect } from 'react';

// Define the breakpoint for when the layout switches from stretched to scrollable
const BREAKPOINT = 768;

// Base styles for all elements
const baseStyles = {
    // Shared button style
    sectionButton: {
        padding: '8px 28px',
        border: '1px solid #444',
        borderRadius: '4px',
        backgroundColor: '#1a1a1a',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        color: 'white',
        textAlign: 'center' as const,
        minWidth: '100px', // Ensures a minimum readable size
    } as React.CSSProperties
};

export default function Sections() {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    // Effect to check screen size and add/remove resize listener
    const checkScreenSize = () => {
        setIsSmallScreen(window.innerWidth < BREAKPOINT);
    };

    useEffect(() => {
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // --- Dynamic Styles ---

    // 1. Container Style (changes based on screen size)
    const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'black',
        color: 'white',
        margin: '20px 0',
        padding: '0 10px',
        gap: '10px', // Consistent spacing between buttons
        flexDirection: 'row',

        // --- Small Screen (Scrollable) ---
        ...(isSmallScreen ? {
            flexWrap: 'nowrap',    // Prevent wrapping
            overflowX: 'auto',     // Enable horizontal scrolling
            justifyContent: 'flex-start', // Align items to the left
            msOverflowStyle: 'none',  // Hide scrollbar (IE/Edge)
            scrollbarWidth: 'none',   // Hide scrollbar (Firefox)
        } :
            // --- Large Screen (Full Width/Justified) ---
            {
                flexWrap: 'wrap', // Allow wrapping if screen is massive, but primarily to enable justification
                overflowX: 'hidden', // Disable scrolling
                justifyContent: 'space-around', // Distribute space evenly
            }),
    };

    // 2. Button Style (changes flex properties based on screen size)
    const buttonStyle: React.CSSProperties = {
        ...baseStyles.sectionButton,

        ...(isSmallScreen ? {
            // Small Screen: Buttons MUST NOT shrink, enabling scroll
            flexShrink: 0 as const,
            flexGrow: 0 as const,
            padding: '8px 20px', // Slightly less padding to accommodate more buttons
        } :
            // Large Screen: Buttons should GROW to fill the space
            {
                flexGrow: 1 as const,  // Crucial: allows button to grow and fill empty space
                flexShrink: 1 as const,
                maxWidth: '200px',     // Optional: Prevents buttons from becoming too wide on ultra-wide screens
            }),
    };


    const handleSectionClick = (sectionName: string) => {
        alert(`Navigating to ${sectionName} section.`);
    };

    return (
        <div style={containerStyle}>
            <div
                style={buttonStyle}
                onClick={() => handleSectionClick('Men')}
            >
                Men
            </div>
            <div
                style={buttonStyle}
                onClick={() => handleSectionClick('Women')}
            >
                Women
            </div>
            <div
                style={buttonStyle}
                onClick={() => handleSectionClick('Kids')}
            >
                Kids
            </div>
            <div
                style={buttonStyle}
                onClick={() => handleSectionClick('Stationary')}
            >
                Stationary
            </div>
            <div
                style={buttonStyle}
                onClick={() => handleSectionClick('Electronics')}
            >
                Electronics
            </div>
        </div>
    )
}