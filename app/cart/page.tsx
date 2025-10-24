'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/page'; // Assuming this path is correct
import { getCartItemsDb, removeCartItemDb, updateCartItemQuantityDb, DBCartItem } from '@/app/firebase/firebase'; 
// NOTE: DBCartItem must be imported from your firebase file now
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';

// --- Interfaces for CartPage ---

// The structure we'll use in our local state for better calculation
interface CartItem extends DBCartItem {
    subtotal: number;
}

// Fixed costs (can be fetched from DB or hardcoded)
const SHIPPING_COST = 5.00;
const TAX_RATE = 0.08; // 8%

// --- Styles (using the existing theme for consistency) ---

const cartStyles: Record<string, React.CSSProperties> = {
    pageWrapper: {
        minHeight: '100vh',
        backgroundColor: 'black',
        color: 'white',
        padding: '20px',
    },
    container: {
        maxWidth: '1200px',
        margin: '40px auto',
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap', // Allow wrapping for mobile
    },
    productList: {
        flex: 3,
        minWidth: '300px',
    },
    summary: {
        flex: 1,
        minWidth: '300px',
        backgroundColor: '#1f1f1f',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
        height: 'fit-content',
        position: 'sticky', // Makes it stick on scroll
        top: '20px',
    },
    itemCard: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1f1f1f',
        padding: '15px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #333',
    },
    itemImage: {
        width: '80px',
        height: '80px',
        backgroundColor: '#333',
        borderRadius: '4px',
        marginRight: '15px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0e6fdeff'
    },
    itemDetails: {
        flexGrow: 1,
        minWidth: '150px',
    },
    itemPrice: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: '#00aaff',
        margin: '0 0 5px 0',
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        flexShrink: 0,
        margin: '0 20px',
    },
    controlButton: {
        width: '30px',
        height: '30px',
        padding: '0',
        borderRadius: '50%',
        backgroundColor: '#0e6fdeff',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    removeButton: {
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
        cursor: 'pointer',
        marginLeft: '15px',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '5px 0',
        borderBottom: '1px dotted #333',
        fontSize: '1rem',
        color: 'lightgray',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '15px',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: '#00aaff',
    },
};

const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const CartPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [currentUsername, setCurrentUsername] = useState('Guest');

    // --- State Initialization and Data Fetching ---
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    const userObject: { username: string } = JSON.parse(userString);
                    if (userObject && userObject.username) {
                        setCurrentUsername(userObject.username);
                    }
                } catch (e) {
                    console.error("Error parsing user data from localStorage:", e);
                }
            }
        }
    }, []);

    const fetchCart = async () => {
        if (currentUsername === 'Guest') return;

        setIsLoadingCart(true);
        try {
            const rawItems = await getCartItemsDb(currentUsername);
            const processedItems: CartItem[] = rawItems.map(item => ({
                ...item,
                subtotal: item.productQuantity * item.priceAtAddition,
            }));
            setCartItems(processedItems);
        } catch (error) {
            console.error("Error fetching cart:", error);
            // Handle error state or display message
        } finally {
            setIsLoadingCart(false);
        }
    };

    useEffect(() => {
        if (currentUsername !== 'Guest' && !authLoading) {
            fetchCart();
        }
    }, [currentUsername, authLoading]);

    // --- Calculations ---

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = subtotal * TAX_RATE;
    const finalTotal = subtotal + taxAmount + SHIPPING_COST;
    const totalItems = cartItems.reduce((sum, item) => sum + item.productQuantity, 0);

    // --- Handlers for Cart Modification ---

    const handleQuantityChange = async (item: CartItem, delta: number) => {
        const newQuantity = item.productQuantity + delta;
        const productKey = item.productKey;
        const buyerUsername = currentUsername;

        if (newQuantity <= 0) {
            // Remove item
            await handleRemoveItem(item);
            return;
        }

        try {
            // Update database
            await updateCartItemQuantityDb(
                buyerUsername,
                productKey,
                newQuantity,
                item.priceAtAddition, // Use priceAtAddition from the item
                item.sellerUsername,
                item.productName
            );

            // Update local state
            setCartItems(prevItems => prevItems.map(i => 
                i.productKey === productKey 
                    ? { 
                        ...i, 
                        productQuantity: newQuantity, 
                        subtotal: newQuantity * i.priceAtAddition // Recalculate subtotal
                      } 
                    : i
            ));

        } catch (error) {
            alert("Failed to update cart quantity. Please try again.");
            console.error("Cart update error:", error);
        }
    };

    const handleRemoveItem = async (item: CartItem) => {
        const buyerUsername = currentUsername;

        try {
            await removeCartItemDb(buyerUsername, item.productKey);
            
            // Update local state by filtering the item out
            setCartItems(prevItems => prevItems.filter(i => i.productKey !== item.productKey));
            alert(`${item.productName} removed from cart.`);
        } catch (error) {
            alert("Failed to remove item from cart. Please try again.");
            console.error("Cart removal error:", error);
        }
    };
    
    // --- Render Logic ---

    if (authLoading || isLoadingCart) {
        return (
            <div style={{ ...cartStyles.pageWrapper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Loading Cart...</p>
            </div>
        );
    }
    
    if (currentUsername === 'Guest' || !user || user.type !== 'buyer') {
        // Redirect logic from your original file
        router.push('/');
        return null;
    }

    return (
        <div style={cartStyles.pageWrapper}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
                <h1 style={{ fontSize: '2.5rem', borderBottom: '2px solid #0e6fdeff', paddingBottom: '10px', marginBottom: '30px' }}>
                    <ShoppingCart size={32} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                    Your Shopping Cart ({totalItems} items)
                </h1>

                <div style={cartStyles.container}>
                    
                    {/* --- Product List (Left Side) --- */}
                    <div style={cartStyles.productList}>
                        {cartItems.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#1f1f1f', borderRadius: '8px' }}>
                                <p style={{ color: 'gray', fontSize: '1.2rem' }}>Your cart is empty. Time to shop!</p>
                                <Button 
                                    onClick={() => router.push('/pens')} 
                                    style={{ ...cartStyles.controlButton, backgroundColor: '#0e6fdeff', marginTop: '15px', width: 'auto', borderRadius: '4px', height: 'auto', padding: '10px 20px' }}>
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.productKey} style={cartStyles.itemCard}>
                                    
                                    {/* Image Placeholder */}
                                    <div style={cartStyles.itemImage}>
                                        Image
                                    </div>

                                    {/* Details */}
                                    <div style={cartStyles.itemDetails}>
                                        <h3 style={{ margin: '0 0 5px 0', color: '#0e6fdeff' }}>{item.productName}</h3>
                                        <p style={{ margin: '0', color: 'lightgray', fontSize: '0.9rem' }}>Sold by: {item.sellerUsername}</p>
                                        <p style={{ margin: '0', color: 'lightgray', fontSize: '0.9rem' }}>Price at Addition: {formatCurrency(item.priceAtAddition)}</p>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div style={cartStyles.quantityControls}>
                                        <Button
                                            onClick={() => handleQuantityChange(item, -1)}
                                            style={{ ...cartStyles.controlButton, backgroundColor: item.productQuantity === 1 ? '#ff4444' : '#0e6fdeff' }}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={16} />
                                        </Button>

                                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>
                                            {item.productQuantity}
                                        </div>

                                        <Button
                                            onClick={() => handleQuantityChange(item, 1)}
                                            style={cartStyles.controlButton}
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                    
                                    {/* Product Subtotal */}
                                    <div style={{ width: '100px', textAlign: 'right', flexShrink: 0 }}>
                                        <p style={cartStyles.itemPrice}>
                                            {formatCurrency(item.subtotal)}
                                        </p>
                                        <p style={{ margin: 0, color: 'gray', fontSize: '0.8rem' }}>Subtotal</p>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        onClick={() => handleRemoveItem(item)}
                                        style={cartStyles.removeButton}
                                        aria-label="Remove item"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* --- Summary (Right Side) --- */}
                    {cartItems.length > 0 && (
                        <div style={cartStyles.summary}>
                            <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px', color: 'white' }}>Final Summary</h2>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <div style={cartStyles.summaryRow}>
                                    <span>Items Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div style={cartStyles.summaryRow}>
                                    <span>Tax ({TAX_RATE * 100}%):</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                <div style={cartStyles.summaryRow}>
                                    <span>Shipping:</span>
                                    <span>{formatCurrency(SHIPPING_COST)}</span>
                                </div>
                            </div>

                            <div style={cartStyles.totalRow}>
                                <span>Order Total:</span>
                                <span>{formatCurrency(finalTotal)}</span>
                            </div>

                            <Button 
                                style={{ ...cartStyles.controlButton, width: '100%', borderRadius: '4px', marginTop: '20px', height: '50px', fontSize: '1.1rem' }}
                                onClick={() => alert("Routing to Checkout! (Functionality not yet implemented)")}
                            >
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;