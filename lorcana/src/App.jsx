/**
 * Main Application Component
 * 
 * This is the root component of the Lorcana Card Shop application.
 * It sets up the routing structure and wraps child components in the CartProvider
 * to provide cart functionality throughout the application.
 */
import { Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import DisplayCard from './components/card';
import NavBar from './components/NavBar';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutUs';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer';
import Cart from './components/Cart';
import { CartProvider } from './context/CartContext';
import AdminControls from './components/AdminControls';

/**
 * App Component
 * 
 * Sets up the main application structure:
 * - Wraps content in CartProvider for cart state management
 * - Adds NavBar and Footer to all pages
 * - Configures routes to different pages
 */
function App() {
  return (
    <CartProvider>
      <NavBar />
      <Routes>
        {/* Main public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cards" element={<DisplayCard />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Admin routes - should be protected in a production app */}
        <Route path="/admin" element={<AdminControls />} />
        
        {/* Catch-all route for 404 errors */}
        <Route path="*" element={<div>Something went wrong `_`</div>} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}

export default App;
