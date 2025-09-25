'use client'

import React, { useEffect, useRef, useState } from 'react';
import TypingText from "@/components/ui/shadcn-io/typing-text";
import Image from 'next/image';
import logo from '../public/logo.png';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/page';

interface Styles {
  pageWrapper: React.CSSProperties;
  header: React.CSSProperties;
  buttonContainer: React.CSSProperties;
  button: React.CSSProperties;
  mainContentContainer: React.CSSProperties;
  logoContainerStyles: React.CSSProperties;
  logoNameStyles: React.CSSProperties;
  iconStyles: React.CSSProperties;
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
    // Reduced gap slightly as icons are now closer
    gap: '1.5vw',
    alignItems: 'center', // Align items vertically in the container
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
  }
};

// Component for Cart Icon
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round"
    style={styles.iconStyles} // Using the defined iconStyles
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

  // Function to handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Empty dependency array as dropdownRef is stable after initial render

  const handleHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  // FIX: Redefined the handleLogout function correctly here
  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout(); // Call the logout function from context
    router.push('/');
  };

  // NEW: Defined the handleProfileClick function
  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    // You can implement routing to a specific profile page here, e.g.:
    // router.push(`/profile/${user.username}`); 
    alert(`Routing to ${user?.name}'s Profile Page!`);
  };

  // NEW: Defined the handleCartClick function
  const handleCartClick = () => {
    // Implement routing to cart page here
    // router.push('/cart'); 
    alert("Routing to Cart Page!");
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div style={styles.logoContainerStyles} onClick={handleHome}>
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
              {/* Cart Icon */}
              <div onClick={handleCartClick} style={{ cursor: 'pointer' }}>
                <CartIcon />
              </div>

              {/* Profile Icon and Dropdown Container */}
              <div
                style={{ position: 'relative' }}
                ref={dropdownRef}
              >
                {/* Profile Icon (Toggles Dropdown) */}
                <svg
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" style={styles.iconStyles}
                >
                  <circle cx="12" cy="7" r="4"></circle>
                  <path d="M12 20s-8-2-8-5a8 8 0 0 1 16 0c0 3-8 5-8 5z"></path>
                </svg>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      backgroundColor: '#333',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      width: '150px',
                      zIndex: 100,
                      marginTop: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div
                      onClick={handleProfileClick}
                      style={{ padding: '10px', color: 'white', cursor: 'pointer', borderBottom: '1px solid #444' }}
                    >
                      My Profile
                    </div>
                    <div
                      onClick={handleLogout}
                      style={{ padding: '10px', color: 'red', cursor: 'pointer' }}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Button style={styles.button} onClick={handleLogin}>Login</Button>
              <Button style={styles.button} onClick={handleRegister}>Register</Button>
            </>
          )}
        </div>
      </header>

      {user ? (
        null
      ) : (
        <LandingPage />
      )}
    </div>
  );
}