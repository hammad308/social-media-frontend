import Navbar from "../components/Navbar";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import socket from "../socket";
import { useSearchParams } from "react-router-dom";

function Chat() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [oldestMessageData, setOldestMessageData] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesContainer = useRef(null);
    const messagesEndRef = useRef(null);
    const isLoadingMore = useRef(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [searchParams] = useSearchParams();
    const conversationId = searchParams.get("conversationId");
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/users/me");
                setCurrentUser(response.data.data);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load user info")
            }finally{
                setLoading(false);
            }
        }
        fetchCurrentUser();
    }, []);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get("/conversations");
                const data = response.data.data;
                setConversations(data);
                if (conversationId) {
                    const initialChat = data.find(c => c?._id === conversationId);
                    if (initialChat) {
                        setSelectedConversation(initialChat);
                        setShowMobileChat(true);
                    }
                }
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load");
            } finally {
                setLoading(false);
            }
        }
        fetchConversations();
    }, [conversationId]);
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/conversations/${selectedConversation?._id}/messages`);
                const data = response.data.data;
                setMessages([]);
                setHasMore(true);
                setMessages(data.reverse());
                if (data.length > 0) {
                    setOldestMessageData(data[data.length - 1].createdAt);
                } else {
                    setOldestMessageData(null);
                }
            } catch (error) {
                setError(error?.response?.data?.messages || "Failed to Load Messages");
            }finally{
                setLoading(false);
            }
        }
        fetchMessages();
    }, [selectedConversation]);
    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore && !isLoadingMore.current) {
            loadMoreMessages();
        }
    };
    const loadMoreMessages = async () => {
        try {
            isLoadingMore.current = true;
            const scrollHeightBefore = messagesContainer.current.scrollHeight;
            const response = await axiosInstance.get(`/conversations/${selectedConversation?._id}/messages?cursor=${oldestMessageData}&limit=10`);
            const older = response.data.data.reverse();
            if (older.length === 0) {
                setHasMore(false);
                isLoadingMore.current = false; return;
            }
            setMessages((prev) => {
                const existingIds = new Set(prev.map(m => m?._id));
                const filtered = older.filter(m => !existingIds.has(m?._id));
                return [...filtered, ...prev]
            })
            setOldestMessageData(older[0].createdAt);

            requestAnimationFrame(() => {
                if (messagesContainer.current) {
                    const scrollHeightAfter = messagesContainer.current.scrollHeight;
                    const difference = scrollHeightAfter - scrollHeightBefore;
                    messagesContainer.current.scrollTop = difference;
                }
            })
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to load more messages");
            isLoadingMore.current = false;
        }
    }
    useEffect(() => {
        if (!selectedConversation) return;
        socket.off("receiveMessage");
        socket.emit("joinConversation", selectedConversation?._id);
        socket.on("receiveMessage", (message) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m?._id === message?._id);
                if (exists) return prev;
                return [...prev, message];
            });
        });
        return () => {
            socket.emit("leaveConversation", selectedConversation?._id)
            socket.off("receiveMessage");
        };
    }, [selectedConversation]);
    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !currentUser) return;
        socket.emit("sendMessage", {
            conversationId: selectedConversation?._id,
            content: newMessage,
            senderId: currentUser?._id
        });
        setNewMessage("");
    }
    useEffect(() => {
        if (isLoadingMore.current) {
            isLoadingMore.current = false;
            return;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    useEffect(() => {
        if (!selectedConversation || !currentUser) return;
        socket.emit("markSeen", {
            conversationId: selectedConversation?._id,
            userId: currentUser?._id
        });
    }, [selectedConversation, currentUser, messages?.length]);
    useEffect(() => {
        socket.on("messagesSeenUpdate", ({ conversationId, seenBy }) => {
            if (selectedConversation?._id === conversationId) {
                setMessages((prev) => (
                    prev.map((msg) => ({
                        ...msg,
                        seenBy: msg.seenBy?.includes(seenBy) ? msg.seenBy : [...(msg.seenBy || []), seenBy]
                    }))
                ))
            }
        });
        return () => socket.off("messagesSeenByUpdate")
    }, [selectedConversation]);
    if (loading) return <>
        <Navbar />
        <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-center">Loading...</p></div>
    </>
    if(error) return <><Navbar /> <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-danger text-center">{error}</p></div></>
    return (
        <>
            <Navbar />
            <div className="container-fluid mt-4" style={{ height: "calc(100vh - 90px)" }}>
                <div className="row h-100">
                    <div className={`col-md-4 ${showMobileChat ? "d-none d-md-block" : ""}`}>
                        <div className="card border-0 border-md h-100 d-flex">
                            {conversations?.length > 0 && <div className="card-body flex-grow-1" style={{ maxHeight: "67vh", overflowY: "auto" }}>
                                {conversations.map((conversation) => (
                                    < div key={conversation?._id} className={`
                                        d-flex
                                        gap-2 
                                        rounded 
                                        shadow-sm 
                                        p-3 
                                        mt-2
                                        ${selectedConversation?._id === conversation?._id ? "bg-primary text-white" : "bg-white"}
                                        `}
                                        onClick={() => {
                                            setSelectedConversation(conversation);
                                            setShowMobileChat(true);
                                        }
                                        }
                                        style={{ cursor: "pointer" }}>
                                        {conversation.participants?.[0]?.profilePicture ?
                                            <img src={conversation.participants?.[0]?.profilePicture} className="rounded-circle me-2" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                                            :
                                            <div className="rounded-circle me-2 bg-dark d-flex align-items-center justify-content-center text-center text-white fw-semibold" style={{ height: "40px", width: "40px" }}>{conversation?.participants[0]?.username?.[0].toUpperCase()}</div>
                                        }
                                        <div className="flex-grow-1">
                                            <p className="fw-semibold mb-1" style={{ fontSize: "13px" }}><strong>{conversation?.participants[0]?.username}</strong></p>
                                            <p className="mb-0" style={{ fontSize: "13px" }}>{conversation?.lastMessage}</p>
                                            <p className="mb-0" style={{ fontSize: "11px" }}>{conversation?.lastMessageAt?(new Date(conversation?.lastMessageAt).toLocaleString()): ""}</p>
                                        </div>
                                    </div>
                                )
                                )}
                            </div>}
                            {conversations.length === 0 && !loading && (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <p className="text-muted"> NO Conversations Yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`col-md-8 ${!showMobileChat ? "d-none d-md-block" : ""}`}>
                        <div className="card border-0 border-md rounded h-100 d-flex" >
                            {selectedConversation && (
                                <div className="card-header bg-white">
                                    <div className="d-flex align-items-center">
                                        <button className="btn btn-outline-dark me-3 d-md-none"
                                            onClick={() => {
                                                setShowMobileChat(false);
                                                setSelectedConversation(null);
                                            }}>
                                            ← Back
                                        </button>
                                        <h5 className="mb-0">
                                            {selectedConversation?.participants[0]?.username}
                                        </h5>
                                    </div>
                                </div>
                            )}
                            <div className="card-body flex-grow-1" ref={messagesContainer} onScroll={handleScroll} style={{ maxHeight: "67vh", minHeight: "0", overflowY: "auto", scrollAnchoring: "auto" }}>
                                {!selectedConversation ?
                                    (<div className="d-flex justify-content-center align-items-center h-100">
                                        <p className="text-muted text-center">Select a Conversation to start chatting</p>
                                    </div>
                                    ) : messages?.length === 0 ? (<p className="text-center">Start Chat</p>
                                    ) : (
                                        messages.map((message, index) => {
                                            const isSent = currentUser?._id?.toString() === message.sender?._id?.toString();
                                            const isLastSentMessage = isSent && (index === messages.length - 1);
                                            const otherUserId = selectedConversation?.participants?.[0]?._id;
                                            const isSeenByOther = message?.seenBy?.includes(otherUserId);
                                            return (
                                                <div key={message?._id} className={`d-flex mb-2 flex-column ${isSent ? "align-items-end" : "align-items-start"}`}>
                                                    <div className={`p-2 rounded ${isSent ? "bg-primary text-white" : "bg-light text-dark"}`} style={{ maxWidth: "70%", wordBreak: "break-word" }}>
                                                        <p className=" mb-1">{message?.content}</p>
                                                        <p className=" small mb-0 text-muted" style={{ fontSize: "10px" }}>{new Date(message?.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    {isLastSentMessage && <p className="mb-0 small text-end text-muted me-1" style={{ fontSize: "10px" }}>{isSeenByOther ? "Seen" : "Sent"}</p>}
                                                </div>

                                            );
                                        })
                                    )}
                                <div ref={messagesEndRef} />
                            </div>
                            {selectedConversation && (<div className="card-footer border-0 border-md bg-white d-flex justify-content-between gap-2" style={{maxHeight:"5vh"}} >
                                <input
                                    className="form-control rounded-pill"
                                    value={newMessage}
                                    placeholder="Type message..."
                                    onChange={(e) => { setNewMessage(e.target.value) }}
                                    onKeyDown={(e) => { e.key === "Enter" && handleSendMessage() }}
                                />
                                <button className="btn btn-primary rounded-pill px-4"
                                    onClick={handleSendMessage}>
                                    Send
                                </button>
                            </div>)}
                        </div>
                    </div>

                </div>
            </div >
        </>
    )
}

export default Chat;