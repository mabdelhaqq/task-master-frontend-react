import React from 'react';
import logo from '../../../assests/images/logo-no-background.png';
import './Header.scss';

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="img-logo" />
    </header>
  );
}

export default Header;
