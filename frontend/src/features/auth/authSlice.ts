import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  token: string | null;
  userId: string | null;
  workerId: string | null;
  isAuthenticated: boolean;
  role: 'user' | 'worker' | null;
}

const userToken = localStorage.getItem('userToken');
const workerToken = localStorage.getItem('workerToken');
const userId = localStorage.getItem('userId');
const workerId = localStorage.getItem('workerId');

let initialRole: 'user' | 'worker' | null = null;
if (userToken) initialRole = 'user';
else if (workerToken) initialRole = 'worker';

const initialState: AuthState = {
  token: userToken || workerToken || null,
  userId: userId || null,
  workerId: workerId || null,
  isAuthenticated: !!(userToken || workerToken),
  role: initialRole,
};

interface LoginPayload {
  token: string;
  userId?: string;
  workerId?: string;
  role: 'user' | 'worker';
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      
      if (action.payload.role === 'user') {
        state.userId = action.payload.userId || null;
        state.workerId = null;
        localStorage.setItem('userToken', action.payload.token);
        if (action.payload.userId) {
          localStorage.setItem('userId', action.payload.userId);
        }
        localStorage.removeItem('workerToken');
        localStorage.removeItem('workerId');
      } else {
        state.workerId = action.payload.workerId || null;
        state.userId = null;
        localStorage.setItem('workerToken', action.payload.token);
        if (action.payload.workerId) {
          localStorage.setItem('workerId', action.payload.workerId);
        }
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
      }
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.workerId = null;
      state.isAuthenticated = false;
      state.role = null;
      
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('workerToken');
      localStorage.removeItem('workerId');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
