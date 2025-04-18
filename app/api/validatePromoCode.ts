import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SERVER_URL } from '@/lib/constants';

interface ApplyPromoCodeResponse {
    message: string;
    success: boolean;
}

const applyPromoCode = async (code: string, walletAddress: string): Promise<ApplyPromoCodeResponse> => {
    const response = await axios.get<ApplyPromoCodeResponse>(
        `${SERVER_URL}/applyPromoCode?code=${code}&walletAddress=${walletAddress}`
    );
    return response.data;
};

export const useApplyPromoCode = (code: string, walletAddress: string, enabled = false) => {
    const query = useQuery({
        queryKey: ['promoCode', code, walletAddress],
        queryFn: () => applyPromoCode(code, walletAddress),
        enabled: enabled && !!code && !!walletAddress,
        staleTime: Infinity, // Promo code validation doesn't need frequent refetching
        retry: 1, // Only retry once if it fails
    });
    

    return {
        ...query,
        isPromoCodeValid: query.isSuccess && query.data?.success === true,
    };
};