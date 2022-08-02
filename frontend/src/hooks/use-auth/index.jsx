import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import useFlashMessage from '../use-flash-message';
import api from '../../utils/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const { setFlashMessage } = useFlashMessage();
  const navigate = useNavigate();

  async function authUser(data) {
    setAuthenticated(true);
    localStorage.setItem('token', JSON.stringify(data.token));
    navigate('/');
  }

  const hasToken = useCallback(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;
      setAuthenticated(true);
      navigate('/');
    }
  }, [navigate]);

  const register = async (user) => {
    let msgText = 'Cadastro realizado com sucesso';
    let msgType = 'success';

    try {
      const data = await api.post('/users/register', user).then((response) => {
        return response.data;
      });

      await authUser(data);
    } catch (error) {
      msgText = error.response.data.message;
      msgType = 'error';
    }

    setFlashMessage(msgText, msgType);
  };

  async function login(user) {
    let msgText = 'Login realizado com sucesso';
    let msgType = 'success';

    try {
      const data = await api.post('/users/login', user).then((response) => {
        return response.data;
      });

      await authUser(data);
    } catch (error) {
      msgText = error.response.data.message;
      msgType = 'error';
    }

    setFlashMessage(msgText, msgType);
  }

  function logout() {
    const msgText = 'Logout realizado com sucesso';
    const msgType = 'success';

    setAuthenticated(false);
    localStorage.removeItem('token');
    api.defaults.headers.Authorization = undefined;
    navigate('/login');
    setFlashMessage(msgText, msgType);
  }

  useEffect(() => {
    hasToken();
  }, [hasToken]);

  return (
    <AuthContext.Provider value={{ authenticated, register, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
