import Navbar from "../components/Navbar";
import axiosInstance from "../api/axiosInstance";
import { useEffect, useState } from "react";
function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosInstance.get("/notifications");
                console.log(response.data.data);
                setNotifications(response.data.data);
            } catch (error) {
                setError(error.response.data.message || "Failed to Load Notifications")
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);
    const handleMarkAsRead = async (notificationId) => {
        try {
            await axiosInstance.patch(`/notifications/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                ));
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to mark as Read");
        }
    }
    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch("/notifications/read-all");
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, isRead: true })));
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to mark all messages as read");
        }
    }
    return (
        <>
            <Navbar />
            <div className="container mt-4">
                {loading && <p className="text-muted text-center">Loading ...</p>}
                {error && !loading && <p className="text-muted text-center">{error}</p>}
                {notifications.length === 0 && <p className="text-primary text-center">No Notifications Yet</p>}
                {notifications.length > 0 && (
                    <>
                        <button className="btn btn-outline-primary btn-sm mb-3"
                            onClick={markAllAsRead}>Mark All As Read
                        </button>
                        <div className="list-group">
                            {notifications.map((notification) => (
                                < div key={notification._id}
                                    className={`list-group-item p-3 rounded mb-2 ${!notification.isRead? "border border-primary":""}`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                    style={{ cursor: !notification.isRead ? "pointer" : "default" }}>
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="mb-1">
                                                <strong>{notification.sender.username}</strong>
                                                {" "}
                                                {notification.type === "like"
                                                    ? "liked your post"
                                                    : notification.type === "comment"
                                                        ? "commented on your post"
                                                        : "started following you"}
                                            </p>
                                            <p className="text-muted small mb-0">{new Date(notification.createdAt).toLocaleString()}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <div
                                                className="me-2 mt-2 rounded-circle bg-primary"
                                                style={{ width: "13px", height: "13px" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>)
                }
            </div >
        </>
    )
}
export default Notification;