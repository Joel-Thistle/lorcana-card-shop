/**
 * Shopping Cart Components
 * 
 * This file contains the components for the shopping cart functionality:
 * - CartItem: Individual cart item row with quantity controls and premium packaging option
 * - Cart: Main cart component with order summary and checkout options
 */
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { pricingApi } from '../services/api';
import './Cart.css';

/**
 * CartItem Component
 * 
 * Represents a single item in the shopping cart with quantity controls
 * and premium packaging option
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Cart item data
 * @param {number} props.premiumPackPrice - Price of premium packaging
 */
function CartItem({ item, premiumPackPrice }) {
  const { updateQuantity, togglePremiumPackaging, removeFromCart } = useCart();
  
  // Calculate premium package price display - show the total for this item's quantity
  const premiumDisplay = item.premiumPackaging ? 
    `+$${(premiumPackPrice * item.quantity).toFixed(2)}` : '';
  
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          {/* Item image */}
          <Col xs={3} md={2}>
            <img 
              src={item.image} 
              alt={item.name} 
              className="img-fluid rounded cart-item-image"
            />
          </Col>
          
          {/* Item details */}
          <Col xs={9} md={4}>
            <h5 className="mb-0">{item.name}</h5>
            <small className="text-muted">${item.price.toFixed(2)} each</small>
          </Col>
          
          {/* Quantity controls */}
          <Col xs={12} md={2} className="my-2 my-md-0">
            <div className="d-flex align-items-center quantity-control">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span className="mx-2">{item.quantity}</span>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </Button>
            </div>
          </Col>
          
          {/* Premium packaging option */}
          <Col xs={6} md={2} className="text-start text-md-center">
            <Form.Check 
              type="switch"
              id={`premium-${item.id}`}
              label={`Premium Pack ${premiumDisplay}`}
              checked={item.premiumPackaging}
              onChange={() => togglePremiumPackaging(item.id)}
              className="premium-packaging-switch"
            />
          </Col>
          
          {/* Remove button */}
          <Col xs={6} md={2} className="text-end">
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => removeFromCart(item.id)}
            >
              Remove
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

/**
 * Main Cart Component
 * 
 * Displays the shopping cart with items, subtotal, shipping options,
 * tax calculation and checkout options
 */
function Cart() {
  const { 
    cartItems, 
    cartSubtotal, 
    shipping, 
    taxRate, 
    calculateTotal, 
    clearCart,
    updatePremiumPackPrice,
    updateShipping,
    getTaxAmount,
    calculatePremiumPackagingTotal
  } = useCart();
  
  // Local state
  const [checkoutMethod, setCheckoutMethod] = useState('guest');
  const [premiumPackPrice, setPremiumPackPrice] = useState(19.99); // Default value
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState('');
  const [loadingPricing, setLoadingPricing] = useState(true);
  
  /**
   * Fetch pricing settings from server on component mount
   * Updates premium pack price and shipping options
   */
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        setLoadingPricing(true);
        console.log("Fetching pricing settings...");
        
        const data = await pricingApi.getPricingSettings();
        console.log("Fetched pricing settings:", data);
        
        // Update premium pack price
        if (data.premiumPackPrice) {
          console.log("Setting premium pack price to:", data.premiumPackPrice);
          setPremiumPackPrice(data.premiumPackPrice);
          updatePremiumPackPrice(data.premiumPackPrice);
        } else {
          console.warn("No premium pack price found in API response");
        }
        
        // Update shipping options
        if (data.shippingPrices) {
          console.log("Creating shipping options from:", data.shippingPrices);
          const options = Object.entries(data.shippingPrices).map(([region, price]) => ({
            id: region.toLowerCase().replace(/\s+/g, '-'),
            name: region,
            price: parseFloat(price)
          }));
          
          console.log("Created shipping options:", options);
          setShippingOptions(options);
          
          // Set default shipping option
          if (options.length > 0 && !selectedShippingOption) {
            console.log("Setting default shipping to:", options[0].id, "price:", options[0].price);
            setSelectedShippingOption(options[0].id);
            updateShipping(options[0].price);
          }
        }
      } catch (error) {
        console.error("Error fetching pricing settings:", error);
      } finally {
        setLoadingPricing(false);
      }
    };
    
    fetchPricingSettings();
  }, [updatePremiumPackPrice, updateShipping]);
  
  // Calculate final total from the cart context
  const finalTotal = calculateTotal();
  
  /**
   * Handle shipping option change
   * Updates shipping price in cart context
   * 
   * @param {string} optionId - Selected shipping option ID
   */
  const handleShippingOptionChange = (optionId) => {
    setSelectedShippingOption(optionId);
    
    // Find the selected option and update shipping price in context
    const option = shippingOptions.find(opt => opt.id === optionId);
    if (option) {
      console.log("Updating shipping price to:", option.price);
      updateShipping(option.price);
    }
  };
  
  /**
   * Get selected shipping option price
   * 
   * @returns {number} Current shipping price
   */
  const getSelectedShippingPrice = () => {
    if (!selectedShippingOption || shippingOptions.length === 0) return shipping;
    
    const option = shippingOptions.find(opt => opt.id === selectedShippingOption);
    return option ? option.price : shipping;
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Your Shopping Cart</h1>
      
      {/* Empty cart state */}
      {cartItems.length === 0 ? (
        <Alert variant="info">
          Your cart is empty. <Link to="/cards">Continue shopping</Link>
        </Alert>
      ) : (
        <Row>
          {/* Cart items column */}
          <Col lg={8}>
            {/* Render each cart item */}
            {cartItems.map(item => (
              <CartItem 
                key={item.id} 
                item={item}
                premiumPackPrice={premiumPackPrice} 
              />
            ))}
            
            {/* Cart actions */}
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary"
                as={Link}
                to="/cards"
              >
                Continue Shopping
              </Button>
              <Button 
                variant="outline-danger"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </Col>
          
          {/* Order summary column */}
          <Col lg={4} className="mt-4 mt-lg-0">
            <Card className="shadow cart-summary">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">Order Summary</h4>
              </Card.Header>
              <Card.Body>
                {/* Subtotal */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                
                {/* Premium packaging total if any */}
                {cartItems.some(item => item.premiumPackaging) && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Premium Packaging:</span>
                    <span>
                      ${calculatePremiumPackagingTotal().toFixed(2)}
                    </span>
                  </div>
                )}
                
                {/* Shipping options selector */}
                <div className="mb-3">
                  <Form.Label>Shipping Method:</Form.Label>
                  {loadingPricing ? (
                    <p className="small text-muted">Loading shipping options...</p>
                  ) : shippingOptions.length > 0 ? (
                    <Form.Select 
                      value={selectedShippingOption}
                      onChange={(e) => handleShippingOptionChange(e.target.value)}
                      className="mb-2"
                    >
                      {shippingOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name} - ${option.price.toFixed(2)}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <p className="small text-muted">No shipping options available</p>
                  )}
                </div>
                
                {/* Shipping cost */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>${getSelectedShippingPrice().toFixed(2)}</span>
                </div>
                
                {/* Tax amount */}
                <div className="d-flex justify-content-between mb-3">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                  <span>${getTaxAmount().toFixed(2)}</span>
                </div>
                
                <hr />
                
                {/* Final total */}
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total:</strong>
                  <strong>${finalTotal.toFixed(2)}</strong>
                </div>
                
                {/* Checkout options */}
                <div className="mb-3">
                  <h5>Checkout Options</h5>
                  <Form.Check
                    type="radio"
                    name="checkoutMethod"
                    id="guest"
                    label="Checkout as Guest"
                    checked={checkoutMethod === 'guest'}
                    onChange={() => setCheckoutMethod('guest')}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    name="checkoutMethod"
                    id="login"
                    label="Sign In to Checkout"
                    checked={checkoutMethod === 'login'}
                    onChange={() => setCheckoutMethod('login')}
                  />
                </div>
                
                {/* Checkout button(s) */}
                {checkoutMethod === 'guest' ? (
                  <Button variant="success" size="lg" className="w-100">
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div>
                    <Button variant="primary" size="lg" className="w-100 mb-2">
                      Sign In
                    </Button>
                    <div className="text-center">
                      <small>Don't have an account? <Link to="/register">Register</Link></small>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Cart;