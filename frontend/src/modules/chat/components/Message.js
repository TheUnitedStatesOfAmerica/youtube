import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import '../styling/Chat.scss';

export default class Chat extends Component {

    static propTypes = {
        message: PropTypes.object.isRequired,
    };

    render() {
        return (
            <div className="chat-message">
                <h5 className="chat-user"><Link to={
                 {
                     pathname: `/viewers/${this.props.message.channel_name}`,
                     state: { key: this.props.message.channel_id}
                 }
                }>{this.props.message.channel_name}</Link></h5>
                <p className="chat-message-content">{this.props.message.msg_content}</p>
            </div>
        );
    }
}
