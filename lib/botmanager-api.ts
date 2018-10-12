import axios from "axios";
import config from "../config";

const bmHTTPClient = axios.create({
    withCredentials: true,
    headers: {
        'X-API-KEY': config.botManagerAPI.key,
        'Accept': 'application/json'
    }
});

export const getCoinsCount = async (userMongoID: string) => {
    const { data } = await bmHTTPClient.get(
        config.botManagerAPI.url + '/v1/boosts?userId=' + userMongoID
    );
    if (!data || !data.success) {
        return Promise.reject('failed to get coins count for user');
    }
    return data.data ? data.data.count : 0;
};
