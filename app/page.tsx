'use client'

import React, { useEffect, useRef, useState } from 'react';
import TypingText from "@/components/ui/shadcn-io/typing-text";
import Image from 'next/image';
import logo from '../public/logo.png';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/page';
// import Sections from './components/sections';

interface Styles {
  pageWrapper: React.CSSProperties;
  header: React.CSSProperties;
  buttonContainer: React.CSSProperties;
  button: React.CSSProperties;
  mainContentContainer: React.CSSProperties;
  logoContainerStyles: React.CSSProperties;
  logoNameStyles: React.CSSProperties;
  iconStyles: React.CSSProperties;
  sectionsContainerStyles: React.CSSProperties;
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
    gap: '1.5vw',
    alignItems: 'center',
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
  iconStyles: {
    color: 'white',
    cursor: 'pointer',
    width: '24px',
    height: '24px'
  },
  sectionsContainerStyles: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 0',
  }
};

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round"
    style={styles.iconStyles}
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);


// Component for a logged-out user (the original landing page)
const LandingPage = () => (
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
);

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && user) {
      const targetPath = user.type === 'seller' ? '/sellers' : '/buyers';
      // Use router.replace to prevent the user from hitting the back button to return here
      router.replace(targetPath);
    }
  }, [loading, user, router]);

  // Function to handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');

  const handleHome = () => {
    router.push('/');
  };

  // const handleLogin = () => {
  //   router.push('/login');
  // };

  // const handleRegister = () => {
  //   router.push('/register');
  // };

  // const handleLogout = () => {
  //   setIsDropdownOpen(false);
  //   logout();
  //   router.push('/');
  // };

  // const handleProfileClick = () => {
  //   setIsDropdownOpen(false);
  //   alert(`Routing to ${user?.name}'s Profile Page!`);
  // };

  // const handleCartClick = () => {
  //   alert("Routing to Cart Page!");
  // };




  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div style={styles.logoContainerStyles} onClick={() => router.push('/')}>
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          <Button style={styles.button} onClick={handleLogin}>Login</Button>
          <Button style={styles.button} onClick={handleRegister}>Register</Button>
        </div>
      </header>

      <LandingPage />
    </div>
  );
}