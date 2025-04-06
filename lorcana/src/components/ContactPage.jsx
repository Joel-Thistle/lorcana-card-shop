import Form from 'react-bootstrap/Form';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';

function ContactPage() {
  function HeroImage() {
    return (
      <Container fluid className="p-0 position-relative hero-container rounded-2">
        <Image 
          src="/imgs/disneylorcana.avif" 
          alt="Lorcana Hero Banner" 
          fluid 
          className="w-100 hero-image"
        />
        <div className="position-absolute hero-text-overlay">
          <h2>Contact Us</h2>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Enter Your Email Address</Form.Label>
              <Form.Control type="email" placeholder="name@example.com" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>We are here to answer any questions</Form.Label>
              <Form.Control as="textarea" rows={3} style={{resize: "vertical", minHeight: "100px",
                 maxHeight: "250px",
                 overflowY: "auto"}} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </Container>
    );
  }

  return (
    <>
      <HeroImage />
      {/* Add more sections as needed */}
    </>
  );
}

export default ContactPage;