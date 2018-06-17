import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { startLogin, startLogout } from '../actions/menu';

@connect(
    state => ({
        authenticated: state.auth.authenticated,
        user: state.auth.user
    }),
    dispatch => ({
        login: () => dispatch(startLogin()),
        logout: () => dispatch(startLogout()),
    }),
)
export default class Menu extends Component {
    static propTypes = {
        authenticated: PropTypes.bool.isRequired,
        user: PropTypes.object
    }
    render() {
        let loginButton;
        let user;
        if(this.props.authenticated && this.props.user.snippet) {
            user = <li className="nav-item user">
                        <img src={this.props.user.snippet.thumbnails.default.url} />
                        <h3 className="username">{this.props.user.snippet.title}</h3>
                    </li>
            loginButton = <li className="nav-item"><button className="btn btn-primary" onClick={() => this.props.logout()}>logout</button></li>
        } else {
            loginButton = <li className="nav-item"><button className="btn btn-primary" onClick={() => this.props.login()}>login</button></li>
        }

        return (
             <nav className="menu navbar navbar-expand-lg justify-content-between">
                <h2 className="navbar-brand"><Link to="/">YouTube Viewer</Link></h2>
                <ul className="navbar-nav">
                    {user}
                    {loginButton}
                </ul>
             </nav>
        );
    }
}
