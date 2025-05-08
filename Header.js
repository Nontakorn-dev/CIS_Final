import React, { useState } from 'react';
import { Navbar, Container, Nav, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  
  const handleClose = () => setShowMenu(false);
  const handleShow = () => setShowMenu(true);

  return (
    <>
      <Navbar bg="white" expand="lg" className="app-header">
        <Container fluid className="px-3">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <img
                src="/images/watjai_logo.jpg"
                alt="WATJAI Logo"
                className="logo-image"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation - Visible on lg screens and up */}
          <div className="desktop-nav-container d-none d-lg-flex">
            <Nav className="ms-auto desktop-nav">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/measure">Measure</Nav.Link>
              <Nav.Link as={Link} to="/history">History</Nav.Link>
            </Nav>
          </div>
          
          {/* Mobile Toggle Button - Visible only on small screens */}
          <button 
            className="navbar-toggler d-lg-none" 
            type="button" 
            onClick={handleShow}
            aria-controls="offcanvasNavbar"
          >
            <span className="navbar-toggler-icon custom-toggler-icon"></span>
          </button>
        </Container>
      </Navbar>
      
      {/* Mobile Menu - Only shown when toggled on small screens */}
      <Offcanvas show={showMenu} onHide={handleClose} placement="end" className="mobile-menu d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mobile-nav">
            <Nav.Link as={Link} to="/" onClick={handleClose}>Home</Nav.Link>
            <Nav.Link as={Link} to="/measure" onClick={handleClose}>Measure</Nav.Link>
            <Nav.Link as={Link} to="/history" onClick={handleClose}>History</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
      
      <style jsx>{`
        .app-header {
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 0;
          height: 60px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          height: 60px;
        }
        
        .logo-link {
          display: block;
          text-decoration: none;
          height: 50px;
        }
        
        .logo-image {
          height: 100%;
          width: auto;
          max-width: 150px;
          object-fit: contain;
        }
        
        /* Desktop Navigation Styling */
        .desktop-nav-container {
          display: flex;
          align-items: center;
          height: 100%;
        }
        
        .desktop-nav {
          display: flex;
          align-items: center;
        }
        
        .desktop-nav .nav-link {
          color: #333 !important;
          font-weight: 500;
          padding: 0 1rem;
          font-size: 16px;
          transition: color 0.2s;
        }
        
        .desktop-nav .nav-link:hover {
          color: #e74c3c !important;
        }
        
        /* Mobile Toggle Button */
        .navbar-toggler {
          border: none;
          padding: 0.25rem 0.5rem;
          outline: none !important;
          box-shadow: none !important;
        }
        
        .custom-toggler-icon {
          display: inline-block;
          width: 1.5em;
          height: 1.5em;
          vertical-align: middle;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 100%;
        }
        
        /* Mobile Menu Styling */
        .mobile-menu {
          width: 250px;
        }
        
        .mobile-nav .nav-link {
          color: #333;
          font-size: 18px;
          padding: 12px 15px;
          border-bottom: 1px solid #f1f1f1;
        }
        
        .mobile-nav .nav-link:hover {
          background-color: #f8f9fa;
          color: #e74c3c;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 576px) {
          .app-header {
            height: 50px;
          }
          
          .logo-container {
            height: 50px;
          }
          
          .logo-image {
            max-width: 130px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;