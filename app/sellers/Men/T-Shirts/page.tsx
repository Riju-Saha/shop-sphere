'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../../public/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../../context/page';
import { getSellerProducts } from '@/app/firebase/firebase';

interface StoredUser {
  username: string;
  type: string;
}

interface Product {
  key: string;
  productName: string;
  productPrice: number;
  productCategory: string;
  productSubCategory: string;
  dateAdded: string;
}

type SortOption = 'date_desc' | 'price_low' | 'price_high';

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
  productGrid: React.CSSProperties;
  filterSidebar: React.CSSProperties;
};

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
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    padding: '20px',
  },
  filterSidebar: {
    width: '250px',
    padding: '20px',
    backgroundColor: '#1e1e1e',
    borderRight: '1px solid #333',
    height: '100%',
    overflowY: 'auto',
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

export default function TShirts() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tshirtsProducts, setTShirtsProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const dropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [currentUsername, setCurrentUsername] = useState('Guest');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('user');

      if (userString) {
        try {
          const userObject: StoredUser = JSON.parse(userString);
          setCurrentUsername(userObject.username);
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const category = 'Men';
    const subCategory = 'TShirts';

    if (currentUsername && currentUsername !== 'Guest') {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        const products = await getSellerProducts(currentUsername, category, subCategory);
        const productsWithDate = products.map((p, index) => ({
          ...p,
          productPrice: Number(p.productPrice),
          dateAdded: p.dateAdded || new Date(Date.now() - index * 60000).toISOString(),
        }));
        setTShirtsProducts(products);
        setIsLoadingProducts(false);
      };
      fetchProducts();
    }
  }, [currentUsername]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption);
  };

  const sortedTShirtProducts = useMemo(() => {
    let productsCopy = [...tshirtsProducts];

    if (sortOption === 'date_desc') {
      return productsCopy.reverse();
    }
    return productsCopy.sort((a, b) => {
      switch (sortOption) {
        case 'price_low':
          return a.productPrice - b.productPrice;
        case 'price_high':
          return b.productPrice - a.productPrice;
        default:
          return 0;
      }
    });
  }, [tshirtsProducts, sortOption]);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    alert(`Routing to ${user!.name}'s Seller Profile Page!`);
  };
  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/');
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

  const handleCartClick = () => {
    alert("Routing to Cart Page!");
  };

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
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div style={styles.filterSidebar}>
          <h3 style={{ color: '#0e6fdeff', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Filter & Sort</h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>Sort By</h4>
            <select
              style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#333', border: 'none', color: 'white' }}
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="date_desc">Date Added (Newest)</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'white', marginBottom: '10px' }}>Inventory Status</h4>
            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} /> In Stock
            </label>
            <label style={{ display: 'block', color: 'white' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} /> Out of Stock
            </label>
          </div>
        </div>

        <div style={styles.sectionsContainerStyles}>
          <h2 style={{ color: 'white', padding: '0 20px', marginBottom: '10px' }}>Inventory: Men's TShirts ({sortedTShirtProducts.length})</h2>

          {isLoadingProducts && <p style={{ color: 'gray', padding: '0 20px' }}>Loading products...</p>}

          {!isLoadingProducts && sortedTShirtProducts.length === 0 && currentUsername !== 'Guest' && (
            <p style={{ color: 'gray', padding: '0 20px' }}>No T-Shirts products found for this seller.</p>
          )}

          <div style={styles.productGrid}>
            {sortedTShirtProducts.map((product, i) => (
              <div
                key={product.key || i}
                style={{
                  backgroundColor: '#1f1f1f',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ height: '150px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#0e6fdeff' }}>Product Image</span>
                </div>

                <h3>{product.productName || 'Unnamed Product'}</h3>
                <p style={{ color: 'lightgray', fontSize: '0.9rem', margin: '5px 0' }}>Category: {product.productCategory || 'N/A'} / {product.productSubCategory || 'N/A'}</p>
                <p style={{ color: 'lightgray', fontSize: '0.9rem', margin: '5px 0' }}>Name: {product.productName}</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#00aaff' }}>Price: ${Number(product.productPrice).toFixed(2)}</p>

                <Button style={{ marginTop: '10px', backgroundColor: '#0e6fdeff' }}>Edit Details</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
