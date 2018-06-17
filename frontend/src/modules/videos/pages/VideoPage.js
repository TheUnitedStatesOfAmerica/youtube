import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import ReactPlayer from 'react-player';
import { Chat } from '../../chat';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faClock from '@fortawesome/fontawesome-free-solid/faClock';
import faUsers from '@fortawesome/fontawesome-free-solid/faUsers';
import faTachometerAlt from '@fortawesome/fontawesome-free-solid/faTachometerAlt';

import '../styling/videos.scss';

import { resetVideoMeta } from '../actions/videos';
import { getVideo, getMeta } from '../selectors/videos';


@connect(
    (state, props) => ({
      video: getVideo(state, props),
      meta: getMeta(state),
    }),
    (dispatch) => ({
        resetMeta: () => dispatch(resetVideoMeta())
    })
)
export default class VideoPage extends Component {

    getHypeClass(hype) {
        if(hype < 25) return 'hype-0';
        if(hype >= 25 && hype < 50) return 'hype-25';
        if(hype >= 50 && hype < 75) return 'hype-50';
        if(hype >= 75 && hype < 100) return 'hype-75';
        if(hype >= 100 && hype < 200) return 'hype-100';
        if(hype >= 200 && hype < 300) return 'hype-200';
        if(hype >= 300) return 'hype-300';
    }

    componentWillUnmount() {
        this.props.resetMeta();
    }

    render() {
        if(!this.props.video.id) return <div />;
        return (
            <div className="videos main-container">
              <div className="player-container">
                 <ReactPlayer className="player" width='1280px' height='720px' url={`https://www.youtube.com/watch?v=${this.props.video.id.videoId}`} muted playing controls />
                 <div className="player-footer">
                    <img className="player-footer-image" src={this.props.video.snippet.thumbnails.default.url} />
                    <div className="player-footer-meta">
                        <h2>{this.props.video.snippet.title}</h2>
                        <div className="player-footer-meta-lower">
                            <div className="player-footer-uptime">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{this.props.meta.start_time ? moment(this.props.meta.start_time, moment.ISO_8601).fromNow() : '...'}</span>
                            </div>
                            <div className="player-footer-viewers">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>{this.props.meta.viewers}</span>
                            </div>
                            <div className={`player-footer-hype ${this.getHypeClass(this.props.meta.hype)}`}>
                                <FontAwesomeIcon icon={faTachometerAlt} />
                                <span>{this.props.meta.hype}%</span>
                            </div>
                        </div>
                    </div>

                 </div>
              </div>
              <Chat channelId={this.props.video.id.videoId} />
            </div>
        );
    }
}
