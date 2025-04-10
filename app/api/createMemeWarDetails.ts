import { SERVER_URL } from "@/lib/constants";
import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface MemeWarDetailsParams {
    memeWarState: PublicKey;
    memeWarData: {
        description?: string;
        twitter?: string;
        telegram?: string;
        website?: string;
    }
}

interface IMemeWarData {
    description: string | null,
    twitter: string | null,
    telegram: string | null;
    website: string | null;

}

interface MemeWarDetailsResponse {
    message: string;
    data: IMemeWarData;
}

export const createMemeWarDetails = async ({
    memeWarState,
    memeWarData
}: MemeWarDetailsParams) => {
    if (!memeWarData) throw new Error('MemeWarData cannot be empty');
    if (!memeWarState) throw new Error('MemeWarState is required');

    try {
        const response = await axios.post(`${SERVER_URL}/meme-war-details?memeWarState=${memeWarState}`, {
            description: memeWarData.description,
            telegram: memeWarData.telegram, 
            twitter: memeWarData.twitter, 
            website: memeWarData.website
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to post meme war details');
        }
        throw error;
    }
};

export const useCreateMemeWarDetails = (onSuccess?: () => void) => {
    return useMutation<MemeWarDetailsResponse, Error, MemeWarDetailsParams>({
        mutationFn: createMemeWarDetails,
        onSuccess: () => {
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            console.error('Creating meme war details failed:', error.message);
        }
    });
}