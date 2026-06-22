import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            navigate("/login");
        }
        else {
            localStorage.setItem("token", token);
            navigate("/");
        }
    },[]);

    return (
        <div className="d-flex align-items-center justify-content-center">
            <p>Logging in....</p>
        </div>
    )
}
export default OAuthSuccess;