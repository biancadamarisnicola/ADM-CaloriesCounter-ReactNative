/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {AppRegistry} from 'react-native';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import {alimentReducer} from './src/aliments';
import {authenticationReducer} from './src/authentication';
import {Router} from './src/Router'

const rootReducer = combineReducers({aliment: alimentReducer, authentication: authenticationReducer});
const store = createStore(rootReducer, applyMiddleware(thunk, createLogger()));

export default class CaloriesCounterReact extends Component {
  render() {
    return (
        <Router store={store}/>
    );
  }
}

AppRegistry.registerComponent('CaloriesCounterReact', () => CaloriesCounterReact);
