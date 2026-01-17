import React from 'react';

const Login = ({ formData, handleInputChange, handleLogin }) => {
  return (
    <div className="container login-container d-flex justify-content-center align-items-center vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-md-5">
          <div className="card shadow-lg border-0 rounded-lg mt-5 bg-dark text-white">
            <div className="card-header border-secondary">
              <h1 className="text-center font-weight-light">後台管理系統</h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="form-floating mb-2">
                  <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={handleInputChange} required autoFocus />
                  <label className="text-white-50" htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
                  <label className="text-white-50" htmlFor="password">Password</label>
                </div>
                <div className="form-floating mt-2 d-grid">
                  <button className="btn btn-primary btn" type="submit">登入</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;