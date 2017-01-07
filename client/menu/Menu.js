import React from 'react';


// maybe use this method later https://facebook.github.io/react-native/docs/style.html
const styles = {
    menu: {
        position: "absolute",
        top: 0,
        left: 0,
        minHeight: "100%",
        minWidth: "100%",
    },
    mainMenu: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    mainMenuItem: {
        padding: 10,
        backgroundColor: "lightblue",
        height: 400,
    },
};

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            
        };
    }
    
    handleHideMenu(e) {
        e.preventDefault();
        this.props.hideMenu();
    }
    
    render() {
        return (
            <div className="menu" style={styles.menu}>
                <div className="main-menu" style={styles.mainMenu}>
                    <button style={styles.mainMenuItem} onClick={this.handleHideMenu.bind(this)}>HIDE THE MENU</button>
                    <h2 style={styles.mainMenuItem}>MENU</h2>
                </div>
            </div>
        );
    }
}