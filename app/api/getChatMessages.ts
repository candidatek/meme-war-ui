import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

export interface ChatMessage {
    id: string; 
    sender: string; 
    message: string; 
    meme_war_state: string; 
    sender_time: string; 
}

interface GetChatMessagesResponse {
    data: ChatMessage[]; 
}

const getChatMessages = async (memeWarState: string): Promise<ChatMessage[]> => {
    const response = await axios.get<GetChatMessagesResponse>(`${SERVER_URL}/getChatMessages?memeWarState=` + memeWarState);
    return response.data.data;
};

export const useGetChatMessages = (memeWarState: string) => {
    const query = useQuery({
        queryKey: ['messages', memeWarState],
        queryFn: () => getChatMessages(memeWarState),
        enabled: !!memeWarState, 
        staleTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 1,
        refetchIntervalInBackground: true,
    });

    const refresh = query.refetch;

    return {
        ...query,
        refresh, 
    };
};
