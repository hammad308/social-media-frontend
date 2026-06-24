import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CommentsSection from "./CommentsSection";
function PublicProfile() {
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams();
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();
    const [expandedComments, setExpandedComments] = useState(null);
    const [posts,setPosts] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response1 = await axiosInstance.get(`/users/${userId}`);
                setUser(response1?.data?.data);
                const response2= await axiosInstance.get("/users/me");
                if(response1?.data?.data?.id == response2?.data?.data?._id) return navigate("/profile");
                setPosts(response1?.data?.data?.posts);
                setIsFollowing(response1?.data?.data?.isFollowing || false);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [userId]);
    const handleFollow = async () => {
        try {
            await axiosInstance.post(`/users/${userId}/follow`);
            setIsFollowing(true);
            setUser({
                ...user,
                followersCount: user.followersCount + 1
            })
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to Follow");
        }
    }
    const handleUnfollow = async () => {
        try {
            await axiosInstance.delete(`/users/${userId}/follow`);
            setIsFollowing(false);
            setUser({
                ...user,
                followersCount: user.followersCount - 1
            })
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to Unfollow")
        }
    }
    const handleMessage = async (userId) => {
        try {
            const response = await axiosInstance.post(`/conversations/${userId}`);
            const conversation = response.data.data;
            navigate(`/chat?conversationId=${conversation._id}`);
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to Load Chat");
        }
    }
    const handleReact = async (postId, type) => {
        const currentPost = posts.find(p => p._id === postId);
        const isCurrentlyLiked = currentPost?.isLikedByUser;
        setPosts((prev) =>
            prev.map((post) =>
                post._id === postId ? { ...post, reactionsCount: isCurrentlyLiked ? post.reactionsCount - 1 : post.reactionsCount + 1, isLikedByUser: !isCurrentlyLiked } : post)
        );
        try {
            await axiosInstance.post(`/posts/${postId}/reactions`, {
                type
            });
        } catch (error) {
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId ? { ...post, reactionsCount: currentPost.reactionsCount, isLikedByUser: isCurrentlyLiked } : post));
            setError(error?.response?.data?.message || "Failed to react on post");
        }
    }
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container mt-5 text-center">
                    <p className="text-muted">Loading...</p>
                </div>
            </>
        )
    };
    if(error) return <><Navbar /> <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-danger text-center">{error}</p></div></>
    return (
        <>
            <Navbar />
            <div className="container mt-4" style={{ maxWidth: "680px" }}>
                <div className="card border-0">
                    <div className="card-body text-center">
                        <div className="mb-3 border-secondary bg-secondary"
                            style={{
                                height: "200px",
                                backgroundImage: `url(${user.coverPicture || ""})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "8px",
                                border: "1.5px solid black"
                            }}
                        />
                        <div className="text-center">
                            <div className="d-flex justify-content-center" style={{ marginTop: "-60px", marginBottom: "20px" }}>
                                {user.profilePicture ?
                                    <img src={user.profilePicture}
                                        className="rounded-circle mb-3 mt-3 border border-dark" style={{ width: "100px", height: "100px", objectFit: "cover", marginTop: "-60px" }} alt="Profile Picture" />
                                    :
                                    <div className="rounded-circle d-flex justify-content-center fs-1 fw-semibold align-items-center text-white bg-primary mb-3 mt-3 border border-dark" style={{ width: "100px", height: "100px" }}> {user.username?.[0].toUpperCase()}</div>}
                            </div>
                            <h3>{user.username}</h3>
                            <p>{user.bio || "No Bio"}</p>
                            <hr className="my-2" />
                            <div className="row m-2">
                                <div className="col me-2" style={{ cursor: "pointer" }} onClick={() => navigate(`/followers/${user.id}`)}>
                                    <h5>{user?.followersCount || 0}</h5>
                                    <p>Followers</p>
                                </div>
                                <div className="col me-2" style={{ cursor: "pointer" }} onClick={() => navigate(`/following/${user.id}`)}>
                                    <h5>{user?.followingCount || 0}</h5>
                                    <p>Following</p>
                                </div>
                                <div className="col me-2">
                                    <h5>{user?.posts?.length || 0}</h5>
                                    <p>Posts</p>
                                </div>
                            </div>
                            {isFollowing ?
                                <button
                                    className="btn btn-outline-dark mt-5 "
                                    onClick={handleUnfollow}>Unfollow
                                </button>
                                :
                                <button
                                    className="btn btn-outline-dark mt-5"
                                    onClick={handleFollow}>Follow
                                </button>
                            }
                            <button
                                className="btn btn-outline-dark mt-5 ms-5"
                                onClick={() => handleMessage(user.id)}>Message
                            </button>
                        </div>
                    </div>
                </div>
                <h3 className="mb-3 mt-3 text-center">User's Posts</h3>
                {posts?.length === 0 && !error && (
                    <p className="text-center text-muted mt-5 ">No post yet</p>
                )}

                {posts?.map((post) => (
                    <div key={post._id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                                {post.author.profilePicture && <img src={post.author.profilePicture} className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px" }}></img>
                                }
                                {!post.author.profilePicture && <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                    style={{ width: "40px", height: "40px", fontSize: "15px", fontWeight: "600", flexShrink: 0 }} >
                                    {post.author.username?.[0].toUpperCase()}
                                </div>}
                                <div>
                                    <p className="mb-0 fw-semibold" style={{ fontSize: "14px" }}>{post.author.username}</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                                        {new Date(post.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {post.content && (
                                <p className="mb-2" style={{ fontSize: "15px" }}>{post.content}</p>
                            )}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="post"
                                    className="rounded w-100 mb-2"
                                    style={{ maxHeight: "400px", objectFit: "cover" }}
                                />
                            )}
                            <hr className="my-2" />
                            <div className="d-flex gap-2 ">
                                <button className={`btn border flex-fill ${post.isLikedByUser ? "border-primary" : "border-secondary"}`} onClick={(e) => { handleReact(post._id, "like"); e.stopPropagation() }}>
                                    <span className="me-3">{post.reactionsCount}</span>
                                    <i className={` fs-5 ${post.isLikedByUser ? "text-primary bi bi-hand-thumbs-up-fill" : "text-secondary bi bi-hand-thumbs-up"}`}></i>
                                </button>
                                <button className={`btn border flex-fill ${expandedComments === post._id ? "border-primary" : "border-secondary"}`} onClick={(e) => { e.stopPropagation(); setExpandedComments(expandedComments === post._id ? null : post._id) }}>
                                    <i className={` fs-5 ${expandedComments === post._id ? "text-primary bi bi-chat-fill" : "text-secondary bi bi-chat"}`}></i>
                                </button>
                                <button className={`btn border flex-fill border-secondary`} onClick={(e) => e.stopPropagation()} style={{ cursor: "default" }}>
                                    <span className="me-3">{post?.views?.length}</span>
                                    <i className={`bi bi-eye text-secondary fs-5`}></i>
                                </button>
                            </div>
                            {expandedComments === post._id && <CommentsSection postId={expandedComments} />}

                        </div>
                    </div>
                ))}
            </div >
        </>
    )
}
export default PublicProfile;