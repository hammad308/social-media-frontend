import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );
            localStorage.setItem("token", response.data.data.token);
            navigate("/");

        } catch (error) {
            setError(error.response.data.message);
        }
        finally {
            setLoading(false);
        }
    }
    if (loading) return <>
        <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-center">Loading...</p></div>
    </>
    return (
        <>
            <div className="container">

                <div
                    className="row vh-100 justify-content-center align-items-center"
                >

                    <div className="col-md-5">

                        <div className="card shadow">

                            <div className="card-body p-5 text-center">
                                <h2 className="fw-bold mb-2">Welcome Back</h2>
                                <p className="text-muted mb-4 lead">
                                    Login to continue your social journey
                                </p>

                                <input
                                    type="email"
                                    className="form-control mb-3"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value) }}
                                />

                                <input
                                    type="password"
                                    className="form-control mb-3"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value) }}
                                />

                                <button
                                    className="btn btn-dark w-100 mb-3"
                                    onClick={handleLogin}
                                >

                                    Login

                                </button>
                                {error && <p className="text-danger text-center">{error}</p>}
                                <div className="ws-pre-wrap fs-6 text-dark text-center">
                                    Don't have an account?      <Link className="text-decoration-none" to="/signup">Signup</Link>
                                </div>
                                <button className="btn btn-primary w-100 mt-3" onClick={() => window.location.href = "http://https://social-media-backend-m65i.onrender.com/api/auth/google"}>Continue with Google</button>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default Login;