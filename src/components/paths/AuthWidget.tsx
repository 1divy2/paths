import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithGoogle, logout, auth, type User } from "@/lib/paths/firebase";
import { UserCircle, LogOut } from "lucide-react";

export default function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (userAuth) => {
      setUser(userAuth);
    });
    return unsub;
  }, []);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-panel border border-line rounded-full shadow-xl px-2 py-1 gap-2">
      {!user ? (
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserCircle className="size-4" /> Sign In to Sync
        </button>
      ) : (
        <div className="flex items-center gap-3 pl-2 pr-1 py-1">
          <img src={user.photoURL || ""} alt="" className="size-6 rounded-full border border-line" />
          <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
            {user.displayName}
          </span>
          <button
            onClick={logout}
            className="p-1.5 hover:bg-white/5 rounded-full text-muted-foreground hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
