/**
 * Created by nicolab on 12/3/2016.
 */

import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveAliment, cancelSaveAliment} from './service';
import {registerRightAction, issueText, getLogger} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('AlimentEdit');
const ALIMENT_EDIT_ROUTE = 'aliment/edit';

export class AlimentEdit extends Component {
    static get routeName() {
        return ALIMENT_EDIT_ROUTE;
    }

    static get route() {
        return {name: ALIMENT_EDIT_ROUTE, title: 'Aliment Edit', rightText: 'Save'};
    }

    constructor(props) {
        log('constructor');
        super(props);
        const nav = this.props.navigator;
        const currentRoutes = nav.getCurrentRoutes();
        const currentRoute = currentRoutes[currentRoutes.length - 1];
        if (currentRoute.data) {
            this.state = {aliment: {...currentRoute.data}, isSaving: false};
        } else {
            this.state = {aliment: {text: ''}, isSaving: false};
        }
        registerRightAction(this.props.navigator, this.onSave.bind(this));
    }

    render() {
        log('render');
        const state = this.state;
        let message = issueText(state.issue);
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                <Text>Text</Text>
                <TextInput value={state.aliment.text} onChangeText={(text) => this.updateAlimentText(text)}></TextInput>
                {message && <Text>{message}</Text>}
            </View>
        );
    }

    componentDidMount() {
        log('componentDidMount');
        this._isMounted = true;
        const store = this.props.store;
        this.unsubscribe = store.subscribe(() => {
            log('setState');
            const state = this.state;
            const alimentState = store.getState().aliment;
            this.setState({...state, issue: alimentState.issue});
        });
    }

    componentWillUnmount() {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        this.props.store.dispatch(cancelSaveAliment());
    }

    updateAlimentText(text) {
        let newState = {...this.state};
        newState.aliment.text = text;
        this.setState(newState);
    }

    onSave() {
        log('onSave');
        this.props.store.dispatch(saveAliment(this.state.aliment)).then(() => {
            log('onAlimentSaved');
            if (!this.state.issue) {
                this.props.navigator.pop();
            }
        });
    }
}