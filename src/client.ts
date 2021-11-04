import axios from 'axios';

const instance = axios.create({ baseURL: 'https://opensky-network.org/api' });

export const getAllStates = () => instance.get('/states/all');
