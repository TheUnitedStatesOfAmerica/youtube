import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VideoItem from './VideoItem';

import '../styling/VideoList.scss';

/**
 *
 * The Video List component is a dumb component that receives a list of videos.
 *
 * @export
 * @class VideoList
 * @extends {Component}
 */
export default class VideoList extends Component {
    static propTypes = {
        videos: PropTypes.array.isRequired,
    };

    render() {
        if(!this.props.videos) return <div />;
        return (
            <ul className="video-list">
            {this.props.videos.map(video => <VideoItem video={video.snippet} key={video.snippet.channelId} />)}
            </ul>
        );
    }
}
