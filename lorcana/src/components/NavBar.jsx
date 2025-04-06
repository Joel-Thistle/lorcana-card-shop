/**
 * Navigation Bar Component
 * 
 * Provides site-wide navigation with dynamic active state highlighting
 * and cart count indicator from the cart context.
 */
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * NavBar component displays the main navigation bar
 * Highlights the current active page and shows cart item count
 */
function NavBar() {
    const location = useLocation();
    const { cartCount } = useCart();
    
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
            <div className="container">
                {/* Site logo/brand */}
                <Link className="navbar-brand" to="/">
                    <img
                        src="/imgs/LorcanaCardStore.png" 
                        height="125"
                        className="d-inline-block align-top"
                        alt="Lorcana Store Logo"
                    />
                </Link>
                
                {/* Mobile toggle button */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                {/* Navigation links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {/* Home link */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/' ? 'text-primary fw-bold' : ''}`} 
                                to="/"
                            >
                                Home
                            </Link>
                        </li>
                        
                        {/* Cards link */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/cards' ? 'text-primary fw-bold' : ''}`} 
                                to="/cards"
                            >
                                Cards
                            </Link>
                        </li>
                        
                        {/* About link */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/about' ? 'text-primary fw-bold' : ''}`} 
                                to="/about"
                            >
                                About
                            </Link>
                        </li>
                        
                        {/* Contact link */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/contact' ? 'text-primary fw-bold' : ''}`} 
                                to="/contact"
                            >
                                Contact
                            </Link>
                        </li>
                        
                        {/* Cart link with item count */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/cart' ? 'text-primary fw-bold' : ''}`} 
                                to="/cart"
                            >
                                <i className="bi bi-cart"></i> Cart ({cartCount})
                            </Link>
                        </li>
                        
                        {/* Admin link */}
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${location.pathname === '/admin' ? 'text-primary fw-bold' : ''}`} 
                                to="/admin"
                            >
                                Admin
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;