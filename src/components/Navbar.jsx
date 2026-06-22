import { Link, useNavigate } from "react-router-dom";
function Navbar() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }
    const handleLogin = () => {
        const token = localStorage.getItem("token");
        if (token) {
            return true;
        }
        return false;
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                <Link className="navbar-brand fw-bold text-primary fs-4" to="/">
                    Social Media
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse"
                    id="navbarContent">
                    <div className="d-flex flex-column flex-lg-row gap-2 align-items-end ms-auto">
                        <Link className="btn btn-outline-primary" to="/">
                            <i className="bi bi-house me-1"></i>
                            Home
                        </Link>
                        <Link className=" btn btn-outline-primary" to="/search">
                            <i className="bi bi-search me-1"></i>
                            Search
                        </Link>
                        <Link className="btn btn-outline-primary" to="/chat">
                            <i className="bi bi-chat-dots me-1"></i>
                            Chat
                        </Link>
                        <Link className="btn btn-outline-primary" to="/notifications">
                            <i className="bi bi-bell me-1"></i>
                            Notifications
                        </Link>
                        <Link className="btn btn-outline-primary me-2" to="/profile">
                            <i className="bi bi-person me-1"></i>
                            Profile
                        </Link>
                        {handleLogin && <button className="btn btn-danger me-2" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Logout
                        </button>}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;