export const getResults = state => state.videos.results;

export const isLoading = state => state.videos.loading;

export const getVideo = (state, props) => state.videos.results.message.items.find(video => video.snippet.channelId === props.location.state.key);

export const getMeta = state => state.videos.meta;

export const getViewer = props => props.location.state.key;

export const getViewerMessages = state => state.videos.meta.viewer_messages;
