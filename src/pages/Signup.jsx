import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const handleSignup = async () => {
        try {
            const response = await axiosInstance.post(
                "/auth/signup",
                {
                    username,
                    email,
                    password
                }
            );
            localStorage.setItem("token", response.data.data.token);
            navigate("/");
        } catch (error) {
            setError(error.response.data.message);
        }

    }
    return (
        <>
            <div className="container">

                <div
                    className="row vh-100 justify-content-center align-items-center"
                >

                    <div className="col-md-6">

                        <div className="card shadow">

                            <div className="card-body p-5">
                                <h1 className="display-4 fw-bold text-center">Join Us</h1>
                                <p className="lead text-center">
                                    Create your profile, share posts, and connect with friends.
                                </p>

                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value) }}
                                />

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
                                    className="btn btn-primary w-100 mb-3"
                                    onClick={handleSignup}
                                >

                                    Signup

                                </button>
                                {error && <p className="text-danger text-center" >{error}</p>}

                            </div>

                        </div>

                    </div>
                </div>

            </div>

        </>
    )
}

export default Signup;