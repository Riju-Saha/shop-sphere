'use client'

import React from 'react';
import TypingText from "@/components/ui/shadcn-io/typing-text";
import Image from 'next/image'
import logo from '../public/logo.png'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button';

interface Styles {
  pageWrapper: React.CSSProperties;
  header: React.CSSProperties;
  buttonContainer: React.CSSProperties;
  button: React.CSSProperties;
  mainContentContainer: React.CSSProperties;
  logoContainerStyles: React.CSSProperties;
  logoNameStyles: React.CSSProperties;
}

export default function Home() {
  const router = useRouter();

  const handleHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div style={styles.logoContainerStyles} onClick={handleHome}>
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          <Button style={styles.button} onClick={handleLogin}>Login</Button>
          <Button style={styles.button} onClick={handleRegister}>Register</Button>
        </div>
      </header>

      <div style={styles.mainContentContainer}>
        <TypingText
          text={["Discover Unique Products.", "Connect with Creative Sellers.", "Your Marketplace, Your Way."]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
          className="text-4xl font-bold"
          textColors={['#3b82f6', '#8b5cf6', '#06b6d4']}
          variableSpeed={{ min: 50, max: 120 }}
        />
      </div>
    </div>
  );
}

const styles: Styles = {
  pageWrapper: {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0 1vw 0 0',
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
    },
  buttonContainer: {
    display: 'flex',
    gap: '2vw',
    flexWrap: 'wrap',
  },
  button: {
    cursor: 'pointer',
    backgroundColor: '#0e6fdeff',
  },
  mainContentContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flex: 1,
  },
};