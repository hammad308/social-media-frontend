import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";

function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/users/search/users?username=${searchQuery}`);
            setSearchResults(response.data.data);
        } catch (error) {
            setError(error?.response?.data?.message || "Search Failed");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <Navbar />
            <div className="container mt-4" style={{ maxWidth: "680px" }}>
                <h4 className="mb-4 text-center">Search Users</h4>
                <div className="d-flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="search by username..."
                        className="form-control"
                        value={searchQuery}
                        onChange={(e) =>{
                            setSearchQuery(e.target.value);
                            searchQuery.trim()? handleSearch(): setSearchResults([]);
                        }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                        onKeyPress={(e) => { e.key === "Enter" && handleSearch() }}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>
                {error && <p className="text-danger text-center">{error}</p>}
                {searchResults.length === 0 && !loading && searchQuery && (
                    <p className="text-center text-muted">No Users Found</p>
                )}
                <div>
                    {searchQuery && searchResults.map((user) => (
                        <div
                            key={user._id}
                            style={{ cursor: "pointer" }}
                            className="card mb-3 p-3"
                            onClick={() => navigate(`/profile/${user._id}`)}
                        >
                            <div className="d-flex align-items-center">
                                {user.profilePicture
                                    ? <img
                                        src={user.profilePicture}
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px", objectFit: "cover", flexShrink: 0 }}
                                    />
                                    :
                                    <div
                                        className="d-flex flex-column justify-content-center align-items-center rounded-circle text-white bg-dark fs-6 fw-semibold me-2"
                                        style={{ width: "40px", height: "40px", flexShrink: 0 }}
                                    >
                                        {user.username[0].toUpperCase()}
                                    </div>
                                }
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{user.username}</h6>
                                    <p className="text-muted small mb-0">{user?.bio || "No Bio"}</p>
                                </div>
                                <p className="text-muted small mb-0">{user?.followers?.length || 0} followers</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
export default Search;