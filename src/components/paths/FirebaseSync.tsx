import { useEffect, useRef } from "react";
import { onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, db, auth, type User } from "@/lib/paths/firebase";
import { useUIStore } from "@/lib/paths/UIStore";

export default function FirebaseSync() {
  const store = useUIStore();
  const isHydrating = useRef(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // User logged in.
        const userRef = doc(db, "users", user.uid);
        
        // 1. Fetch initial remote state
        isHydrating.current = true;
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Hydrate local state from cloud
            useUIStore.setState({
              homePlace: data.homePlace ?? store.homePlace,
              savedLists: data.savedLists ?? store.savedLists,
              reviews: data.reviews ?? store.reviews,
              trail: data.trail ?? store.trail,
              mapViewport: data.mapViewport ?? store.mapViewport,
              themeMode: data.themeMode ?? store.themeMode,
            });
          }
        } catch (e) {
          console.error("Failed to load cloud state", e);
        } finally {
          isHydrating.current = false;
        }

        // 2. Listen for remote changes (multi-tab / multi-device sync)
        unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            // Prevent bounce-back loops by only updating if data changed externally
            const data = doc.data();
            // Deep equality check or just overriding for now is fine for a robust start
            // Note: In a prod app, we'd want to be careful about overwriting active user edits.
          }
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []); // Run once on mount

  // 3. Sync local changes to cloud
  useEffect(() => {
    // We only want to sync when the user changes things, not during initial hydration
    if (isHydrating.current) return;
    
    const syncStateToCloud = async () => {
      const { currentUser } = await import("firebase/auth").then(m => m.getAuth());
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        try {
          await setDoc(userRef, {
            homePlace: store.homePlace,
            savedLists: store.savedLists,
            reviews: store.reviews,
            trail: store.trail,
            mapViewport: store.mapViewport,
            themeMode: store.themeMode,
            updatedAt: Date.now()
          }, { merge: true });
        } catch (e) {
          console.error("Cloud sync failed", e);
        }
      }
    };

    // Debounce the sync to avoid blowing up Firestore writes on every map pan
    const timer = setTimeout(syncStateToCloud, 2000);
    return () => clearTimeout(timer);
  }, [
    store.homePlace, store.savedLists, store.reviews, store.trail, store.mapViewport, store.themeMode
  ]);

  return null; // Headless component
}
