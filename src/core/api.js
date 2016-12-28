/**
 * Created by nicolab on 12/3/2016.
 */
export const apiUrl = 'http://192.168.0.104:3000/api';
export const alimUrl = 'http://192.168.0.104:3000';
export const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
export const authHeaders = (token) => ({...headers, 'Authorization': `Bearer ${token}`});