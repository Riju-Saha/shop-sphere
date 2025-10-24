'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../../public/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../../context/page';
import { getBuyerProducts, addToCartDb, removeCartItemDb, updateCartItemQuantityDb } from '@/app/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
  username: string;
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
  filterSidebar: (isSidebarOpen: boolean, isMobile: boolean) => React.CSSProperties;
  sidebarToggle: (isMobile: boolean) => React.CSSProperties;
  overlay: (isSidebarOpen: boolean, isMobile: boolean) => React.CSSProperties;
};

const MOBILE_BREAKPOINT = '768px';

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
    padding: '1vh 1vw',
    minHeight: '80px',
    position: 'relative',
    zIndex: 10,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  filterSidebar: (isSidebarOpen, isMobile) => {
    const desktopStyles: React.CSSProperties = {
      width: isSidebarOpen ? '250px' : '0',
      padding: isSidebarOpen ? '20px' : '0',
      borderRight: isSidebarOpen ? '1px solid #333' : 'none',
      overflowX: 'hidden',
      visibility: isSidebarOpen ? 'visible' : 'hidden',
    };

    const mobileStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '250px',
      height: '100vh',
      padding: '20px',
      transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out',
      zIndex: 20,
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
      backgroundColor: '#1e1e1e',
    };

    return isMobile ? mobileStyles : { ...styles.filterSidebar, ...desktopStyles, flexShrink: 0, };
  },
  sidebarToggle: (isMobile) => ({
    display: 'block',
    position: 'absolute',
    left: '10px',
    color: 'white',
    cursor: 'pointer',
    zIndex: 30,
    backgroundColor: 'transparent',
    padding: '0',
    border: 'none',
    boxShadow: 'none',
    minWidth: 'auto',
    height: '24px'
  }),
  overlay: (isSidebarOpen, isMobile) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    display: isSidebarOpen && isMobile ? 'block' : 'none',
  }),
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

const quantityButtonStyles: Record<string, React.CSSProperties> = {
  control: {
    width: '35px',
    height: '35px',
    padding: '0',
    borderRadius: '50%',
    backgroundColor: '#0e6fdeff',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  display: {
    flexGrow: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    minWidth: '20px',
  },
  delete: {
    width: '35px',
    height: '35px',
    padding: '0',
    borderRadius: '50%',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
};

export default function Toys() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ToysProducts, setToysProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cartItemsState, setCartItemsState] = useState<Record<string, number>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [currentUsername, setCurrentUsername] = useState('Guest');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const MOBILE_BREAKPOINT_NUM = 768;
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_NUM}px)`);

    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    setIsMobile(mediaQuery.matches);
    if (!mediaQuery.matches) {
      setIsSidebarOpen(true);
    }

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const userObject: StoredUser = JSON.parse(userString);
          if (userObject && userObject.username) {
            setCurrentUsername(userObject.username);
          }
        } catch (e) {
          console.error("Error parsing user data from localStorage:", e);
        }
      }
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(targetNode)) {
        setIsDropdownOpen(false);
      }

      if (isMobile && isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(targetNode)) {
        const toggleButton = document.getElementById('sidebar-toggle-button');
        if (toggleButton && toggleButton.contains(targetNode)) return;
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isSidebarOpen, isMobile]);

  useEffect(() => {
    const category = 'Kids';
    const subCategory = 'Toys';

    if (currentUsername && currentUsername !== 'Guest') {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        const rawProducts = await getBuyerProducts(category, subCategory);

        const processedProducts: Product[] = rawProducts.map((p: any) => ({
          ...p,
          productPrice: Number(p.productPrice),
          username: p.username || 'Seller Unknown',
          dateAdded: p.dateAdded || new Date().toISOString(),
        }));

        setToysProducts(processedProducts);
        setIsLoadingProducts(false);
      };
      fetchProducts();
    }
  }, [currentUsername]);

  // --- Sorting Logic ---
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption);
  };

  const sortedToysProducts = useMemo(() => {
    let productsCopy = [...ToysProducts];

    // Sorting by Date (Newest first)
    if (sortOption === 'date_desc') {
      return productsCopy.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }

    return productsCopy.sort((a, b) => {
      switch (sortOption) {
        case 'price_low': return a.productPrice - b.productPrice;
        case 'price_high': return b.productPrice - a.productPrice;
        default: return 0;
      }
    });
  }, [ToysProducts, sortOption]);

  // --- Handlers ---
  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    const userName = (user as any)?.name ? (user as any).name : currentUsername;
    alert(`Routing to ${userName}'s Profile Page!`);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  const handleCartClick = () => {
    router.push('/cart');
  };

  const handleQuantityChange = async (product: Product, newQuantity: number) => {
    const productKey = product.key;
    const buyerUsername = currentUsername;

    if (buyerUsername === 'Guest') {
      alert("Please log in to manage your cart.");
      return;
    }

    try {
      if (newQuantity <= 0) {
        await removeCartItemDb(buyerUsername, productKey);

        setCartItemsState(prev => {
          const newState = { ...prev };
          delete newState[productKey];
          return newState;
        });
        alert(`${product.productName} removed from cart.`);
        return;
      }

      await updateCartItemQuantityDb(
        buyerUsername,
        productKey,
        newQuantity,
        product.productPrice,
        product.username,
        product.productName
      );

      setCartItemsState(prev => ({
        ...prev,
        [productKey]: newQuantity,
      }));

    } catch (error) {
      alert("Failed to update cart quantity in database. Please try again.");
      console.error("Cart update error:", error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const buyerUsername = currentUsername;

    if (buyerUsername === 'Guest') {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const itemData = {
        buyerUsername: buyerUsername,
        productKey: product.key,
        sellerUsername: product.username,
        productPrice: product.productPrice,
        productQuantity: 1,
        productName: product.productName,
      };

      const currentQuantity = cartItemsState[product.key] || 0;
      if (currentQuantity > 0) {
        handleQuantityChange(product, currentQuantity + 1);
        return;
      }

      await addToCartDb(itemData);
      alert(`${product.productName} added to cart!`);

      setCartItemsState(prev => ({
        ...prev,
        [product.key]: 1,
      }));

    } catch (error) {
      alert("Could not add item to cart. Please try again.");
      console.error("Cart addition error:", error);
    }
  };

  if (loading || !user || (user && user.type !== 'buyer')) {
    return (
      <div style={{ color: 'white', backgroundColor: 'black', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Redirecting to Login...
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <style jsx global>{`
                
                @media (max-width: 768px) {
                    .sidebar-toggle-button-mobile {
                        display: block !important;
                    }
                    .header-content {
                        flex-direction: row;
                        align-items: center !important;
                    }
                    .side-navbar {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        width: 250px !important;
                        height: 100vh !important;
                        z-index: 20;
                        transform: translateX(-100%) !important;
                        box-shadow: 4px 0 10px rgba(0,0,0,0.5);
                    }
                    .sidebar-collapsed .side-navbar {
                        transform: translateX(0%) !important;
                        visibility: visible !important;
                    }
                    .product-grid {
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important; 
                    }
                }
                
                .sidebar-collapsed .side-navbar {
                    width: 0 !important;
                    padding: 0 !important;
                    border-right: none !important;
                    visibility: hidden;
                    transition: width 0.3s ease-in-out, visibility 0.3s ease-in-out;
                }
            `}</style>

      <div
        style={styles.overlay(isSidebarOpen, isMobile)}
        onClick={toggleSidebar}
      />
      <header style={styles.header} className="header-content">

        {isMobile && (
          <Button
            id="sidebar-toggle-button"
            onClick={toggleSidebar}
            style={styles.sidebarToggle(isMobile)}
          >
            {isSidebarOpen ? <X size={24} style={{ color: 'white' }} /> : <Menu size={24} style={{ color: 'white' }} />}
          </Button>
        )}

        <div style={styles.logoContainerStyles} onClick={() => router.push('/')}>
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>

        <div style={styles.buttonContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>

            {!isMobile && (
              <Button
                onClick={toggleSidebar}
                style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid #444', padding: '8px 12px' }}
                aria-label="Toggle Filters"
              >
                {isSidebarOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            )}

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
                  <div onClick={handleProfileClick} style={dropdownStyles.item}>My Profile</div>
                  <div onClick={handleLogout} style={dropdownStyles.logoutItem}>Logout</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div
          ref={sidebarRef}
          style={styles.filterSidebar(isSidebarOpen, isMobile)}
          className="side-navbar"
        >
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

        <div
          className="product-content-area"
          style={styles.sectionsContainerStyles}
        >
          <h2 style={{ color: 'white', padding: '0 20px', marginBottom: '10px' }}>Inventory: Men's Toys ({sortedToysProducts.length})</h2>

          {isLoadingProducts && <p style={{ color: 'gray', padding: '0 20px' }}>Loading products...</p>}

          {!isLoadingProducts && sortedToysProducts.length === 0 && currentUsername !== 'Guest' && (
            <p style={{ color: 'gray', padding: '0 20px' }}>No Toys products found for this seller.</p>
          )}

          <div style={styles.productGrid}>
            {sortedToysProducts.map((product, i) => {
              const productKey = product.key || i.toString(); // Use key for state tracking
              const currentQuantity = cartItemsState[productKey] || 0;
              const isInCart = currentQuantity > 0;

              return (
                <div
                  key={productKey}
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
                  <p style={{ color: 'lightgray', fontSize: '0.9rem', margin: '5px 0' }}>Sold by: {product.username || 'Unknown'}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#00aaff' }}>Price: ${Number(product.productPrice).toFixed(2)}</p>

                  <div style={{ marginTop: '10px' }}>
                    {isInCart ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                        <Button
                          onClick={() => handleQuantityChange(product, currentQuantity - 1)}
                          style={quantityButtonStyles.control}
                          aria-label="Decrease quantity"
                        >
                          —
                        </Button>

                        <div style={quantityButtonStyles.display}>
                          {currentQuantity}
                        </div>

                        <Button
                          onClick={() => handleQuantityChange(product, currentQuantity + 1)}
                          style={quantityButtonStyles.control}
                          aria-label="Increase quantity"
                        >
                          +
                        </Button>

                        <Button
                          onClick={() => handleQuantityChange(product, 0)}
                          style={quantityButtonStyles.delete}
                          aria-label="Remove from cart"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        style={{ ...styles.button, width: '100%' }}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )
}