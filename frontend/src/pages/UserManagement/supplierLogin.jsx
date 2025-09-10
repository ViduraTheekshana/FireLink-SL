import React from 'react';
import './supplier.css';

const SupplierLogin = () => {
  return (
    <div className="supplier-login-container">
      <div className="supplier-login-card">
        <div className="supplier-login-left">
          <h1>Login as a supplier</h1>
          <img src="https://i.imgur.com/YdFnSK9.png" alt="FireLink-SL Logo" style={{width: '200px', height: 'auto'}}/>
          <div>FireLink-SL</div>
        </div>  
        <div className="supplier-login-right">
          <h2 className="supplier-login-title">Login Now !</h2>
          <form className="supplier-login-form">
            <label htmlFor="email">Enter your email</label>
            <input type="email" id="email" placeholder="Enter Your Email" />
            <label htmlFor="password">Enter your password</label>
            <input type="password" id="password" placeholder="Enter your password" />
            <button type="submit" className="supplier-login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin;
