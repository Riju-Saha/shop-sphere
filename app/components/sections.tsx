import React, { useState, useEffect } from 'react';

const BREAKPOINT = 768;

const baseStyles = {
    sectionButton: {
        padding: '8px 28px',
        border: '1px solid #444',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        textAlign: 'center' as const,
        minWidth: '100px',
        transition: 'background-color 0.2s, color 0.2s',
    } as React.CSSProperties
};

export default function Sections() {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [activeSection, setActiveSection] = useState('Men');

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

    const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'black',
        color: 'white',
        margin: '20px 0',
        padding: '0 10px',
        gap: '10px',
        flexDirection: 'row',
    };

    const contentStyle: React.CSSProperties = {
        padding: '20px',
        textAlign: 'center',
        fontSize: '1.2rem',
        color: 'white', // Assuming context color is white
        backgroundColor: '#111', // Dark background for the content box
        margin: '10px 0',
        borderRadius: '8px',
    };

    if (isSmallScreen) {
        containerStyle.flexWrap = 'nowrap';
        containerStyle.overflowX = 'auto';
        containerStyle.justifyContent = 'flex-start';
        (containerStyle as any).msOverflowStyle = 'none';
        (containerStyle as any).scrollbarWidth = 'none';
    } else {
        containerStyle.flexWrap = 'wrap';
        containerStyle.overflowX = 'hidden';
        containerStyle.justifyContent = 'space-around';
    }


    const handleSectionClick = (sectionName: string) => {
        setActiveSection(sectionName);
    };

    const getFinalButtonStyle = (sectionName: string): React.CSSProperties => {
        const isActive = activeSection === sectionName;

        const style: React.CSSProperties = {
            padding: baseStyles.sectionButton.padding,
            border: baseStyles.sectionButton.border,
            borderRadius: baseStyles.sectionButton.borderRadius,
            cursor: baseStyles.sectionButton.cursor,
            fontSize: baseStyles.sectionButton.fontSize,
            fontWeight: baseStyles.sectionButton.fontWeight,
            textAlign: baseStyles.sectionButton.textAlign,
            minWidth: baseStyles.sectionButton.minWidth,
            transition: baseStyles.sectionButton.transition,

            // Active/Inactive Colors
            backgroundColor: isActive ? 'white' : '#1a1a1a',
            color: isActive ? 'black' : 'white',
            borderColor: isActive ? 'white' : '#444',
        };

        if (isSmallScreen) {
            style.flexShrink = 0 as const;
            style.flexGrow = 0 as const;
            style.padding = '8px 20px';
        } else {
            style.flexGrow = 1 as const;
            style.flexShrink = 1 as const;
            style.maxWidth = '200px';
        }

        return style;
    };

    const sections = ['Men', 'Women', 'Kids', 'Stationary', 'Electronics'];

    return (
        <>
            <div style={containerStyle}>
                {sections.map((section) => (
                    <div
                        key={section}
                        style={getFinalButtonStyle(section)}
                        onClick={() => handleSectionClick(section)}
                    >
                        {section}
                    </div>
                ))}
            </div>
            {/* {sections.map((section) => (
                activeSection === section && (
                    <div
                        key={section}
                        style={contentStyle}
                    >
                        <p>This is the {section} section content.</p>
                        {section === 'Men' && <p>Browse the latest collections for men here!</p>}
                        {section === 'Women' && <p>Browse the latest collections for women here!</p>}
                        {section === 'Kids' && <p>Browse the latest collections for kids here!</p>}
                        {section === 'Stationary' && <p>Browse the latest collections for stationary here!</p>}
                        {section === 'Electronics' && <p>See our top deals on gadgets and smart devices.</p>}
                    </div>
                )
            ))} */}
        </>
    )
}