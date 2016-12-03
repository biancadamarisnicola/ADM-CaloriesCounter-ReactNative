import {apiUrl, authHeaders, alimUrl} from "../core/api";
import {getLogger} from '../core/utils';

const action = (type, payload) => ({type, payload});
const LOAD_ALIMENTS_STARTED = 'aliment/loadStarted';
const LOAD_ALIMENTS_SUCCEEDED = 'aliment/loadSucceded';
const LOAD_ALIMENTS_FAILED = 'aliment/loadFailed';
const CANCEL_LOAD_ALIMENTS = 'aliment/cancelLoad';
const SAVE_ALIMENTS_STARTED = 'aliment/saveStarted';
const SAVE_ALIMENTS_SUCCEEDED = 'aliment/saveSucceded';
const SAVE_ALIMENTS_FAILED = 'aliment/saveFailed';
const CANCEL_SAVE_ALIMENTS = 'aliment/cancelSave';

const log = getLogger('AlimentService');

export const alimentReducer = (state = {items: [], isLoading: false, isSaving: false}, action) => { //newState (new object)
    switch (action.type) {
        case LOAD_ALIMENTS_STARTED:
            return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
        case LOAD_ALIMENTS_SUCCEEDED:
            return {...state, items: action.payload, isLoading: false};
        case LOAD_ALIMENTS_FAILED:
            return {...state, issue: action.payload.issue, isLoading: false};
        case CANCEL_LOAD_ALIMENTS:
            return {...state, isLoading: false, isLoadingCancelled: true};
        case SAVE_ALIMENTS_STARTED:
            return {...state, isSaving: true, isSavingCancelled: false, issue: null};
        case SAVE_ALIMENTS_SUCCEEDED:
            let items = [...state.items];
            let index = items.findIndex((i) => i._id == action.payload._id);
            if (index != -1) {
                items.splice(index, 1, action.payload);
            } else {
                items.push(action.payload);
            }
            return {...state, items, isSaving: false};
        case SAVE_ALIMENTS_FAILED:
            return {...state, issue: action.payload.issue, isSaving: false};
        case CANCEL_SAVE_ALIMENTS:
            return {...state, isSaving: false, isSavingCancelled: true};
        default:
            return state;
    }
};

export const loadAliments = () => (dispatch, getState) => {
    log(`loadAliments started`);
    dispatch(action(LOAD_ALIMENTS_STARTED));
    let ok = false;
    return fetch(`${alimUrl}/aliment`, {method: 'GET', headers: authHeaders(getState().authentication.token)})
        .then(res => {
            ok = res.ok;
            return res.json();
        })
        .then(json => {
            log(`loadAliments ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().aliment.isLoadingCancelled) {
                dispatch(action(ok ? LOAD_ALIMENTS_SUCCEEDED : LOAD_ALIMENTS_FAILED, json));
            }
        })
        .catch(err => {
            log(`loadAliments err = ${err.message}`);
            if (!getState().aliment.isLoadingCancelled) {
                dispatch(action(LOAD_ALIMENTS_FAILED, {issue: [{error: err.message}]}));
            }
        });
};

export const cancelLoadAliments = () => action(CANCEL_LOAD_ALIMENTS);

export const saveAliment = (aliment) => (dispatch, getState) => {
    const body = JSON.stringify(aliment);
    log(`saveAliment started`);
    dispatch(action(SAVE_ALIMENTS_STARTED));
    let ok = false;
    const url = aliment._id ? `${alimUrl}/aliment/${aliment._id}` : `${alimUrl}/aliment`;
    const method = aliment._id ? `PUT` : `POST`;
    return fetch(url, {method, headers: authHeaders(getState().authentication.token), body})
        .then(res => {
            ok = res.ok;
            return res.json();
        })
        .then(json => {
            log(`saveAliment ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().aliment.isSavingCancelled) {
                dispatch(action(ok ? SAVE_ALIMENTS_SUCCEEDED : SAVE_ALIMENTS_FAILED, json));
            }
        })
        .catch(err => {
            log(`saveAliment err = ${err.message}`);
            if (!getState().isSavingCancelled) {
                dispatch(action(SAVE_ALIMENTS_FAILED, {issue: [{error: err.message}]}));
            }
        });
};
export const cancelSaveAliment = () => action(CANCEL_SAVE_ALIMENTS);