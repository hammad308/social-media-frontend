import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
function CommentsSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [editComment, setEditComment] = useState("");
    const [error, setError] = useState(null);
    const [oldestCommentData, setOldestCommentData] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const hasMoreRef = useRef(true);
    const oldestCommentDataRef = useRef("");
    const isLoadingMore = useRef(false);
    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);
    useEffect(() => {
        oldestCommentDataRef.current = oldestCommentData;
    }, [oldestCommentData])
    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/posts/${postId}/comments`);
                const data = response.data.data;
                setComments(data);
                if (data.length > 0) {
                    setOldestCommentData(data[data.length - 1].createdAt);
                }
                setError(null);
            } catch (error) {
                setError(error.response.data.message || "Failed to load comments");
            } finally {
                setLoading(false);
            }
        }
        fetchComments();
    }, [postId]);
    const handleAddComment = async () => {
        try {
            if (!editComment.trim()) return;
            const response = await axiosInstance.post(`/posts/${postId}/comments`, {
                content: editComment
            });
            setComments([response.data.data, ...comments]);
            setEditComment("");
            setError(null);
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to add comment");
        }
    }
    const laodMoreComments = async () => {
        if (!hasMoreRef.current || isLoadingMore.current) return;
        try {
            isLoadingMore.current = true;
            setLoading(true);
            const response = await axiosInstance.get(`/posts/${postId}/comments?cursor=${oldestCommentDataRef.current}&limit=10`);
            const moreComments = response.data.data;
            if (moreComments.length === 0) {
                setHasMore(false);
                hasMoreRef.current = false;
                return;
            }
            setComments((prev) => [...prev, ...moreComments]);
            const newCursor = moreComments[moreComments.length - 1].createdAt;
            setOldestCommentData(newCursor);
            oldestCommentDataRef.current = newCursor;
            isLoadingMore.current = false;
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to load more comments");
            isLoadingMore.current = false;
        } finally {
            isLoadingMore.current = false;
            setLoading(false);
        }
    }
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isAtBottom = scrollHeight - scrollTop - clientHeight <= 5;
        if (isAtBottom) {
            laodMoreComments();
        }
    }
    if(error) return <><p className="text-primary">{error}</p></>
    return (
        <>
            <div className="container mt-4">
                {comments?.length > 0 &&
                    <div className=" mb-3" onScroll={handleScroll} style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {comments?.map((comment) => (
                            <div key={comment?._id} className="d-flex gap-2 mb-4">
                                {comment?.author?.profilePicture ?
                                    <img src={comment?.author?.profilePicture} className="rounded-circle me-2" style={{ width: "40px", height: "40px", objectFit: "cover" }} /> :
                                    <p className="rounded-circle me-2 bg-primary d-flex justify-content-center align-items-center text-center text-white" style={{ width: "40px", height: "40px" }}>{comment?.author?.username?.[0]?.toUpperCase()}</p>}
                                <div className="flex-grow-1">
                                    <p className="mb-1" style={{ fontSize: "13px" }}><strong>{comment?.author?.username}</strong></p>
                                    <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>{comment?.content}</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>{new Date(comment?.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {loading && <p className="text-muted text-center">Loading...</p>}
                    </div>
                }
                <div className="d-flex justify-content-between mt-3 gap-2">
                    <input
                        className="form-control "
                        type="text"
                        value={editComment}
                        placeholder="Type Something ..."
                        onChange={(e) => { setEditComment(e.target.value) }}
                        onKeyPress={(e) => { e.key === "Enter" && handleAddComment() }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="btn btn-primary btn-sm"
                        onClick={(e) => {
                            handleAddComment();
                            e.stopPropagation();
                            
                        }}
                        disabled={!editComment.trim()}
                    >Comment</button>
                </div>
            </div>
        </>
    )
}
export default CommentsSection;
