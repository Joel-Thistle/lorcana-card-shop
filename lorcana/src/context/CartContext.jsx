/**
 * Cart Context
 * 
 * Provides shopping cart functionality across the application.
 * Manages cart items, pricing calculations, and persistent cart storage.
 */
import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

/**
 * Custom hook to access cart context from any component
 * 
 * @returns {Object} Cart context values and functions
 */
export function useCart() {
  return useContext(CartContext);
}

/**
 * Cart Provider Component
 * 
 * Wraps the application to provide cart functionality to all child components.
 * Handles cart state management and calculations.
 */
export function CartProvider({ children }) {
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [taxRate] = useState(0.13); // 13% tax rate
  const [shipping, setShipping] = useState(5.99); // Default shipping
  const [premiumPackPrice, setPremiumPackPrice] = useState(19.99); // Default premium price

  /**
   * Load cart from localStorage on component mount
   */
  useEffect(() => {
    const storedCart = localStorage.getItem('lorcanaCart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  /**
   * Save cart to localStorage whenever it changes
   * Also updates cart count and subtotal
   */
  useEffect(() => {
    localStorage.setItem('lorcanaCart', JSON.stringify(cartItems));
    
    // Update cart count
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    // Update subtotal
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCartSubtotal(subtotal);
  }, [cartItems]);

  /**
   * Add item to cart
   * If item already exists, increase quantity, otherwise add as new item
   * 
   * @param {Object} card - Card object to add to cart
   */
  const addToCart = (card) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItem = prevItems.find(item => item.id === card._id);
      
      if (existingItem) {
        // Increase quantity if item exists
        return prevItems.map(item => 
          item.id === card._id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, {
          id: card._id,
          name: card.Name,
          image: card.Image,
          price: card.Price || 3.99, // Default price if none set
          quantity: 1,
          premiumPackaging: false
        }];
      }
    });
  };

  /**
   * Update item quantity in cart
   * 
   * @param {string} id - Cart item ID
   * @param {number} quantity - New quantity (must be >= 1)
   */
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Toggle premium packaging option for a cart item
   * 
   * @param {string} id - Cart item ID
   */
  const togglePremiumPackaging = (id) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, premiumPackaging: !item.premiumPackaging } : item
      )
    );
  };

  /**
   * Remove item from cart
   * 
   * @param {string} id - Cart item ID
   */
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Update shipping price
   * 
   * @param {number} newShippingPrice - New shipping price
   */
  const updateShipping = (newShippingPrice) => {
    setShipping(newShippingPrice);
  };

  /**
   * Update premium packaging price
   * 
   * @param {number} newPremiumPackPrice - New premium packaging price
   */
  const updatePremiumPackPrice = (newPremiumPackPrice) => {
    setPremiumPackPrice(newPremiumPackPrice);
  };

  /**
   * Calculate total cost of premium packaging
   * Considers item quantities
   * 
   * @returns {number} Total premium packaging cost
   */
  const calculatePremiumPackagingTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.premiumPackaging) {
        return total + (premiumPackPrice * item.quantity);
      }
      return total;
    }, 0);
  };

  /**
   * Calculate final total with tax and premium packaging
   * 
   * @returns {number} Final cart total
   */
  const calculateTotal = () => {
    // Calculate premium packaging total based on quantity
    const premiumPackagingTotal = calculatePremiumPackagingTotal();
    
    // Apply tax to subtotal and shipping
    const taxableAmount = cartSubtotal + shipping;
    const taxAmount = taxableAmount * taxRate;
    
    // Calculate final total
    return cartSubtotal + shipping + premiumPackagingTotal + taxAmount;
  };

  /**
   * Get tax amount for display purposes
   * 
   * @returns {number} Total tax amount
   */
  const getTaxAmount = () => {
    const taxableAmount = cartSubtotal + shipping;
    return taxableAmount * taxRate;
  };

  // Context value object with all cart functionality
  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    shipping,
    premiumPackPrice,
    taxRate,
    addToCart,
    updateQuantity,
    togglePremiumPackaging,
    removeFromCart,
    clearCart,
    updateShipping,
    updatePremiumPackPrice,
    calculateTotal,
    getTaxAmount,
    calculatePremiumPackagingTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}