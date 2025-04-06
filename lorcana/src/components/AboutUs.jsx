import { Container, Row, Col, Image } from 'react-bootstrap';

function HeroImage() {
  return (
    <Container fluid className="p-0 position-relative hero-container rounded-2">
      <Image 
        src="/imgs/bigHero6.webp" 
        alt="Lorcana Hero Banner" 
        fluid 
        className="w-100 hero-image"
      />
      <div className="position-absolute hero-text-overlay">
        <h1>About Lorcana Card Shop</h1>
        <p className="lead">We are a leading reseller of Lorcana cards. We operate out of Toronto, Ontario. 
            Shipping is calculated on how many cards purchased, level of packaging requested.   </p>
      </div>
    </Container>
  );
}



function AboutUs() {
  return (
    <>
      <HeroImage />
      
      {/* Add more sections as needed */}
    </>
  );
}

export default AboutUs;