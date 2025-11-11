import { reactive } from 'vue';

// Estado de autenticación
const state = reactive({
  isLogged: true,
  user: null,
});

export function useAuth() {
  const login = async (email, password) => {
    // Implementar login
    state.isLogged = true;
  };

  const logout = () => {
    state.isLogged = false;
    state.user = null;
  };

  return {
    isLogged: state.isLogged,
    user: state.user,
    login,
    logout,
  };
}
