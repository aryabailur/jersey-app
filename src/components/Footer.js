import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__grid">
          <div className="footer__about">
            <h3 className="footer__logo">
              JERSEY<span className="footer__logo--red">HUB</span>
            </h3>
            <p>
              The ultimate destination for authentic football kits. Wear your
              passion with pride.
            </p>
          </div>
          <div className="footer__links">
            <h4 className="footer__heading">Shop</h4>
            <a href="#">New Arrivals</a>
            <a href="#">Club Kits</a>
            <a href="#">National Teams</a>
            <a href="#">On Sale</a>
          </div>
          <div className="footer__links">
            <h4 className="footer__heading">Support</h4>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">Track Order</a>
          </div>
          <div className="footer__subscribe">
            <h4 className="footer__heading">Stay Connected</h4>
            <p>Subscribe for the latest drops, deals, and more.</p>
            <form className="footer__form">
              <input type="email" placeholder="Your Email" />
              <button type="submit">Go</button>
            </form>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} JerseyHub. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}