/**
 * Created by nicolab on 12/3/2016.
 */
import {getLogger} from '../core/utils';
import {apiUrl, headers} from '../core/api';
import {User} from './User';

const log = getLogger('authentication/service');
const AUTH_STARTED = 'authentication/started';
const AUTH_SUCCEEDED = 'authentication/succeeded';
const AUTH_FAILED = 'authentication/failed';
const action = (type, payload) => ({type, payload});

export const login = (user) => (dispatch, getState) => {
    if (getState().inprogress) {
        log(`login already in progress`);
        return;
    }
    log(`starting login`);
    dispatch(action(AUTH_STARTED));
    let ok = false;
    log(`starting fetch ${apiUrl}/auth/session`);
    return fetch(`${apiUrl}/auth/session`, {method: 'POST', headers, body: JSON.stringify(user)})
        .then(res => {
            ok = res.ok;
            log(`login res ok = ${ok}`);
            return res.json();
        })
        .then(json => {
            log(`login json = ${json}`);
            dispatch(action(ok? AUTH_SUCCEEDED: AUTH_FAILED, json));
        })
        .catch(err => {
            log(`login err = ${err.message}`);
            dispatch(action(AUTH_FAILED, {issue: [{error: err.message}]}));
        });
};

export const authenticationReducer = (state = {token: null, inprogress: false}, action) => {
    log(`${action.type} ${JSON.stringify(state)}`)
    switch (action.type) {
        case AUTH_STARTED:
            return {token: null, inprogress: true};
        case AUTH_SUCCEEDED:
            return {token: action.payload.token, inprogress: false};
        case AUTH_FAILED:
            return {issue: action.payload.issue, inprogress: false};
        default:
            return state;
    }
};