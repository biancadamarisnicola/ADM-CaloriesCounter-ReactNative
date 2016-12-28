/**
 * Created by nicolab on 12/3/2016.
 */
'use strict';
import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveAliment, cancelSaveAliment, deleteAliment} from './service';
import {registerRightAction, issueText, getLogger} from '../core/utils';
import Button from 'react-native-button';
import styles from '../core/styles';
import {AlimentList} from "./AlimentList";

const log = getLogger('AlimentEdit');
const ALIMENT_EDIT_ROUTE = 'aliment/edit';

export class AlimentEdit extends Component {
    static get routeName() {
        return ALIMENT_EDIT_ROUTE;
    }

    static get route() {
        return {name: ALIMENT_EDIT_ROUTE, title: 'Aliment Edit'};
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
            this.state = {aliment: {name: ''}, isSaving: false};
        }
        registerRightAction(this.props.navigator, this.onSave.bind(this));
    }

    render() {
        log('render');
        const state = this.state;
        if (state.aliment.calories === undefined){
            //DONT HAVE AN OBJECT YET
            this.state.aliment.calories = 0;
            this.state.aliment.fats = 0;
            this.state.aliment.proteins = 0;
            this.state.aliment.carbs = 0;
        }
        let message = issueText(state.issue);
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }

                {/*<Text onPress={(aliment => this.onDeleteButtonPress(aliment))}> Delete this aliment</Text>*/}
                <Text>Name</Text>
                <TextInput value={state.aliment.name} onChangeText={(name) => this.updateAlimentName(name)}></TextInput>
                <Text>Calories</Text>
                <TextInput value={state.aliment.calories.toString()} onChangeText={(calories) => this.updateAliment(calories, state.aliment.fats, state.aliment.proteins, state.aliment.carbs)}></TextInput>
                <Text>Proteins</Text>
                <TextInput value={state.aliment.proteins.toString()} onChangeText={(proteins) => this.updateAliment(state.aliment.calories, state.aliment.fats, proteins, state.aliment.carbs)}></TextInput>
                <Text>Carbs</Text>
                <TextInput value={state.aliment.carbs.toString()} onChangeText={(carbs) => this.updateAliment(state.aliment.calories, state.aliment.fats, state.aliment.proteins, carbs)}></TextInput>
                <Text>Fats</Text>
                <TextInput value={state.aliment.fats.toString()} onChangeText={(fats) => this.updateAliment(state.aliment.calories, fats, state.aliment.proteins, state.aliment.carbs)}></TextInput>
                {message && <Text>{message}</Text>}
                <Button
                    containerStyle={{padding:10, height:45, overflow:'hidden', borderRadius:4, backgroundColor: '#dab3ff'}}
                    style={styles.deleteButton}
                    onPress={(aliment => this.onSave())}>
                    Save
                </Button>
                <Button
                    containerStyle={{padding:10, height:45, overflow:'hidden', borderRadius:4, backgroundColor: '#dab3ff'}}
                    style={styles.deleteButton}
                    onPress={(aliment => this.onDeleteButtonPress(aliment))}>
                    Delete
                </Button>
            </View>
        );
    }

    onDeleteButtonPress() {
        log("onDeleteButtonPress");
        this.props.store.dispatch(deleteAliment(this.state.aliment)).then(() => {
            log('onAlimentDeleted');
            if (!this.state.issue) {
                this.props.navigator.pop();
            }
            this.props.navigator.push(AlimentList.route);
        });

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

    updateAliment(calories, fats, proteins, carbs) {
        let newState = {...this.state};
        newState.aliment.calories = Number(calories);
        newState.aliment.proteins = Number(proteins);
        newState.aliment.carbs = Number(carbs);
        newState.aliment.fats = Number(fats);
        this.setState(newState);
    }

    updateAlimentName(name) {
        let newState = {...this.state};
        newState.aliment.name = name;
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