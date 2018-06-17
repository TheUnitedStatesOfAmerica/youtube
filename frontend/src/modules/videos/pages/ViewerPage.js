import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getViewer, getViewerMessages } from '../selectors/videos';

import '../styling/messageLog.scss';

import { fetchViewerMessages } from '../actions/videos';
import moment from 'moment';

@connect(
    (state, props) => ({
        viewer: getViewer(props),
        messages: getViewerMessages(state),
    }),
    dispatch => ({
        fetchMessages: (viewer) => dispatch(fetchViewerMessages(viewer))
    }),
)

export default class ViewerPage extends Component {

    componentDidMount() {
        this.props.fetchMessages(this.props.viewer);
    }

    render() {
        if(!this.props.viewer || !this.props.messages) return <div />;
        return (
            <div className="videos chatlog main-container">
                <div className="log-header">
                    <img src={this.props.messages[0].channel_avatar_url} />
                    <h3 className="log-header-user">{this.props.messages[0].channel_name}</h3>
                </div>
                <div className="chatlog-inner">
                    {this.props.messages.map(message => {
                        return (
                            <div key={message.msg_id} className="log-message">
                                    <h5 className="log-message-timestamp">{moment(message.msg_created_at).format("H:mm:ss")}</h5>
                                    <p className="log-message-content">{message.msg_content}</p>
                            </div>
                        );
                    })}
               </div>
            </div>
        );
    }
}
