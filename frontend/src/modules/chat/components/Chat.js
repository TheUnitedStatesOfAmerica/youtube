import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPaperPlane from '@fortawesome/fontawesome-free-solid/faPaperPlane';
import faFrown from '@fortawesome/fontawesome-free-solid/faFrown';

import '../styling/Chat.scss';
import { fetchChatMessages, sendChatMessage } from '../actions/chat';
import Message from './Message';

@connect(
    state => ({
        messages: state.chat.messages,
        active: state.chat.active,
        auth: state.auth,
    }),
    dispatch => ({
        startFetching: channelId => dispatch(fetchChatMessages(channelId)),
        sendMessage: message => dispatch(sendChatMessage(message)),
    }),
)
export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.chatRef = React.createRef();
        this.msgarea = React.createRef();
        this.state = {
            scrolled: false,
        };

        this.onScroll = this.onScroll.bind(this);
    }

    static propTypes = {
        channelId: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.props.startFetching(this.props.channelId);
        const chat = this.chatRef.current;
        if(chat) chat.onscroll = this.onScroll;
    }

    componentWillUnmount() {
        const chat = this.chatRef.current;
        if(chat) chat.onscroll = null;
    }

    componentDidUpdate() {
        if(!this.state.scrolled) {
            const chat = this.chatRef.current;
            if (chat) chat.scrollTop = chat.scrollTopMax;
        }
    }

    onScroll(e) {
        const el = e.target;
        const [cur, max] = [el.scrollTop, el.scrollTopMax];

        this.setState({
            scrolled: cur < max,
        });
    }

    scrollBottom() {
        this.setState({ scrolled: false });
        this.chatRef.scrollTop = this.chatRef.scrollTopMax;
    }

    render() {
        return (
            <div className="chat-wrapper">
                <h3 className="chat-top">PogChat?</h3>
                <div ref={this.chatRef} className="chat">
                    <div className="chat-inner">
                    {this.props.active ? null : <div className="chat-disabled">Chat is disabled for this stream.</div> }
                        {this.props.messages.map(message => {
                            return <Message message={message} />
                        })}
                        <div ref={this.ref}></div>
                    </div>
                </div>
                {this.state.scrolled ? <div onClick={() => this.scrollBottom()} className="chat-scroll-bottom">Go to bottom</div> : null}
                <div className="chat-send-message">
                    {this.props.auth.authenticated ?
                        <textarea ref={this.msgarea} />
                    :
                        <textarea className="chat-disabled" disabled defaultValue='You need to be logged in to chat!'></textarea>
                    }

                    {this.props.auth.authenticated ?
                        <FontAwesomeIcon className="chat-send-button" onClick={() => this.msgarea.current.value.length > 0 ? this.props.sendMessage(this.msgarea.current.value) : null } icon={faPaperPlane} />
                    :
                        <FontAwesomeIcon className="chat-send-button chat-disabled" icon={faFrown} /> }
                </div>
            </div>
        );
    }
}
