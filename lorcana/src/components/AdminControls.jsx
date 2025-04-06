/**
 * AdminControls Component
 * 
 * Provides an administrative interface for managing all pricing settings:
 * - Premium pack pricing
 * - Shipping rates by region
 * - Default pricing by card rarity
 * - Individual card price updates
 */
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Tabs, Tab } from 'react-bootstrap';
import CardSearch from './CardSearch';
import { pricingApi } from '../services/api';

const AdminControls = () => {
  // State for premium pack price
  const [premiumPackPrice, setPremiumPackPrice] = useState(19.99);
  
  // State for shipping prices
  const [shippingPrices, setShippingPrices] = useState({
    GTA: 5.99,
    'Southern Ontario': 7.99,
    'Northern Ontario': 9.99,
    'Canada Wide': 12.99,
    'International': 24.99
  });
  
  // State for default rarity pricing
  const [rarityPrices, setRarityPrices] = useState({
    Common: 0.99,
    Uncommon: 1.99,
    Rare: 4.99,
    'Super Rare': 9.99,
    Legendary: 24.99
  });
  
  // Status messages
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', variant: 'success' });
  
  /**
   * Load saved settings on component mount
   */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log("Fetching pricing settings...");
        const data = await pricingApi.getPricingSettings();
        console.log("Received settings:", data);
        
        setPremiumPackPrice(data.premiumPackPrice);
        setShippingPrices(data.shippingPrices);
        setRarityPrices(data.rarityPrices);
      } catch (error) {
        console.error("Error loading admin settings:", error);
        setSaveStatus({
          show: true,
          message: 'Failed to load settings: ' + error.message,
          variant: 'danger'
        });
      }
    };
    
    fetchSettings();
  }, []);
  
  /**
   * Handle shipping price changes
   * 
   * @param {string} region - Shipping region name
   * @param {number} value - New price value
   */
  const handleShippingPriceChange = (region, value) => {
    setShippingPrices(prev => ({
      ...prev,
      [region]: value
    }));
  };
  
  /**
   * Handle rarity price changes
   * 
   * @param {string} rarity - Card rarity name
   * @param {number} value - New price value
   */
  const handleRarityPriceChange = (rarity, value) => {
    setRarityPrices(prev => ({
      ...prev,
      [rarity]: value
    }));
  };
  
  /**
   * Save all pricing settings to the database
   */
  const savePricingSettings = async () => {
    try {
      await pricingApi.updatePricingSettings({
        premiumPackPrice,
        shippingPrices,
        rarityPrices
      });
      
      setSaveStatus({
        show: true,
        message: 'All pricing settings saved successfully',
        variant: 'success'
      });
      
      // Set a timer to hide the message after 3 seconds
      setTimeout(() => setSaveStatus({show: false, message: '', variant: 'success'}), 3000);
      
    } catch (error) {
      console.error("Error saving pricing settings:", error);
      setSaveStatus({
        show: true,
        message: 'Failed to save settings: ' + error.message,
        variant: 'danger'
      });
    }
  };
  
  /**
   * Apply default rarity pricing to all cards in the database
   */
  const applyDefaultRarityPricing = async () => {
    try {
      await pricingApi.applyRarityPricing(rarityPrices);
      
      setSaveStatus({
        show: true,
        message: 'Default rarity prices applied to all cards',
        variant: 'success'
      });
    } catch (error) {
      console.error("Error applying rarity pricing:", error);
      setSaveStatus({
        show: true,
        message: 'Failed to apply rarity pricing: ' + error.message,
        variant: 'danger'
      });
    }
  };

  /**
   * Handle card selection in CardSearch component
   * 
   * @param {Object} card - Selected card object
   */
  const handleCardSelect = (card) => {
    console.log('Selected card in admin:', card);
  };

  return (
    <Container className="my-4">
      <h1 className="mb-4">Admin Pricing Controls</h1>
      
      {/* Status alert for success/error messages */}
      {saveStatus.show && (
        <Alert 
          variant={saveStatus.variant} 
          onClose={() => setSaveStatus({...saveStatus, show: false})} 
          dismissible
        >
          {saveStatus.message}
        </Alert>
      )}

      {/* Tab navigation for different pricing sections */}
      <Tabs defaultActiveKey="premium" id="admin-pricing-tabs" className="mb-3">
        {/* Premium Pack Pricing Tab */}
        <Tab eventKey="premium" title="Premium Pack">
          <Card className="mb-4">
            <Card.Header>Premium Pack Pricing</Card.Header>
            <Card.Body>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={4}>Premium Pack Price ($)</Form.Label>
                <Col sm={8}>
                  <Form.Control 
                    type="number" 
                    value={premiumPackPrice} 
                    onChange={e => setPremiumPackPrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </Col>
              </Form.Group>
              
              <div className="d-grid mt-3">
                <Button 
                  variant="primary" 
                  onClick={savePricingSettings}
                >
                  Save All Pricing Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Shipping Pricing Tab */}
        <Tab eventKey="shipping" title="Shipping Rates">
          <Card className="mb-4">
            <Card.Header>Shipping Prices</Card.Header>
            <Card.Body>
              {Object.keys(shippingPrices).map(region => (
                <Form.Group as={Row} className="mb-2" key={region}>
                  <Form.Label column sm={4}>{region} ($)</Form.Label>
                  <Col sm={8}>
                    <Form.Control 
                      type="number" 
                      value={shippingPrices[region]} 
                      onChange={e => handleShippingPriceChange(region, parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </Col>
                </Form.Group>
              ))}
              
              <div className="d-grid mt-3">
                <Button 
                  variant="primary" 
                  onClick={savePricingSettings}
                >
                  Save All Pricing Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        
        {/* Rarity Pricing Tab */}
        <Tab eventKey="rarity" title="Rarity Pricing">
          <Card className="mb-4">
            <Card.Header>Default Rarity Pricing</Card.Header>
            <Card.Body>
              {Object.keys(rarityPrices).map(rarity => (
                <Form.Group as={Row} className="mb-2" key={rarity}>
                  <Form.Label column sm={4}>{rarity} ($)</Form.Label>
                  <Col sm={8}>
                    <Form.Control 
                      type="number" 
                      value={rarityPrices[rarity]} 
                      onChange={e => handleRarityPriceChange(rarity, parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </Col>
                </Form.Group>
              ))}
              
              <div className="d-flex justify-content-between mt-3">
                <Button 
                  variant="warning" 
                  onClick={applyDefaultRarityPricing}
                >
                  Apply Default Pricing to All Cards
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={savePricingSettings}
                >
                  Save All Pricing Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Individual Card Pricing Tab */}
        <Tab eventKey="individual" title="Individual Cards">
          <Card>
            <Card.Header>Search and Update Individual Card Prices</Card.Header>
            <Card.Body>
              <CardSearch 
                showPriceControls={true}
                onCardSelect={handleCardSelect}
              />
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminControls;