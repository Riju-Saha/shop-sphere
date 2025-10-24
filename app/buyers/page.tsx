'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/page';
import Sections from '../components/sections';
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const carouselItems = [
  { id: 1, content: "First Product - Featured", color: "bg-blue-600" },
  { id: 2, content: "Second Product - Discount Alert", color: "bg-red-600" },
  { id: 3, content: "Third Product - New Arrival", color: "bg-green-600" },
  { id: 4, content: "Fourth Product - Summer Collection", color: "bg-yellow-600" },
  { id: 5, content: "Fifth Product - Best Seller", color: "bg-purple-600" },
  { id: 6, content: "Sixth Product - Limited Stock", color: "bg-pink-600" },
];


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

const subcategories = {
  Men: ['T-Shirts', 'Jeans', 'Watches', 'Footwears'],
  Women: ['Tops', 'Watches', 'Handbags', 'Jwellery'],
  Kids: ['Toys', 'School Supplies', 'Childrens Clothing'],
  Stationary: ['Pens', 'Notebooks', 'Art Supplies'],
  Electronics: ['Phones', 'Laptops', 'Headphones', 'Cameras'],
};

interface CategoryCardProps {
  category: string;
  subcategories: string[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, subcategories }) => {
  const router = useRouter();
  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>
        {category} Categories
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {subcategories.map(sub => (
          <div key={sub} onClick={() => { router.push(`buyers/${category}/${sub}`); }} style={{ padding: '10px 15px', borderRadius: '6px', backgroundColor: '#333', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '0.9rem' }}>
            {sub}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Buyers() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState<'All' | keyof typeof subcategories>('Men');
  const dropdownRef = useRef(null);

  const plugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

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

      if (user.type !== 'buyer') {
        alert(`Access Denied! Redirecting ${user.username} to login.`);
        logout();
        router.replace('/login');
      }
    }
  }, [loading, user, router, logout]);

  const handleCategorySelection = (category: keyof typeof subcategories | 'All') => {
    setShowForm(false);
    setActiveSection(category);
  }

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
    router.push('/cart');
  };

  const formTransitionStyle: React.CSSProperties = {
    transition: 'opacity 0.5s ease-in-out, max-height 0.5s ease-in-out',
    opacity: showForm ? 1 : 0,
    pointerEvents: showForm ? 'auto' : 'none',
    maxHeight: showForm ? '1000px' : '0',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  };


  if (loading || !user || user.type !== 'buyer') {
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
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>

            <div onClick={handleCartClick} style={{ cursor: 'pointer' }}>
              <CartIcon />
            </div>

            <div style={{ position: 'relative' }} ref={dropdownRef}>

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
      <div style={styles.sectionsContainerStyles}>
        <Sections onCategoryClick={handleCategorySelection} />
        <div className="p-4 relative">
          <Carousel
            plugins={[plugin.current]}
            opts={{ loop: true }}
            className="relative w-full"
          >
            <CarouselContent className="-ml-0">
              {carouselItems.map((item) => (
                <CarouselItem key={item.id} className="pl-0 basis-full">
                  <div className="p-0">
                    <div
                      className={`flex flex-col aspect-[8/1] items-center justify-center p-1 rounded-xl text-white ${item.color}`}
                    >
                      <h2 className="text-xl font-bold">{item.content}</h2>
                      <p className="text-lg mt-2">Check out this special deal!</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        {activeSection !== 'All' && subcategories[activeSection] && (
          <CategoryCard
            category={activeSection}
            subcategories={subcategories[activeSection]}
          />
        )}

        <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
          <h1>Welcome, {user.username} (Buyer)</h1>
          <p>This is your buyers dashboard content.</p>
        </div>
      </div>
    </div>
  );
}