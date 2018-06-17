const defaultState = {
  authenticated: false,
  previousUrl: '',
  user: {},
};

export default function authReducer(state = defaultState, action) {
  if (action.type === 'auth/SAVE_PREVIOUS_URL') return { ...state, previousUrl: action.previousUrl };
  if (action.type === 'auth/NOT_LOGGED_IN') return { ...state, authenticated: false, user: {} };
  if (action.type === 'auth/LOGGED_IN') return { ...state, authenticated: true };
  if (action.type === 'auth/USER_UPDATE') return { ...state, user: action.user.message.items[0] };
  return state;
}
