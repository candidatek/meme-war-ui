import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';
import { useAuth } from '../hooks/useAuth';

interface ApplyPromoCodeResponse {
    message: string;
    success: boolean;
}

const applyPromoCode = async (code: string, walletAddress: string, token: string): Promise<ApplyPromoCodeResponse> => {
    const response = await axios.get<ApplyPromoCodeResponse>(
        `${SERVER_URL}/applyCode?code=${code}&walletAddress=${walletAddress}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const useApplyPromoCode = (code: string, walletAddress: string, enabled = false) => {
    const { handleSignIn } = useAuth();

    const query = useQuery({
        queryKey: ['promoCode', code, walletAddress],
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

            return applyPromoCode(code, walletAddress, token);
        },
        enabled: enabled && !!code && !!walletAddress,
        staleTime: Infinity,
        retry: 1,
    });

    return {
        ...query,
        isPromoCodeValid: query.isSuccess && query.data?.success === true,
    };
};
