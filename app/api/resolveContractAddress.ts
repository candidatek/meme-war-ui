import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';
import { useAuth } from '../hooks/useAuth';

interface ResolveContractResponse {
    message: string;
    data?: {
        contract_address: string;
    };
    error?: string;
}

const resolveContractAddress = async (stringName: string, token: string): Promise<ResolveContractResponse> => {
    const response = await axios.get<ResolveContractResponse>(
        `${SERVER_URL}/resolve?string_name=${stringName}`
    );
    return response.data;
};

export const useResolveContract = (stringName: string, enabled = false) => {
    const { handleSignIn } = useAuth();

    const query = useQuery({
        queryKey: ['contractAddress', stringName],
        queryFn: async () => {
            let token = localStorage.getItem('jwt_token');
            if (!token) {
                try {
                    await handleSignIn();
                    token = localStorage.getItem('jwt_token');
                    if (!token) {
                        throw new Error('Authentication failed: Token missing after sign in');
                    }
                } catch (error) {
                    throw new Error('Authentication failed. Please try again.');
                }
            }

            return resolveContractAddress(stringName, token);
        },
        enabled: enabled && !!stringName,
        staleTime: Infinity,
        retry: false,
    });

    return {
        ...query,
        contractAddress: query.data?.data?.contract_address,
        isResolved: query.isSuccess && !!query.data?.data?.contract_address,
    };
};