/**
 * CardSearch Component
 * 
 * A reusable component for searching cards by name, set, or rarity.
 * Can be used in different contexts:
 * - Admin mode: For updating card prices (showPriceControls=true)
 * - User mode: For adding cards to cart (showPriceControls=false)
 */
import React, { useState } from 'react';
import { Form, Button, Table, Alert, InputGroup, Card } from 'react-bootstrap';
import { cardsApi } from '../services/api';

/**
 * CardSearch Component
 * 
 * @param {Object} props
 * @param {Function} props.onCardSelect - Callback when a card is selected
 * @param {boolean} props.showPriceControls - Whether to show price update controls (admin mode)
 */
const CardSearch = ({ onCardSelect, showPriceControls = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [newCardPrice, setNewCardPrice] = useState('');
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', variant: 'info' });

  /**
   * Handle search for cards
   * Fetches cards from API based on search query
   * 
   * @param {Event} e - Form submit event
   */
  const handleCardSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setStatusMessage({ show: false, message: '', variant: 'info' });
    
    try {
      const data = await cardsApi.searchCards(searchQuery);
      setSearchResults(data);
      
      if (data.length === 0) {
        setStatusMessage({
          show: true,
          message: 'No cards found matching your search criteria.',
          variant: 'info'
        });
      }
    } catch (error) {
      console.error("Error searching cards:", error);
      setStatusMessage({
        show: true,
        message: 'Search failed: ' + error.message,
        variant: 'danger'
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  /**
   * Handle card selection
   * Updates local state and calls parent callback
   * 
   * @param {Object} card - Selected card object
   */
  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setNewCardPrice(card.Price || '');
    
    // Pass the selected card to the parent component
    if (onCardSelect) {
      onCardSelect(card);
    }
  };
  
  /**
   * Handle price update for individual card
   * Only available in admin mode (showPriceControls=true)
   */
  const updateCardPrice = async () => {
    if (!selectedCard || !newCardPrice) return;
    
    try {
      await cardsApi.updateCardPrice(selectedCard._id, parseFloat(newCardPrice));
      
      setStatusMessage({
        show: true,
        message: `Price updated for card: ${selectedCard.Name}`,
        variant: 'success'
      });
      
      // Update the card in search results
      setSearchResults(prev => 
        prev.map(card => 
          card._id === selectedCard._id 
            ? {...card, Price: parseFloat(newCardPrice)} 
            : card
        )
      );
    } catch (error) {
      console.error("Error updating card price:", error);
      setStatusMessage({
        show: true,
        message: 'Failed to update price: ' + error.message,
        variant: 'danger'
      });
    }
  };

  return (
    <div>
      {/* Status message alert */}
      {statusMessage.show && (
        <Alert 
          variant={statusMessage.variant} 
          onClose={() => setStatusMessage({...statusMessage, show: false})} 
          dismissible
        >
          {statusMessage.message}
        </Alert>
      )}
      
      {/* Search form */}
      <Form onSubmit={handleCardSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search for cards by name, set, or rarity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </InputGroup>
      </Form>
      
      {/* Search results table */}
      {searchResults.length > 0 ? (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Set</th>
                <th>Rarity</th>
                <th>Current Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map(card => (
                <tr 
                  key={card._id}
                  className={selectedCard && selectedCard._id === card._id ? 'table-primary' : ''}
                >
                  <td>{card.Name}</td>
                  <td>{card.Set_Num}</td>
                  <td>{card.Rarity}</td>
                  <td>${card.Price?.toFixed(2) || 'N/A'}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleCardSelect(card)}
                    >
                      {showPriceControls ? 'Select' : 'Add to Cart'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : searchQuery && !isSearching ? (
        <Alert variant="info">No cards found matching your search query.</Alert>
      ) : null}
      
      {/* Price update form - only shown in admin mode */}
      {showPriceControls && selectedCard && (
        <Card className="mt-4">
          <Card.Header>Update Price for: {selectedCard.Name}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>New Price ($)</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  value={newCardPrice}
                  onChange={e => setNewCardPrice(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <Button 
                  variant="success" 
                  onClick={updateCardPrice}
                >
                  Update
                </Button>
              </InputGroup>
            </Form.Group>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CardSearch;