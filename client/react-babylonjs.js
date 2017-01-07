import React from 'react';
import BABYLON from 'babylonjs';

export class BabylonJS extends React.Component {
  get defaultProps() {
    return {
      antialias: true,
      onEngineCreated: () => {},
      onEngineAbandoned: () => {},
    };
  }

  componentDidMount() {
    this.engine = new BABYLON.Engine(this.canvas, this.props.antialias);
    this.props.onEngineCreated(this.engine);
    this.handleWindowResize = () => this.engine.resize();
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
    this.handleWindowResize = null;
    this.props.onEngineAbandoned(this.engine);
  }

  render() {
    return <canvas ref={canvas => this.canvas = canvas} />;
  }
}
