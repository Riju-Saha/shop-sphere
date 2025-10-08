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

const subcategoriesKeys = ['Men', 'Women', 'Kids', 'Stationary', 'Electronics'] as const;
type CategoryKey = typeof subcategoriesKeys[number] | 'All';

export default function Sections({ onCategoryClick }: { onCategoryClick: (category: CategoryKey) => void }) {
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

        useEffect(() => {
        onCategoryClick('Men');
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
        onCategoryClick(sectionName as CategoryKey);
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

            backgroundColor: isActive ? '#0e6fde' : '#1a1a1a',
            color: isActive ? 'white' : 'white',
            borderColor: isActive ? '#0e6fde' : '#444',
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
        </>
    );
}