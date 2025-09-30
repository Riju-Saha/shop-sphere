'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/page'; // Adjust path
import Sections from '../components/sections'; // Adjust path
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const carouselItems = [
  { id: 1, content: "First Product - Featured", color: "bg-blue-600" },
  { id: 2, content: "Second Product - Discount Alert", color: "bg-red-600" },
  { id: 3, content: "Third Product - New Arrival", color: "bg-green-600" },
  { id: 4, content: "Fourth Product - Summer Collection", color: "bg-yellow-600" },
  { id: 5, content: "Fifth Product - Best Seller", color: "bg-purple-600" },
  { id: 6, content: "Sixth Product - Limited Stock", color: "bg-pink-600" },
];


// ====================================================================
// CONSOLIDATED STYLES SECTION (formTransitionStyle REMOVED)
// ====================================================================
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

const dropdownStyles = {
  menu: {
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
  } as React.CSSProperties,
  item: {
    padding: '10px',
    color: 'white',
    cursor: 'pointer',
    borderBottom: '1px solid #444'
  } as React.CSSProperties,
  logoutItem: {
    padding: '10px',
    color: 'red',
    cursor: 'pointer'
  } as React.CSSProperties
};

const formInputStyles = {
  input: { width: '100%', padding: '10px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#333', color: 'white' } as React.CSSProperties,
  label: { display: 'block', marginBottom: '5px' } as React.CSSProperties
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

// --- Product Form Component ---
interface ProductFormProps {
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onCancel }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', maxWidth: '600px', margin: '20px auto', color: 'white' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Add New Product</h2>

      <form onSubmit={(e) => { e.preventDefault(); alert("Product submitted!"); onCancel(); }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={formInputStyles.label}>Product Name:</label>
          <input type="text" required style={formInputStyles.input} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={formInputStyles.label}>Price:</label>
          <input type="number" required style={formInputStyles.input} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button
            type="button"
            onClick={onCancel}
            style={{ backgroundColor: '#444', color: 'white' }}
          >
            Cancel
          </Button>
          <Button type="submit" style={styles.button}>
            Submit Product
          </Button>
        </div>
      </form>
    </div>
  );
};


export default function Sellers() { // Component named Sellers
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false) // State to control form visibility
  const dropdownRef = useRef(null);

  const plugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  // --- RBAC and Redirect Logic ---
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      // Authorization check MUST confirm user is a 'seller'
      if (user.type !== 'seller') {
        alert(`Access Denied! Redirecting ${user.username} to login.`);
        logout(); // Clears the token
        router.replace('/login');
      }
    }
  }, [loading, user, router, logout]);
  // ---------------------------------

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    alert(`Routing to ${user!.name}'s Seller Profile Page!`);
  };

  const handleCartClick = () => {
    alert("Routing to Cart Page!");
  };

  const handleAddForm = () => {
    setShowForm(true);
  }

  // FIX 1: Define formTransitionStyle inside the component where showForm is accessible
  const formTransitionStyle: React.CSSProperties = {
    transition: 'opacity 0.5s ease-in-out, max-height 0.5s ease-in-out',
    opacity: showForm ? 1 : 0,
    pointerEvents: showForm ? 'auto' : 'none',
    maxHeight: showForm ? '1000px' : '0', // Adjust max-height for collapse effect
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  };


  // RENDER CONDITION: Show minimal page if loading or unauthorized
  if (loading || !user || user.type !== 'seller') {
    return (
      <div style={{ color: 'white', backgroundColor: 'black', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Redirecting to Login...
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div style={styles.logoContainerStyles} onClick={() => router.push('/')}>
          {/* FIX: Add Image component here */}
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>

            {/* 1. Cart Icon */}
            <div onClick={handleCartClick} style={{ cursor: 'pointer' }}>
              <CartIcon />
            </div>

            {/* 2. Profile Icon and Dropdown Container */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>

              {/* Profile Icon (Toggles Dropdown) */}
              <svg
                onClick={() => setIsDropdownOpen(prev => !prev)}
                xmlns="http://www.w3.org.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" style={styles.iconStyles}
              >
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M12 20s-8-2-8-5a8 8 0 0 1 16 0c0 3-8 5-8 5z"></path>
              </svg>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div style={dropdownStyles.menu}>
                  <div
                    onClick={handleProfileClick}
                    style={dropdownStyles.item}
                  >
                    My Profile
                  </div>
                  <div
                    onClick={handleLogout}
                    style={dropdownStyles.logoutItem}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Seller Main Content */}
// USE THIS CORRECTED BLOCK:
      {/* Seller Main Content */}
      <div style={styles.sectionsContainerStyles}>
        <Sections />

        {/* 1. WELCOME MESSAGE (ALWAYS VISIBLE/SCROLLABLE) */}


        {/* 2. PRODUCT ADD FORM (Visible/Hidden with transition) */}
        <div style={formTransitionStyle}>
          <ProductForm onCancel={() => setShowForm(false)} />
        </div>

        {/* 3. MAIN DASHBOARD ELEMENTS (Hides ONLY the Add Product button and Carousel) */}
        <div style={{ display: showForm ? 'none' : 'block' }}>

          <div className="p-4 relative ">
            <div className="p-0">
              <div
                className={`flex flex-col aspect-[8/1] items-center justify-center p-3 rounded-xl text-white bg-gray-900`}
              >
                <Button
                  onClick={handleAddForm}
                  className="
                            p-4 text-2xl font-bold cursor-pointer 
                            sm:p-6 sm:text-3xl 
                            md:p-8 md:text-4xl
                            bg-[#0e6fdeff] hover:bg-[#0e6fdeff]/80
                        "
                >
                  Add Product
                </Button>
              </div>
            </div>
          </div>

          {/* Carousel is now conditionally visible based on the showForm state */}
          <div className="p-4 relative">
            <Carousel
              plugins={[plugin.current]}
              opts={{ loop: true }}
              className="relative w-full"
            >
              <CarouselContent className="-ml-0">
                {/* ... Carousel Items ... */}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
        <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
          <h1>Welcome, {user.name} (Seller)</h1>
          <p>This is your seller dashboard content.</p>
        </div>
      </div>
    </div>
  );
}