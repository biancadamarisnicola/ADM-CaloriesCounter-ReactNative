/**
 * Created by nicolab on 12/3/2016.
 */
import {getLogger} from '../core/utils';
import {apiUrl, headers} from '../core/api';
import {User} from './User';
import {readUser, saveUser, readServer, saveServer} from './storage';

const log = getLogger('authentication/service');
const AUTH_STARTED = 'authentication/started';
const AUTH_SUCCEEDED = 'authentication/succeeded';
const AUTH_FAILED = 'authentication/failed';
const action = (type, payload) => ({type, payload});

class ExtendableError extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.stack = (new Error()).stack;
        this.name = this.constructor.name;
    }
}

export class ResourceError extends ExtendableError {
    constructor(m, issue) {
        super(m);
        this.issue = issue;
    }
}

export const errorPayload = (err) => err instanceof ResourceError ? {issue: err.issue}: {issue: [{error: err.message}]};

export const loadUserAndServer = () => async(dispatch) => {
    log(`loadUser...`);
    try {
        let result = await Promise.all([readUser(), readServer()]);
        let user = result[0], server = result[1];
        if (user && server) {
            log(`loadUser loaded ${JSON.stringify(user)}`);
            dispatch(action(USER_LOADED, {user, server}));
        }
    } catch (err) {
        log(`loadUser failed`);
        dispatch(action(USER_LOADED, {user: new User('', ''), server: {url: apiUrl}}));
    }
};

export const login = (server, user) => async(dispatch, getState) => {
    if (getState().inprogress) {
        log(`login already in progress`);
        return;
    }
    log(`login... ${apiUrl}`);
    log(`user... ${user}`);
    try {
        dispatch(action(AUTH_STARTED));
        let token = await getToken(server, user);
        log(`login succeeded`);
        await Promise.all([saveUser(user), saveServer(server)]);
        log(`login user saved`);
        dispatch(action(AUTH_SUCCEEDED, {server, user, token}));
    } catch (err) {
        log(`login failed`);
        dispatch(action(AUTH_FAILED, errorPayload(err)));
    }
};

export async function getToken(server, user) {
    const url = `${apiUrl}/auth/session`;
    log(`getToken ${url}`);
    let ok;
    let json = await fetch(url, {method: 'POST', headers, body: JSON.stringify(user)})
        .then(res => {
            ok = res.ok;
            return res.json();
        });
    if (ok) {
        return json.token;
    } else {
        throw new ResourceError(`Authentication failed`, json.issue);
    }
};

// export const login = (server, user) => (dispatch, getState) => {
//     if (getState().inprogress) {
//         log(`login already in progress`);
//         return;
//     }
//     log(`starting login`);
//     dispatch(action(AUTH_STARTED));
//     let ok = false;
//     log(`starting fetch ${apiUrl}/auth/session`);
//     await Promise.all([saveUser(user), saveServer(server)]);
//     return fetch(`${apiUrl}/auth/session`, {method: 'POST', headers, body: JSON.stringify(user)})
//         .then(res => {
//             ok = res.ok;
//             log(`login res ok = ${ok}`);
//             return res.json();
//         })
//         .then(json => {
//             log(`login json = ${json}`);
//             dispatch(action(ok? AUTH_SUCCEEDED: AUTH_FAILED, json));
//         })
//         .catch(err => {
//             log(`login err = ${err.message}`);
//             dispatch(action(AUTH_FAILED, {issue: [{error: err.message}]}));
//         });
// };

export const authenticationReducer = (state = {user: new User('', ''), server: {url: apiUrl}, token: null, isLoading: false}, action) => {
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