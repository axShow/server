import axios from "axios";
import {toast} from "react-toastify";
import {useStore} from "./store.ts";

const DRONE_API_PORT = 8034;
export async function call_function(drone_address: string, endpoint: string, data: object, silent: boolean = false) {
    const url = `http://${drone_address}:${DRONE_API_PORT}/${endpoint}`;
    const response = await axios.post(url, null, { params: data})
    const store = useStore.getState()
    if (response.status !== 200) {
        const error_text = `Невозможно выполнить запрос /${endpoint}: ${response.statusText}`;

        store.addLog('error', error_text, drone_address);
        if (silent) return {result: false, details: `HTTP error: ${response.statusText}`};
        toast.error(error_text);
    }
    if (response.data.result !== true) {
        const error_text = `Ошибка выполнения /${endpoint}: ${response.data.details}`;
        store.addLog('error', error_text, drone_address);
        if (silent) return response.data;
        toast.error(error_text);
    }
    return response.data;
}

export async function mass_call_function(drone_addresses: string[], endpoint: string, data: object) {
    const results = await Promise.all(drone_addresses.map(async (drone_address) => call_function(drone_address, endpoint, data, true)));
    if (results.some(r => !r.result)) {
        const error_text = `Не удалось выполнить команду /${endpoint} на ${results.filter(r => !r.result).length}/${drone_addresses.length} дронов`;
        useStore.getState().addLog('error', error_text, 'Массовая операция');
        toast.error(error_text);
    }
    return results;
}


export async function get_drone_data(drone_address: string, endpoint: string) {
    const url = `http://${drone_address}:${DRONE_API_PORT}/${endpoint}`;
    const response = await axios.get(url);
    if (response.status !== 200) {
        const error_text = `Невозможно получить данные с /${endpoint}: ${response.statusText}`;
        useStore.getState().addLog('error', error_text, drone_address);
        toast.error(error_text);
    }
    return response.data;
}

export async function set_drone_data(drone_address: string, endpoint: string, data: object) {
    const url = `http://${drone_address}:${DRONE_API_PORT}/${endpoint}`;
    const response = await axios.post(url, data);
    if (response.status !== 200) {
        const error_text = `Невозможно установить данные на /${endpoint}: ${response.statusText}`;
        useStore.getState().addLog('error', error_text, drone_address);
        toast.error(error_text);

    }
    if (response.data.result !== true) {
        const error_text = `Ошибка установки данных на /${endpoint}: ${response.data.details}`;
        useStore.getState().addLog('error', error_text, drone_address);
        toast.error(error_text);
    }
    return response.data;
}