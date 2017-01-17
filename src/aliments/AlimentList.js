/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator, Image, NetInfo, AsyncStorage} from 'react-native';
import {AlimentEdit} from './AlimentEdit';
import {AlimentView} from './AlimentView';
import {loadAliments, cancelLoadAliments, loadAlimDB} from './service';
import {registerRightAction, getLogger, issueText} from '../core/utils';
import styles from '../core/styles';


const log = getLogger('AlimentList');
const ALIMENT_LIST_ROUTE = 'aliment/list';

export class AlimentList extends Component {
    state = {
        isConnected: true,
    };

    aliments = {};

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
                <Text
                    style={{fontWeight: 'bold', color: 'red'}}>You are: {this.state.isConnected ? 'Online' : 'Offline'}</Text>
                <Text> </Text>
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={aliment => (<AlimentView aliment={aliment} onPress={(aliment => this.onAlimentPress(aliment))}/>
                    )}/>
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

        if (this.state.isConnected || this.state.isConnected === undefined) {
            store.dispatch(loadAliments());
            log("****"+this.props.store.getState().aliment.toString());
        } else {
            log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~" + this.state.isConnected);
            log("****"+this.state.dataSource.getRowData(0));
            loadAlimDB();
        } ;
        NetInfo.isConnected.addEventListener(
            'change',
            this._handleConnectivityChange
        );
        NetInfo.isConnected.fetch().done(
            (isConnected) => {
                this.setState({isConnected});
            }
        );
    }

    componentWillUnmount() {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        this.props.store.dispatch(cancelLoadAliments());
        NetInfo.removeEventListener(
            'change',
            this._handleConnectionInfoChange
        );
    }

    onDeleteAliment(aliment) {
        log("onDeleteAliment");
    }


}
