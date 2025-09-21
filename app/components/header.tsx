'use client'
import React from 'react'
import Image from 'next/image'
import logo from '../../public/logo.png'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Header() {
    const router = useRouter();

    const handleHome = () => {
        router.push('/')
    }

    return (
        <>
            <style jsx>{`
                .responsive-header {
                    padding: 0 1rem;
                }
                @media (max-width: 600px) {
                    .responsive-header {
                        padding: 0 0.5rem;
                    }
                }
            `}</style>
            <header className="responsive-header" style={styles.headerStyles}>
                <div style={styles.logoContainerStyles} onClick={handleHome}>
                    <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
                    <Button style={styles.logoNameStyles}>Shop Sphere</Button>
                </div>
            </header>
        </>
    )
}

const styles = {
    headerStyles: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: 0
    },
    logoContainerStyles: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    },
    logoNameStyles: {
        marginLeft: '0.5rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        backgroundColor: 'black',
        cursor: 'pointer'
    }
}