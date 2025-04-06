import { Container, Row, Col, Image } from 'react-bootstrap';

function HeroImage() {
  return (
    <Container fluid className="p-0 position-relative hero-container rounded-2">
      <Image 
        src="/imgs/lorcana-ana-hero-deck.avif" 
        alt="Lorcana Hero Banner" 
        fluid 
        className="w-100 hero-image"
      />
      <div className="position-absolute hero-text-overlay">
        <h1>Welcome to Lorcana Card Shop</h1>
        <p className="lead">Discover the magic of Disney Lorcana TCG</p>
      </div>
    </Container>
  );
}



function HomePage() {
  return (
    <>
      <HeroImage />
     
      {/* Add more sections as needed */}
    </>
  );
}

export default HomePage;