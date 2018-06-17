import { LOGIN_STARTED, LOGOUT_STARTED } from '../constants/menu';

export const startLogin = () => ({ type: LOGIN_STARTED });
export const startLogout = () => ({ type: LOGOUT_STARTED });
