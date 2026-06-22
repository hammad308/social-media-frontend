import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";

function FollowingDetails() {
    const [followings, setFollowings] = useState(null);
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const response = await axiosInstance.get(`users/following/${id}`);
                setFollowings(response?.data?.data?.following);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load Following")
            } finally {
                setLoading(false);
            }
        }
        fetchFollowing();
    }, [id]);
    if (followings?.length === 0) return <><Navbar /> <div className="container mt-4"><p className="text-center">No following. Follow users to see your following</p></div></>
    if (error) return <><Navbar /> <div className="container mt-4"> <p className="text-danger text-center">{error}</p></div> </>
    if (loading) return <><Navbar /> <div className="container mt-4"><div className="d-flex align-items-center justify-content-center h-100"><p className="text-center">Loading...</p></div></div></>
    return (
        <>
            <Navbar />
            <div className="container mt-4" style={{ maxWidth: "680px" }}>
                <h2 className="text-center mb-3">Following</h2>
                {followings?.map((following) => (
                    <div key={following._id}
                        className="card mb-2 p-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/profile/${following?._id}`)}>
                        <div className="d-flex align-items-center">
                            {following?.profilePicture ?
                                <img
                                    className="rounded-circle me-3"
                                    src={following?.profilePicture}
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                :
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center bg-dark text-white fs-5 fw-semibold me-3" style={{ width: "40px", height: "40px" }}>
                                    {following?.username?.[0].toUpperCase()}
                                </div>
                            }
                            <div className="flex-grow-1">
                                <p className="mb-1">{following?.username}</p>
                                <p className="text-muted small mb-0">{following?.bio || "No bio"}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
export default FollowingDetails;