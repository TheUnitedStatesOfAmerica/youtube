import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getResults, isLoading } from '../selectors/videos';
import { fetchVideos } from '../actions/videos';

import VideoList from '../components/VideoList';

import '../styling/videos.scss';


/**
 *
 * Video Overview page.
 * The idea is that this contains a video list. Why not just make this the video list?
 * If we want to add pagination, we can easily do that here without having to change-
 * the code too much. We can just add buttons under the list and fetch a new list-
 * with the nextPageToken that we get from our initial request.
 *
 * @export
 * @class VideoOverview
 * @extends {Component}
 */
@connect(
    state => ({
        results: getResults(state),
        loading: isLoading(state),
    }),
    dispatch => ({
        fetchVideos: () => dispatch(fetchVideos())
    }),
)

export default class VideoOverview extends Component {

    componentDidMount() {
        this.props.fetchVideos();
    }

    render() {
        return (
            <div className="videos main-container">
                { this.props.loading ? <div className="spinner" /> : null }
                { this.props.results.success && !this.props.results.message.error ? <VideoList videos={this.props.results.message.items} /> : null }
            </div>
        );
    }
}
