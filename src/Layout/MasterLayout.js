import React from 'react';
import Header from './components/Header/Header';
import MainScreen from './components/MainScreen/MainScreen';
import Footer from './components/Footer/Footer';
import '../assests/styles/MasterLayout.scss';

function MasterLayout() {
  return (
    <div className='all'>
      <Header className="header" />
      <MainScreen className="main" />
      <Footer className="footer" />
    </div>
  );
}

export default MasterLayout;
