/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {AlimentEdit} from './AlimentEdit';
import {AlimentView} from './AlimentView';
import {loadAliments, cancelLoadAliments} from './service';
import {registerRightAction, getLogger, issueText} from '../core/utils';
import styles from '../core/styles';

const log = getLogger('AlimentList');
const ALIMENT_LIST_ROUTE = 'aliment/list';

export class AlimentList extends Component {
    static get routeName() {
        return ALIMENT_LIST_ROUTE;
    }

    static get route() {
        return {name: ALIMENT_LIST_ROUTE, title: 'Aliment List', rightText: 'New'};
    }

    constructor(props) {
        super(props);
        log('constructor');
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
        const alimentState = this.props.store.getState().aliment;
        this.state = {isLoading: alimentState.isLoading, dataSource: this.ds.cloneWithRows(alimentState.items)};
        log(this.state.size);
        registerRightAction(this.props.navigator, this.onNewAliment.bind(this));
    }

    render() {
        log('render');
        let message = issueText(this.state.issue);
        return (
            <View style={styles.content}>
                { this.state.isLoading &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                {message && <Text>{message}</Text>}
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={aliment => (<AlimentView aliment={aliment} onPress={(aliment => this.onAlimentPress(aliment))}/>)}/>

            </View>
        );
    }

    onNewAliment() {
        log('onNewAliment');
        this.props.navigator.push({...AlimentEdit.route});
    }

    onAlimentPress(aliment) {
        log('onAlimentPress');
        this.props.navigator.push({...AlimentEdit.route, data: aliment});
    }

    componentDidMount() {
        log('componentDidMount');
        this._isMounted = true;
        const store = this.props.store;
        this.unsubscribe = store.subscribe(() => {
            log('setState');
            const state = this.state;
            const alimentState = store.getState().aliment;
            this.setState({dataSource: this.ds.cloneWithRows(alimentState.items), isLoading: alimentState.isLoading});
        });
        store.dispatch(loadAliments());
    }

    componentWillUnmount() {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        this.props.store.dispatch(cancelLoadAliments());
    }

    onDeleteAliment(aliment) {
        log("onDeleteAliment");
    }
}
