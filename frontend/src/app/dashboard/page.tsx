"use client";
import { magic } from "@/config/magic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
const [user, setUser] = useState<any>();
const router = useRouter()

const finishSocialLogin = async () => {
    try {
        const result = await (magic as any).oauth.getRedirectResult();
        setUser(result);
        console.log(result);
    } catch (err) {
        console.error(err);
    }
};

useEffect(() => {
    finishSocialLogin();
}, []);

  const logout = async () => {
    try {
      await (magic as any).user.logout();
      router.push('/', { scroll: false })
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      {!user && <div className="loading">Loading...</div>}

      {user && (
        <div>
          <h1>Data returned:</h1>
          <pre className="user-info">{JSON.stringify(user, null, 3)}</pre>
        </div>
      )}
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
