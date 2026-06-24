import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axiosInstance from "../api/axiosInstance";
import EditProfileModel from "./EditProfileModel";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [user, setUser] = useState({});
    const [error, setError] = useState(null);
    const [showEditModel, setShowEditModel] = useState(false);
    const [loading,setLoading] = useState(true);
    const navigate= useNavigate();
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get("/users/me");
                setUser(response.data.data);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load Profile");
            }finally{
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);
    const handleUpdateProfile = (updatedUser) => {
        setUser(updatedUser);
    }
    if (loading) return <>
        <Navbar />
        <div className="container mt-5" style={{ maxWidth: "680px" }}><p className="text-center text-muted">Loading...</p></div>
    </>
    if(error) return <><Navbar /> <div className="container mt-4" style={{ maxWidth: "680px" }}><p className="text-danger text-center">{error}</p></div></>
    return (
        <>
            <Navbar />
            <div className="container mt-4" style={{maxWidth:"680px"}}>
                <div className="card border-0">
                    <div className="card-body ">
                        <div className="mb-3 bg-secondary"
                            style={{
                                height: "200px",
                                backgroundImage: `url(${user.coverPicture || ''})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "8px",
                                border: "1.5px solid black"
                            }} />
                        <div className="text-center">
                            <div style={{ marginTop: "-60px", marginBottom: "20px" }}>
                                {user?.profilePicture
                                    ?
                                    <img
                                        src={user.profilePicture}
                                        className="rounded-circle border border-secondary"
                                        style={{ width: "130px", height: "130px", objectFit: "cover", border: "2px solid white" }}
                                    />
                                    :
                                    <div className="rounded-circle d-flex justify-content-center align-items-center bg-primary text-white mx-auto" style={{ width: "120px", height: "120px", fontSize: "48px", fontWeight: "bold", border: "2px solid blue" }}>
                                        <p>{user.username?.[0].toUpperCase() || "User"}</p>
                                    </div>
                                }
                            </div>
                            <h3 className="mb-2">{user?.username}</h3>
                            <p className=" mb-3">{user?.bio || "No Bio Yet"}</p>
                            <hr className="my-3 " />
                            <div className="row mb-3 d-flex justify-content-between gap-2">
                                <div className="col ms-3" style={{maxWidth:"120px", maxHeight:"60px", cursor:"pointer"}} onClick={()=>navigate(`/followers/${user._id}`)}>
                                    <h5 className="mb-0">{user?.followers?.length || 0}</h5>
                                    <p className="small">Followers</p>
                                </div>
                                <div className="col" style={{maxWidth:"120px", maxHeight:"60px", cursor:"pointer"}} onClick={()=>navigate(`/following/${user._id}`)}>
                                    <h5 className="mb-0">{user?.following?.length || 0}</h5>
                                    <p className="small">Following</p>
                                </div>
                                <div className="col me-3" style={{maxWidth:"120px", maxHeight:"60px" }}>
                                    <h5 className="mb-0">{user?.posts?.length || 0}</h5>
                                    <p className="small">Posts</p>
                                </div>
                            </div>
                            <button className="btn btn-outline-dark"
                                onClick={() => setShowEditModel(true)}> Edit Profile</button>
                        </div>
                    </div>
                </div>
                <h3 className="mb-3 mt-3 text-center">Your Posts</h3>
                {user?.posts?.length === 0 && !error && (
                    <p className="text-center text-muted mt-5 ">No posts yet. Be the first to post!</p>
                )}

                {user?.posts?.map((post) => (
                    <div key={post._id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                                {post.author.profilePicture && <img src={post.author.profilePicture} className="rounded-circle me-2"
                                    style={{ width: "40px", height: "40px" }}></img>
                                }
                                {!post.author.profilePicture && <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
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
                                <div className={`btn border flex-fill border-secondary`} style={{cursor:"default"}}>
                                    <span className="me-3">{post.reactionsCount}</span>
                                    <i className={` fs-5 text-secondary bi bi-hand-thumbs-up`}></i>
                                </div>
                                <div className={`btn border flex-fill border-secondary`} style={{cursor:"default"}}>
                                    <span className="me-3">{post.commentsCount}</span>
                                    <i className={` fs-5 text-secondary bi bi-chat`}></i>
                                </div>
                                <div className={`btn border flex-fill border-secondary`} style={{cursor:"default"}}>
                                    <span className="me-3">{post?.views?.length}</span>
                                    <i className={`bi bi-eye text-secondary fs-5`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showEditModel && (<EditProfileModel
                user={user}
                onClose={() => setShowEditModel(false)}
                onUpdate={handleUpdateProfile}
            />
            )}
        </>
    )
}

export default Profile;