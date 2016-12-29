/**
 * Created by nicolab on 12/3/2016.
 */
const io = require('socket.io-client/dist/socket.io');
import {apiUrl} from '../core/api';
import {getLogger} from '../core/utils';
import {alimentCreated, alimentUpdated, alimentDeleted} from './service';

window.navigator.userAgent = 'ReactNative';

const log = getLogger('NotificationClient');

const ALIMENT_CREATED = 'aliment/created';
const ALIMENT_UPDATED = 'aliment/updated';
const ALIMENT_DELETED = 'aliment/deleted';

export class NotificationClient {
    constructor(store) {
        this.store = store;
    }

    connect() {
        log(`connect...`);
        const store = this.store;
        const auth = store.getState().authentication;
        log(auth);
        this.socket = io(auth.server.url, {transports: ['websocket']});
        const socket = this.socket;
        socket.on('connect', () => {
            log('connected');
            socket
                .emit('authenticate', {token: auth.token})
                .on('authenticated', () => log(`authenticated`))
                .on('unauthorized', (msg) => log(`unauthorized: ${JSON.stringify(msg.data)}`))
        });
        socket.on(ALIMENT_CREATED, (aliment) => {
            log(ALIMENT_CREATED);
            store.dispatch(alimentCreated(aliment));
        });
        socket.on(ALIMENT_UPDATED, (aliment) => {
            log(ALIMENT_UPDATED);
            store.dispatch(alimentUpdated(aliment))
        });
        socket.on(ALIMENT_DELETED, (aliment) => {
            log(ALIMENT_DELETED);
            store.dispatch(alimentDeleted(aliment))
        });
    };

    disconnect() {
        log(`disconnect`);
        this.socket.disconnect();
    }
}