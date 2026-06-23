import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import axiosInstance from "../api/axiosInstance";
import CommentsSection from "./CommentsSection";
import { useNavigate } from "react-router-dom";


function Home() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);
    const [postError, setPostError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingMore = useRef(false);
    const oldestPostDataRef = useRef("");
    const hasMoreRef = useRef(true);
    const [oldestPostData, setOldestPostData] = useState("");
    const [expandedComments, setExpandedComments] = useState(null);
    const navigate = useNavigate();
    const [user, setUser] = useState([]);
    const [postsLaoding,setPostsLoading] = useState(false);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/users/me");
                const user = response.data.data;
                setUser(user);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load User Information");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [])
    useEffect(() => {
        oldestPostDataRef.current = oldestPostData;
    }, [oldestPostData]);
    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore])
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/posts/feed");
                const data = response.data.data;
                setPosts(data);
                if (data.length > 0) {
                    setOldestPostData(data[data.length - 1].createdAt);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load posts");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };
    const handlePost = async () => {
        if (!content.trim() && !image) {
            setPostError("Write something or add an image.");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            if (content.trim()) {
                formData.append("content", content);
            }
            if (image) formData.append("image", image);
            const response = await axiosInstance.post("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPosts([response.data.data, ...posts]);
            setContent("");
            setImage(null);
            setImagePreview(null);
            setPostError(null);
            setLoading(false);
        } catch (err) {
            setPostError(err.response?.data?.message || "Failed to create post");
        }
        finally {
            setLoading(false);
        }
    };

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
    const loadMorePosts = async () => {
        if (!hasMoreRef.current || isLoadingMore.current) return;
        try {
            setPostsLoading(true);
            isLoadingMore.current = true;
            const response = await axiosInstance.get(`/posts/feed?cursor=${oldestPostDataRef.current}&limit=10`);
            const newPosts = response.data.data;
            if (newPosts.length === 0) {
                setHasMore(false);
                hasMoreRef.current = false;
                isLoadingMore.current = false;
                return;
            }
            setPosts((prev) => [...prev, ...newPosts]);
            const newCursor = newPosts[newPosts.length - 1].createdAt;
            setOldestPostData(newCursor);
            oldestPostDataRef.current = newCursor;
            isLoadingMore.current = false;
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to load more posts");
            isLoadingMore.current = false;
        }finally{
            setPostsLoading(false);
        }

    }
    const handleScroll = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 2;
        if (isAtBottom) {
            loadMorePosts();
        }
    };
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [])
    if (loading) return <>
        <Navbar />
        <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-center">Loading...</p></div>
    </>
    if (error) return <><Navbar /> <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-danger text-center">{error}</p></div></>
    return (
        <>
            <Navbar />
            <div className="container mt-4" style={{ maxWidth: "680px" }}>
                <div className="card mb-4 shadow-sm border-0">
                    <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                            {user?.profilePicture
                                ? <img src={user?.profilePicture} className="rounded-circle me-3" style={{ width: "42px", height: "42px", objectFit: "cover" }} />
                                :
                                <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                    style={{ width: "42px", height: "42px", fontSize: "16px", fontWeight: "600", flexShrink: 0 }}
                                >
                                    {user?.username?.[0].toUpperCase()}
                                </div>
                            }
                            <textarea
                                className="form-control border-0 bg-light"
                                rows={2}
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{ resize: "none", borderRadius: "20px", fontSize: "15px" }}
                            />
                        </div>
                        {imagePreview && (
                            <div className="position-relative mb-3">
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    className="rounded w-100"
                                    style={{ maxHeight: "300px", objectFit: "cover" }}
                                />
                                <button
                                    className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 rounded-circle"
                                    onClick={handleRemoveImage}
                                    style={{ width: "28px", height: "28px", padding: 0, lineHeight: "28px" }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {postError && !loading && (
                            <p className="text-danger small mb-2">{postError}</p>
                        )}

                        <div className="d-flex justify-content-between align-items-center">
                            <label className="btn btn-light btn-sm text-secondary mb-0" style={{ cursor: "pointer" }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleImageChange}
                                />
                                <i className="bi bi-image btn"></i>
                            </label>

                            <button
                                className="btn btn-primary btn-sm px-4"
                                onClick={handlePost}
                                style={{ borderRadius: "20px" }}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>


                {posts?.length === 0 && !error && (
                    <p className="text-center text-muted mt-5">No posts yet. Be the first to post!</p>
                )}

                {posts?.map((post) => (
                    <div key={post?._id} className="card mb-3 shadow-sm" style={{ cursor: "pointer" }} onClick={() => navigate(`posts/${post._id}`)}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3" onClick={(e) => {
                                navigate(`/profile/${post?.author?._id}`)
                                e.stopPropagation();
                            }
                            }>
                                {post.author.profilePicture && <img src={post.author.profilePicture} className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px" }}></img>
                                }
                                {!post.author.profilePicture && <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                    style={{ width: "40px", height: "40px", fontSize: "15px", fontWeight: "600", flexShrink: 0 }} >
                                    {post?.author.username?.[0].toUpperCase()}
                                </div>}
                                <div>
                                    <p className="mb-0 fw-semibold" style={{ fontSize: "14px" }}>{post.author.username}</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                                        {new Date(post.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {post.content && (
                                <p className="mb-2" style={{
                                    fontSize: "15px",
                                    display: "-webkit-box",
                                    WebkitLineClamp: "2",
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"

                                }}>{post?.content}</p>
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
            </div>
            {postsLaoding && <p className="text-center text-muted">Loading...</p>}

        </>
    );
}

export default Home;