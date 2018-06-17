import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import '../styling/VideoItem.scss';

export default class VideoItem extends Component {

    static propTypes = {
        video: PropTypes.object.isRequired,
    };

    render() {
        if(this.props.video.length !== 0) {
            return (
                <div className="video-item">
                    <img src={this.props.video.thumbnails.medium.url} />
                    <div className="video-item-info">
                        <Link to={
                            {
                                pathname: `/streams/${this.props.video.channelTitle}`,
                                state: { key: this.props.video.channelId }
                            }
                        }>
                            {this.props.video.title.replace(/^(.{25}).+/, "$1...")}
                    </Link>
                    <h3>{this.props.video.channelTitle}</h3>
                    </div>
                </div>
            );
        }
    }
}
