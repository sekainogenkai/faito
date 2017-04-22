import React from 'react';
import BABYLON from 'babylonjs';

export class BabylonJS extends React.Component {
    get defaultProps() {
        return {
            antialias: true,
            options: {},
            onEngineCreated: () => {},
            onEngineAbandoned: () => {},
            handleResize: true,
        };
    }

    componentDidMount() {
    this.engine = new BABYLON.Engine(this.canvas, this.props.antialias, this.props.options);
    this.props.onEngineCreated(this.engine);
    this.handleWindowResize = () => this.engine.resize();
    window.addEventListener('resize', this.handleWindowResize);
    // Stylesheets which would result in resizing of the canvas may
    // still be loading. If we don’t call engine.resize() after, the
    // engine will render pixelated.
    window.addEventListener('load', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('load', this.handleWindowResize);
    this.handleWindowResize = null;
    this.props.onEngineAbandoned(this.engine);
  }

  render() {
    return <canvas ref={canvas => this.canvas = canvas} />;
  }
}
