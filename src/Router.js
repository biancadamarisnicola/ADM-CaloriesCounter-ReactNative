/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {Text, View, Navigator, TouchableOpacity, StyleSheet} from 'react-native';
import {AlimentList, AlimentEdit} from './aliments';
import {Login} from './authentication';
import {getLogger} from './core/utils';

const log = getLogger('Router');

export class Router extends Component {
    constructor(props) {
        log(`constructor`);
        super(props);
        this.authenticated = false;
    }

    render() {
        log(`render`);
        return (
            <Navigator
                initialRoute={Login.route}
                renderScene={this.renderScene.bind(this)}
                ref={(navigator) => this.navigator = navigator}
                navigationBar={
          <Navigator.NavigationBar
            style={styles.navigationBar}
            routeMapper={NavigationBarRouteMapper}/>
        }/>
        );
    }

    componentDidMount() {
        log(`componentDidMount`);
    }

    componentWillUnmount() {
        log(`componentWillUnmount`);
    }

    renderScene(route, navigator) {
        log(`renderScene ${route.name}`);
        switch (route.name) {
            case Login.routeName:
                return <Login
                    store={this.props.store}
                    navigator={navigator}
                    onAuthSucceeded={() => this.onAuthSucceeded()}/>
            case AlimentEdit.routeName:
                return <AlimentEdit
                    store={this.props.store}
                    navigator={navigator}/>
            case AlimentList.routeName:
            default:
                return <AlimentList
                    store={this.props.store}
                    navigator={navigator}/>
        }
    };
    onAuthSucceeded() {
        //this.navigator.clear();
        log("AUHTEHTICATION SUCCEDED!!!!!!!!!!!!!!!!!!!!!!");
        this.navigator.push(AlimentList.route);
        // if (this.notificationClient) {
        //     this.notificationClient.disconnect();
        // }
        // this.notificationClient = new NotificationClient(this.store);
        // this.notificationClient.connect();
    }
}

const NavigationBarRouteMapper = {
    LeftButton(route, navigator, index, navState) {
        if (index > 0) {
            return (
                <TouchableOpacity
                    onPress={() => {
            if (route.leftAction) route.leftAction();
            if (index > 0) navigator.pop();
          }}>
                    <Text style={styles.leftButton}>Back</Text>
                </TouchableOpacity>
            )
        } else {
            return null;
        }
    },
    RightButton(route, navigator, index, navState) {
        if (route.rightText) return (
            <TouchableOpacity
                onPress={() => route.rightAction()}>
                <Text style={styles.rightButton}>
                    {route.rightText}
                </Text>
            </TouchableOpacity>
        )
    },
    Title(route, navigator, index, navState) {
        return (<Text style={styles.title}>{route.title}</Text>)
    }
};

const styles = StyleSheet.create({
    navigationBar: {
        backgroundColor: '#8000ff',
    },
    leftButton: {
        color: '#1a0033',
        margin: 10,
        marginLeft: 20,
        fontSize: 17,
    },
    title: {
        paddingVertical: 10,
        fontWeight:'bold',
        textAlign:'center',
        color: '#1a0033',
        justifyContent: 'center',
        fontSize: 18
    },
    rightButton: {
        color: '#dab3ff',
        margin: 10,
        fontSize: 16
    },

    deleteButton: {
        color: '#B32401',
        margin: 20,
        fontSize: 18,
        paddingVertical: 30,
    },

    loginButton: {
        color: '#1a0033',
        margin: 20,
        fontSize: 18,
        paddingVertical: 30,
    },

    content: {
        color: '#1a0033',
        marginTop: 90,
        marginLeft: 20,
        marginRight: 20,
    },
});
