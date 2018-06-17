import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import 'bootstrap/scss/bootstrap.scss';

import Menu from '../components/menu';
import { VideoOverview, VideoPage, ViewerPage } from '../modules/videos';

export default class Application extends Component {
  render() {
    return (
      <div>
        <Menu />
        <Route exact path="/" component={VideoOverview} />
        <Route path="/streams/:channelTitle" component={VideoPage} />
        <Route path="/viewers/:viewer" component={ViewerPage} />
      </div>
    );
  }
}
