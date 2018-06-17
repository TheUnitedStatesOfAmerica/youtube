export const savePreviousUrl = previousUrl => ({ type: 'auth/SAVE_PREVIOUS_URL', previousUrl });
export const notLoggedIn = () => ({ type: 'auth/NOT_LOGGED_IN' });
export const loggedIn = () => ({ type: 'auth/LOGGED_IN' });
export const userUpdate = user => ({ type: 'auth/USER_UPDATE', user });
