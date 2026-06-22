import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import CommentsSection from "./CommentsSection";

function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axiosInstance.get(`/posts/${id}`);
                setPost(response.data.data);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to Load Post");
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [id]);

    const handleReact = async (postId, type) => {
        const isCurrentlyLiked = post?.isLikedByUser;
        setPost((prev) => ({
            ...prev,
            reactionsCount: isCurrentlyLiked ? prev.reactionsCount - 1 : prev.reactionsCount + 1,
            isLikedByUser: !isCurrentlyLiked
        }))
        try {
            await axiosInstance.post(`/posts/${postId}/reactions`, {
                type
            });
        } catch (error) {
            setPost((prev) => ({
                ...prev,
                isLikedByUser: isCurrentlyLiked
            }));
            setError(error?.response?.data?.message || "Failed to react on post");
        }
    }
    if (loading) return <><Navbar /> <p className="text-center mt-5">Loading....</p></>
    if (error) return <><Navbar /> <p className="text-center mt-5">{error}</p></>
    if (!post) return null;
    return (
        <>
            <Navbar />
            <div className=" container mt-4" style={{ maxWidth: "680px" }}>
                <button className="btn btn-outline-primary mb-3" onClick={() => navigate(-1)}>← Back</button>
                <div className="card shadow-sm">
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
                            <p className="mb-2" style={{ fontSize: "15px", }}>{post.content}</p>
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
                            <button className={`btn border flex-fill border-primary`}>
                                <i className={` fs-5 text-primary bi bi-chat-fill`}></i>
                            </button>
                            <button className={`btn border flex-fill border-secondary` }style={{cursor:"default"}}>
                                <span className="me-3">{post?.views?.length}</span>
                                <i className={`bi bi-eye text-secondary fs-5`}></i>
                            </button>
                        </div>
                        <CommentsSection postId={post._id}/>
                    </div>
                </div>
            </div>
        </>
    )
}
export default PostDetail;