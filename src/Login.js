import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    setLoading(true); // Set loading state to true

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Need to stringify the body
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedToken = data.token;

        // Store the token in localStorage
        localStorage.setItem("token", fetchedToken);

        // Navigate to the dashboard after successful login
        navigate("/");
      } else {
        // Login failed, display error message
        const errorMessage = await response.text();
        console.log(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      console.error("Error during login:", error.message);
    } finally {
      setLoading(false); // Set loading state to false
    }
  }

  return (
    <section className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
      <div className="container d-flex justify-content-center align-items-center">
        <div className="row justify-content-center">
          <div className=" col-8">
            <div className="bg-warning rounded-lg d-flex p-4 align-items-center">
              <div className="col-md-6 px-4">
                <h2 className="fw-bold fs-1 text-primary">Login</h2>
                <p className="small mt-3 text-primary">
                  If you are already a member, easily log in now.
                </p>
                {error && <p className="text-danger mt-2">{error}</p>}
                <form
                  className="d-flex flex-column gap-3"
                  onSubmit={handleLogin}
                >
                  <input
                    className="form-control mt-4 mb-1 rounded-3"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="position-relative">
                    <input
                      className="form-control rounded-3 w-100 mb-1"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                    />
                  </div>
                  <button
                    className="btn btn-primary py-2 rounded-3 fw-medium w-70"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
                <div>
                  <Link to="/forgetPassword">
                    <h3 className="mt-2 small  ">Forget Password?</h3>
                  </Link>
                </div>
                <div className="mt-3 small d-flex justify-content-between align-items-center">
                  <h6 className="me-3 me-md-0">New User?</h6>
                  <Link to="/signup">
                    <button className="btn btn-primary btn-sm rounded-3 fw-semibold">
                      Signup
                    </button>
                  </Link>
                </div>
              </div>
              <div className="col-md-6 d-none d-md-block">
                <img
                  className="rounded-lg img-fluid"
                  src="https://images.unsplash.com/photo-1552010099-5dc86fcfaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxmcmVzaHxlbnwwfDF8fHwxNzEyMTU4MDk0fDA&ixlib=rb-4.0.3&q=80&w=1080"
                  alt="login form"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
