import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSignup(event) {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, email: email, password: password }),
      });

      if (response.ok) {
        // Navigate to the login page after successful signup
        navigate("/login");
      } else {
        // Signup failed, display error message
        console.error("Signup failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during Signup:", error.message);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card bg-dark text-white" style={{ width: "24rem" }}>
        <div className="card-body">
          <form onSubmit={handleSignup}>
            <div className="mb-3 d-block">
              <label htmlFor="name" className="form-label ">
                Your name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Your email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Your password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <button type="submit" className="btn btn-primary">
                Signup
              </button>
              <div className="small">
                <p className="mb-0">
                  Already have an account?
                  <Link to="/login" className="text-decoration-underline ms-1">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
