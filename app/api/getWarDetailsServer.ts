import axios from "axios";
import { SERVER_URL } from "@/lib/constants";

export const getHomePageWarsDetails = async (
    sortBy: string,
    filterBy: string,
    limit: number,
    offset: number
) => {
    const res = await axios.get(SERVER_URL + `/getWarDetails`, {
        params: { sortBy, filterBy, limit, offset },
    });
    return res.data.data;
};