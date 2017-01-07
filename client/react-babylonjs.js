import React from 'react';
import BABYLON from 'babylonjs';
import Menu from './Menu/Menu';


export class BabylonJS extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          showMenu: true
      }
  }
    
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
    
  hideMenu() {
      console.log("yo");
      this.setState({
          showMenu: false
      });
      console.log(this.state.showMenu);
  }

  render() {
    return <div className="game">
            <canvas ref={canvas => this.canvas = canvas} />
            {this.state.showMenu && <Menu yolo="yloolo" hideMenu={this.hideMenu.bind(this)}/> }
        </div>;
  }
}
