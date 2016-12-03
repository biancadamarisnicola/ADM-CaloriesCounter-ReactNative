/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {Text, View, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import {login} from './service';
import {getLogger, registerRightAction, issueText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('Login');

const LOGIN_ROUTE = 'auth/login';

export class Login extends Component {
    static get routeName() {
        return LOGIN_ROUTE;
    }

    static get route() {
        return {name: LOGIN_ROUTE, title: 'Authentication', rightText: 'Login'};
    }

    constructor(props) {
        super(props);
        this.state = {username: '', password: ''};
        log('constructor');
    }

    componentWillMount() {
        log('componentWillMount');
        this.updateState();
        registerRightAction(this.props.navigator, this.onLogin.bind(this));
    }

    render() {
        log('render');
        const authentication = this.state.authentication;
        let message = issueText(authentication.issue);
        return (
            <View style={styles.content}>
                <ActivityIndicator animating={authentication.inprogress} style={styles.activityIndicator} size="large"/>
                <Text>Username</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, username: text})}/>
                <Text>Password</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, password: text})}/>
                {message && <Text>{message}</Text>}
            </View>
        );
    }

    componentDidMount() {
        log(`componentDidMount`);
        this.unsubscribe = this.props.store.subscribe(() => this.updateState());
    }

    componentWillUnmount() {
        log(`componentWillUnmount`);
        this.unsubscribe();
    }

    updateState() {
        log(`updateState`);
        this.setState({...this.state, authentication: this.props.store.getState().authentication});
    }

    onLogin() {
        log('onLogin');
        this.props.store.dispatch(login(this.state)).then(() => {
            if (this.state.authentication.token) {
                this.props.onAuthSucceeded();
            }
        });
    }
}
