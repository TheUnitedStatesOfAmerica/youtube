import { CHAT_MESSAGES_RECEIVED, CHAT_IS_ACTIVE } from '../constants/chat';

const defaultState = {
  active: true,
  fetching: false,
  messages: [],
};

export default function chatReducer(state = defaultState, action) {
  switch (action.type) {
    case CHAT_IS_ACTIVE:
      return { ...state, active: action.active };
    case CHAT_MESSAGES_RECEIVED:
      return { ...state, messages: [...state.messages, ...action.messages].slice(state.messages.length + action.messages.length - 50) }; // eslint-disable-line
    default: return state;
  }
}
