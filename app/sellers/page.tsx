'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/page';
import Sections from '../components/sections';
import { Input } from '@/components/ui/input';
import { addProductToDb } from '../firebase/firebase';

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

const formInputFocusStyle = {
  borderColor: '#00aaff',
  boxShadow: '0 0 0 3px rgba(14, 111, 222, 0.4)',
};

const formInputStyles = {
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #0e6fdeff',
    borderRadius: '8px',
    backgroundColor: '#1f1f1f',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '--tw-ring-color': 'transparent',
  } as React.CSSProperties,
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#E0E0E0',
    fontWeight: '600',
    fontSize: '0.95rem'
  } as React.CSSProperties
};

const subcategories = {
  Men: ['T-Shirts', 'Jeans', 'Watches', 'Footwears'],
  Women: ['Tops', 'Watches', 'Handbags', 'Jwellery'],
  Kids: ['Toys', 'School Supplies', 'Childrens Clothing'],
  Stationary: ['Pens', 'Notebooks', 'Art Supplies'],
  Electronics: ['Phones', 'Laptops', 'Headphones', 'Cameras'],
};

interface ProductFormProps {
  onCancel: () => void;
  currentUser: {
    username: string;
  } | null;
}

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
          <div key={sub} onClick={() => {router.push(`sellers/${category}/${sub}`);}} style={{ padding: '10px 15px', borderRadius: '6px', backgroundColor: '#333', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '0.9rem' }}>
            {sub}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductForm: React.FC<ProductFormProps> = ({ onCancel, currentUser }) => {
  const currentUsername = currentUser?.username || 'N/A';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setProductName('');
    setProductPrice('');
    onCancel();
  };

  const applyFocusStyles = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>, focus: boolean) => {
    const styleString = `border-color: ${formInputFocusStyle.borderColor}; box-shadow: ${formInputFocusStyle.boxShadow};`;
    if (focus) {
      e.currentTarget.style.cssText += styleString;
    } else {
      e.currentTarget.style.cssText = e.currentTarget.style.cssText.replace(styleString, '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSubcategory || !productName || !productPrice) {
      alert("Please fill in all product details.");
      return;
    }

    const productData = {
      username: currentUsername,
      usertype: "sellers",
      productCategory: selectedCategory,
      productSubCategory: selectedSubcategory,
      productName: productName,
      productPrice: productPrice,
      createdAt: new Date(),
    };

    try {
      const product = await addProductToDb(productData);

      if (product) {
        console.log("Product added:", product);
        alert("Product added successfully!");
        handleReset();
      } else {
        console.log("Failed to add product");
        alert("Product submission failed. Check console for details.");
      }

    } catch (error) {
      console.error("Error during product submission:", error);
      alert("An unexpected error occurred during submission.");
    }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#121212', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.7)', maxWidth: '700px', margin: '20px auto', color: 'white', border: '1px solid #2a2a2a' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '25px', borderBottom: '1px solid #333', paddingBottom: '15px', textAlign: 'center', fontWeight: '700', color: '#E0E0E0' }}>
        Add New Product
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: '1 1 48%' }}>
            <label style={formInputStyles.label}>Product Category:</label>
            <select
              required
              style={formInputStyles.input}
              value={selectedCategory}
              onChange={handleCategoryChange}
              onFocus={(e) => applyFocusStyles(e as React.FocusEvent<HTMLSelectElement>, true)}
              onBlur={(e) => applyFocusStyles(e as React.FocusEvent<HTMLSelectElement>, false)}>
              <option value="" disabled hidden>Select a Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Stationary">Stationary</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>

          <div style={{ flex: '1 1 48%' }}>
            {selectedCategory && (
              <div style={{ flex: '1 1 48%' }}>
                <label style={formInputStyles.label}>Product Type:</label>
                <select
                  required
                  style={formInputStyles.input}
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  onFocus={(e) => applyFocusStyles(e as React.FocusEvent<HTMLSelectElement>, true)}
                  onBlur={(e) => applyFocusStyles(e as React.FocusEvent<HTMLSelectElement>, false)}
                >
                  <option value="" disabled hidden>Select a Type</option>
                  {subcategories[selectedCategory as keyof typeof subcategories]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={formInputStyles.label}>Product Name:</label>
          <Input
            type="text"
            required
            style={formInputStyles.input}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder='Product Name'
            onFocus={(e) => applyFocusStyles(e as React.FocusEvent<HTMLInputElement>, true)}
            onBlur={(e) => applyFocusStyles(e as React.FocusEvent<HTMLInputElement>, false)}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={formInputStyles.label}>Product Price:</label>
          <Input
            type="number"
            required
            style={formInputStyles.input}
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            placeholder='Product Price'
            onFocus={(e) => applyFocusStyles(e as React.FocusEvent<HTMLInputElement>, true)}
            onBlur={(e) => applyFocusStyles(e as React.FocusEvent<HTMLInputElement>, false)}
          />
        </div>


        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <Button
            type="button"
            onClick={handleReset}
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

export default function Sellers() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState<'All' | keyof typeof subcategories>('Men');
  const dropdownRef = useRef(null);

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

      if (user.type !== 'seller') {
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

  const handleFormClose = () => {
    setShowForm(false);
    setActiveSection('Men');
  }

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/');
  };

  const handleAddForm = () => {
    setActiveSection('Men');
    setShowForm(true);
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    alert(`Routing to ${user!.name}'s Seller Profile Page!`);
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
          <Image src={logo} alt="Shop Sphere Logo" style={{ height: '75px', width: 'auto' }} />
          <Button style={styles.logoNameStyles}>Shop Sphere</Button>
        </div>
        <div style={styles.buttonContainer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
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
        <div style={formTransitionStyle}>
          <ProductForm onCancel={() => setShowForm(false)} currentUser={user} />
        </div>

        <div style={{ display: showForm ? 'none' : 'block' }}>
          <div className="p-4 relative ">
            <div className="p-0">
              <div
                className={`flex flex-col items-center justify-center rounded-xl text-white p-1`}
              >
                <Button onClick={handleAddForm} className="p-2 text-xl font-bold cursor-pointer bg-[#0e6fdeff] hover:bg-[#0e6fdeff]/80">
                  Add Product
                </Button>
              </div>
            </div>
          </div>

          {activeSection !== 'All' && subcategories[activeSection] && (
            <CategoryCard
              category={activeSection}
              subcategories={subcategories[activeSection]}
            />
          )}

          <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
            <h1>Welcome, {user.username} (Seller)</h1>
            <p>This is your seller dashboard content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}