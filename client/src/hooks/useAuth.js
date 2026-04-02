// Simple re-export hook — keeps imports clean across the app
// Usage: import useAuth from '../hooks/useAuth'  (instead of importing from context)

import { useAuth as useAuthContext } from '../context/AuthContext';

const useAuth = () => {
    return useAuthContext();
};

export default useAuth;