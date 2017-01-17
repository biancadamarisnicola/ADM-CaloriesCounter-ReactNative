import {apiUrl, authHeaders, alimUrl} from "../core/api";
import {getLogger} from '../core/utils';
import {readAliments} from '../authentication';
import {readAliment} from "../authentication/storage";

const action = (type, payload) => ({type, payload});
const LOAD_ALIMENTS_STARTED = 'aliment/loadStarted';
const LOAD_ALIMENTS_SUCCEEDED = 'aliment/loadSucceded';
const LOAD_ALIMENTS_FAILED = 'aliment/loadFailed';
const CANCEL_LOAD_ALIMENTS = 'aliment/cancelLoad';
const SAVE_ALIMENTS_STARTED = 'aliment/saveStarted';
const SAVE_ALIMENTS_SUCCEEDED = 'aliment/saveSucceded';
const SAVE_ALIMENTS_FAILED = 'aliment/saveFailed';
const CANCEL_SAVE_ALIMENTS = 'aliment/cancelSave';
const DELETE_ALIMENT_STARTED = 'aliment/deleteStarted';
const DELETE_ALIMENT_SUCCEEDED = 'aliment/deleteSucceeded';
const DELETE_ALIMENT_FAILED = 'aliment/deleteFailed';

const log = getLogger('AlimentService');

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

export const loadAlimDB=()=> async(dispatch, getState) => {
    log(`loadAliments from DB started`);
    try {
        dispatch(action(LOAD_ALIMENTS_STARTED));
        await Promise.all([readAliment()]);
        log(`login user saved`);
        dispatch(action(LOAD_ALIMENTS_SUCCEEDED));
    } catch (err) {
        log(`login failed`);
        dispatch(action(LOAD_ALIMENTS_FAILED, {issue: [{error: err.message}]}));
    }
};

export const deleteAliment = (aliment) => (dispatch, getState) => {
    log(`deleteAliment started`);
    dispatch(action(DELETE_ALIMENT_STARTED));
    let ok = false;
    const url = `${alimUrl}/aliment/${aliment.name}`;
    log(url);
    return fetch(url, {method: 'DELETE', headers: authHeaders(getState().authentication.token)})
        .then(res => {
            log(`deleteAliment succeded`);
            ok = res.ok;
            return res.json();
        })
        .then(json => {
            log(`deleteAliment ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().aliment.isDeleteCancelled) {
                dispatch(action(ok ? DELETE_ALIMENT_SUCCEDED : DELETE_ALIMENT_FAILED, json));
            }
        })
        .catch(err => {
            log(`deleteAliment err = ${err.message}`);
            if (!getState().aliment.isLoadingCancelled) {
                dispatch(action(DELETE_ALIMENT_FAILED, {issue: [{error: err.message}]}));
            }
        });
};

export const cancelLoadAliments = () => action(CANCEL_LOAD_ALIMENTS);

export const saveAliment = (aliment) => (dispatch, getState) => {
    const body = JSON.stringify(aliment);
    log(`saveAliment started`);
    dispatch(action(SAVE_ALIMENTS_STARTED));
    let ok = false;
    const url = aliment._id ? `${alimUrl}/aliment/${aliment.name}` : `${alimUrl}/aliment`;
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

export const alimentCreated = (createdAliment) => action(SAVE_ALIMENTS_SUCCEEDED, createdAliment);
export const alimentUpdated = (updatedAliment) => action(SAVE_ALIMENTS_SUCCEEDED, updatedAliment);
export const alimentDeleted = (deletedAliment) => action(DELETE_ALIMENT_SUCCEEDED, deletedAliment);

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
        case DELETE_ALIMENT_STARTED:
            return {...state, isDeleting: true, isDeletingCancelled: false, issue: null};
        case DELETE_ALIMENT_SUCCEEDED:
            return {...state, items: action.payload, isDeleting: false};
        case DELETE_ALIMENT_FAILED:
            return {...state, issue: action.payload.issue, isDeleting: false};
        default:
            return state;
    }
};