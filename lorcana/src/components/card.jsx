/**
 * Card Components
 * 
 * This file contains components for displaying cards:
 * - CardItem: Displays a single card with image, details, and add to cart functionality
 * - DisplayCard: Main container component that displays a grid of cards with filtering and pagination
 */
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Toast, Collapse, Form, ButtonGroup, Pagination } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { cardsApi } from '../services/api';

/**
 * Individual card component to display a single card
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Card ID for fetching if cardData not provided
 * @param {Object} props.cardData - Card data object (optional, will fetch using ID if not provided)
 */
function CardItem({ id, cardData: propCardData }) {
  const [cardData, setCardData] = useState(propCardData || null);
  const [loading, setLoading] = useState(!propCardData);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const { addToCart } = useCart();

  // Fetch card data if not provided through props
  useEffect(() => {
    // If we already have card data from props, no need to fetch
    if (propCardData) {
      setCardData(propCardData);
      setLoading(false);
      return;
    }

    // If no ID provided, don't try to fetch
    if (!id) {
      setLoading(false);
      return;
    }

    /**
     * Fetch card data from API
     */
    const fetchCardData = async () => {
      try {
        const data = await cardsApi.getCardById(id);
        setCardData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching card:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCardData();
  }, [id, propCardData]);

  /**
   * Handle adding the card to cart
   * Shows a temporary toast notification
   */
  const handleAddToCart = () => {
    addToCart(cardData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Loading, error, and empty states
  if (loading) return <div className="text-center p-3">Loading card...</div>;
  if (error) return (
    <div className="text-center p-3 border rounded">
      <p className="text-danger">Error: {error}</p>
    </div>
  );
  if (!cardData) return <div className="text-center p-3">No card data found</div>;

  // Render card with data
  return (
    <>
      <Card style={{ width: '100%', height: '100%', backgroundColor: '#34d1e6' }}>
        <Card.Img variant="top" src={cardData.Image || "holder.js/100px180"} />
        <Card.Body>
          <Card.Title>{cardData.Name || "Card Title"}</Card.Title>
          <Card.Text>
            Rarity: {cardData.Rarity || "No description available"}
            <br />
            Colour: {cardData.Color || cardData.Flavor_Text}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">${cardData.Price || 3.99}</span>
            <Button variant="primary" onClick={handleAddToCart}>Add To Cart</Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Toast notification for add to cart confirmation */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
        bg="success"
        delay={3000}
        autohide
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">Added to Cart</strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {cardData.Name} has been added to your cart
        </Toast.Body>
      </Toast>
    </>
  );
}

/**
 * Container component to display multiple cards with filtering and pagination
 * Fetches all cards and provides filtering by set, rarity, and color
 */
function DisplayCard() {
  // Card data states
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  
  // Pagination states
  const [cardsPerPage, setCardsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Unique values for filters
  const [sets, setSets] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [colors, setColors] = useState([]);

  // Calculate pagination values
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  /**
   * Fetch all cards and extract filter values on component mount
   */
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await cardsApi.getAllCards();
        setCards(data);
        setFilteredCards(data);
        
        // Extract unique values for filters
        const uniqueSets = [...new Set(data.map(card => card.Set_Num).filter(Boolean))]
          .map(set => typeof set === 'string' ? set : set.toString())
          .sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.localeCompare(b);
          });
        const uniqueRarities = [...new Set(data.map(card => card.Rarity).filter(Boolean))];
        const uniqueColors = [...new Set(data.map(card => card.Color).filter(Boolean))];
        
        setSets(uniqueSets);
        setRarities(uniqueRarities);
        setColors(uniqueColors);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cards:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCards();
  }, []);
  
  /**
   * Apply filters when any filter selection changes
   */
  useEffect(() => {
    let result = [...cards];
    
    if (selectedSet) {
      // Convert string to number if Set_Num is stored as a number
      result = result.filter(card => {
        // Check if Set_Num is a number in the database
        if (typeof card.Set_Num === 'number') {
          return card.Set_Num === Number(selectedSet);
        }
        // Otherwise use string comparison
        return card.Set_Num === selectedSet;
      });
    }
    
    if (selectedRarity) {
      result = result.filter(card => card.Rarity === selectedRarity);
    }
    
    if (selectedColor) {
      result = result.filter(card => card.Color === selectedColor);
    }
    
    setFilteredCards(result);
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [selectedSet, selectedRarity, selectedColor, cards]);
  
  /**
   * Reset to first page when cards per page changes
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [cardsPerPage]);
  
  /**
   * Clear all applied filters
   */
  const clearFilters = () => {
    setSelectedSet('');
    setSelectedRarity('');
    setSelectedColor('');
  };
  
  /**
   * Go to next page of cards
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  /**
   * Go to previous page of cards
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  /**
   * Change number of cards displayed per page
   * 
   * @param {number} count - Number of cards per page
   */
  const handleCardsPerPageChange = (count) => {
    setCardsPerPage(count);
  };

  // Loading, error, and empty states
  if (loading) return <div className="text-center mt-5">Loading cards...</div>;
  if (error) return <div className="text-center mt-5 text-danger">Error loading cards: {error}</div>;
  if (cards.length === 0) return <div className="text-center mt-5">No cards found</div>;

  // Render card listing with filters and pagination
  return (
    <Container fluid className="p-0 mt-0">
      {/* Header with filter controls */}
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Cards Available</h2>
          <div className="d-flex align-items-center">
            <span className="me-2">Cards per page:</span>
            <ButtonGroup className="me-3">
              {[8, 12, 24].map(count => (
                <Button 
                  key={count}
                  variant={cardsPerPage === count ? "primary" : "outline-primary"}
                  onClick={() => handleCardsPerPageChange(count)}
                >
                  {count}
                </Button>
              ))}
            </ButtonGroup>
            <Button 
              onClick={() => setOpenFilter(!openFilter)}
              aria-controls="filter-collapse"
              aria-expanded={openFilter}
              variant="outline-primary"
            >
              {openFilter ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        
        {/* Collapsible filter panel */}
        <Collapse in={openFilter}>
          <div id="filter-collapse" className="mt-3 p-3 border rounded bg-light">
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Filter by Set</Form.Label>
                  <Form.Select 
                    value={selectedSet}
                    onChange={(e) => setSelectedSet(e.target.value)}
                  >
                    <option value="">All Sets</option>
                    {sets.map(set => (
                      <option key={set} value={set}>{set}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Filter by Rarity</Form.Label>
                  <Form.Select 
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                  >
                    <option value="">All Rarities</option>
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>{rarity}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Filter by Color</Form.Label>
                  <Form.Select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">All Colors</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {filteredCards.length} of {cards.length} cards
              </small>
              <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </div>
        </Collapse>
      </div>
      
      {/* Card grid */}
      <Row className="mx-0">
        {currentCards.length > 0 ? (
          currentCards.map(card => (
            <Col key={card._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <CardItem id={card._id} cardData={card} />
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center p-5">
            <p>No cards match the selected filters.</p>
            <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
          </Col>
        )}
      </Row>
      
      {/* Pagination controls */}
      {filteredCards.length > 0 && (
        <div className="d-flex justify-content-between align-items-center p-3">
          <div>
            Showing {indexOfFirstCard + 1}-{Math.min(indexOfLastCard, filteredCards.length)} of {filteredCards.length} cards
          </div>
          <Pagination className="mb-0">
            <Pagination.Prev 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            />
            
            {/* Show current page and total pages */}
            <Pagination.Item active>{currentPage}</Pagination.Item>
            
            {/* Show next page if available */}
            {currentPage < totalPages && (
              <Pagination.Item onClick={() => setCurrentPage(currentPage + 1)}>
                {currentPage + 1}
              </Pagination.Item>
            )}
            
            {/* Show ellipsis if there are more pages */}
            {currentPage + 1 < totalPages && (
              <Pagination.Ellipsis disabled />
            )}
            
            {/* Always show the last page if not current */}
            {currentPage < totalPages && (
              <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </Pagination.Item>
            )}
            
            <Pagination.Next 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
}

export default DisplayCard;