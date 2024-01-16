"use client";
import { useWalletContext } from "@/context/wallet";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { magic } from "@/config/magic";
import { useMagicSigner } from "@/hooks/useMagicSigner";
import { useAlchemyProvider } from "@/hooks/useAlchemyProvider";

export default function Navbar() {
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const { magic, signer } = useMagicSigner();
  const { provider } = useAlchemyProvider();



  const handleSocialLogin = async () => {
    const baseURL = new URL("/", window.location.origin).href;
    try {
      await (magic as any).oauth.loginWithRedirect({
        provider: "google",
        redirectURI: baseURL,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const finishSocialLogin = async () => {
    try {
      if (!magic || !magic.user || !signer) {
        throw new Error("Magic not initialized");
      }

      const result = await magic.oauth.getRedirectResult();
      const owner = await provider?.account?.getAddress();
      // setUser(result);
      console.log(result);
      console.log(owner);
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    finishSocialLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { isLoggedIn, login, logout, username, scaAddress } =
    useWalletContext();

  const openModal = useCallback(() => {
    setIsLoggingIn(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsLoggingIn(false);
  }, []);

  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setEmail(e.target.value);
    },
    []
  );

  const handleLogin = useCallback(async () => {
    await login(email);
    setIsLoggingIn(false);
    setEmail("");
  }, [login, email]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  }, [logout]);

  return (
    <div className="flex flex-row justify-between items-end gap-[72px] max-md:flex-col max-md:text-center">
      <div className="text-6xl font-bold">FREDs AA DAP</div>
      <div className="flex flex-row items-end gap-[12px] max-md:flex-col max-md:text-center">
        {isLoggedIn ? (
          <a
            href={`https://sepolia.etherscan.io/address/${scaAddress}`}
            target="_blank"
            className="btn text-white bg-gradient-1 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >
            {username || "Logged In!"}
          </a>
        ) : (
          <button
            disabled={isLoggingIn}
            onClick={handleSocialLogin}
            className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >
            {isLoggingIn ? "Logging In" : "Log In"} With Email
            {isLoggingIn && (
              <span className="loading loading-spinner loading-md"></span>
            )}
          </button>
        )}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="btn text-white bg-gradient-2 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >
            {isLoggingOut ? "Logging Out" : "Log Out"}
            {isLoggingOut && (
              <span className="loading loading-spinner loading-md"></span>
            )}
          </button>
        )}
      </div>

      {/* login pop-up modal */}
      <dialog className={`modal ${isLoggingIn && "modal-open"}`}>
        <div className="modal-box flex flex-col gap-[12px]">
          <h3 className="font-bold text-lg">Enter your email!</h3>
          <input
            placeholder="email"
            onChange={onEmailChange}
            className="input border border-solid border-white"
          />
          <div className="flex flex-row justify-end max-md:flex-col flex-wrap gap-[12px]">
            <button
              onClick={handleLogin}
              className="btn bg-gradient-1 text-white transition ease-in-out duration-500 transform hover:scale-110"
            >
              Login
            </button>
            <button
              onClick={closeModal}
              className="btn bg-gradient-2 text-white transition ease-in-out duration-500 transform hover:scale-110"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
