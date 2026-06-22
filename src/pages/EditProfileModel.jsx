import axiosInstance from "../api/axiosInstance";
import { useRef, useState } from "react";
function EditProfileModel({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        username: user.username || "",
        bio: user.bio || ""
    });
    const [coverPhotoPreview, setCoverPhotoPreview] = useState(user?.coverPicture || "");
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(user?.profilePicture || "");
    const [coverPhoto, setCoverPhoto] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const coverInputRef = useRef(null);
    const profilePhotoInputRef = useRef(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }
    const handleCoverPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPhoto(file);
            setCoverPhotoPreview(URL.createObjectURL(file));
        }
    }
    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setProfilePhotoPreview(URL.createObjectURL(file));
        }
    }

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiRequests=[];
            apiRequests.push(
                await axiosInstance.put("/users/me",{
                    username:formData.username,
                    bio:formData.bio
                })
            );
            if(profilePhoto){
                const profilePhotoData= new FormData();
                profilePhotoData.append("image", profilePhoto);
                apiRequests.push(
                    await axiosInstance.put("/users/profile-picture",profilePhotoData,{
                        headers:{"Content-Type":"multipart/form-data"}
                    })
                );
            }
            if(coverPhoto){
                const coverPhotoData= new FormData();
                coverPhotoData.append("image",coverPhoto);
                apiRequests.push(
                    await axiosInstance.put("/users/cover-photo",coverPhotoData,{
                        headers:{"Content-Type":"multipart-form-data"}
                    })
                );
            }
            const responses = await Promise.all(apiRequests);
            onUpdate(responses[responses.length-1].data.data);
            onClose();
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to Upload Profile");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="modal d-block" style={{ backgroundColor: "rgb(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content bg-light text-primary">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Profile</h5>
                        <button className="btn-close btn-close-primary"
                            onClick={onClose}
                        />
                    </div>
                    <div className="modal-body">
                        {error && <p className="text-danger small mb-2">{error}</p>}
                        <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            onChange={handleCoverPhotoChange}
                            ref={coverInputRef}
                        />
                        <div className="mb-3 bg-secondary position-relative"
                            style={{
                                height: "200px",
                                backgroundImage: `url(${coverPhotoPreview})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                borderRadius: "8px",
                                border: "1px solid white",
                            }}
                        >
                            <button className="position-absolute top-0 end-0 m-2 btn btn-sm btn-dark rounded-circle" onClick={() => coverInputRef.current.click()}>
                                <i className="bi bi-pencil-square"></i>
                            </button>
                        </div>
                        <div className="text-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="d-none"
                                onChange={handleProfilePhotoChange}
                                ref={profilePhotoInputRef}
                            />
                            <div className="position-relative" style={{ marginTop: "-60px", marginBottom: "20px" }}>

                                {profilePhotoPreview
                                    ?
                                    <img
                                        src={profilePhotoPreview}
                                        className="rounded-circle border border-dark"
                                        style={{ width: "120px", height: "120px", objectFit: "cover", border: "2px solid white" }}
                                    />
                                    :
                                    <div className="rounded-circle d-flex justify-content-center align-items-center bg-secondary text-white mx-auto" style={{ width: "120px", height: "120px", fontSize: "48px", fontWeight: "bold", border: "2px solid white" }}>
                                        <p>{user.username?.[0].toUpperCase() || "User"}</p>
                                    </div>
                                }
                                <button className="btn btn-sm btn-dark position-absolute top-0 start-50 rounded-circle m-2" onClick={() => profilePhotoInputRef.current.click()}>
                                    <i className="bi bi-pencil-square"></i>
                                </button>
                            </div>
                            <div className="mb-3 text-start">
                                <label className="form-label fw-bold small">Username</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="mb-3 text-start">
                                <label className="fw-bold small form-label">Bio</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <hr className="my-3" />
                            <button className="btn btn-outline-primary btn-lg w-100"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Saving" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EditProfileModel;