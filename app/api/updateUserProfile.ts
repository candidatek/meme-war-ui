import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SERVER_URL } from "@/lib/constants";

interface UpdateProfileData {
  wallet_address: string;
  username?: string;
  social_handle?: string;
  bio?: string;
}

/**
 * Update a user's profile information
 */
const updateUserProfile = async (data: UpdateProfileData) => {
  // Check if we have a token in localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  try {
    const response = await axios.post(`${SERVER_URL}/updateUserProfile`, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle specific status codes
      if (error.response?.status === 401) {
        throw new Error("401: Authentication required. Please sign in again.");
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error; // Re-throw any other errors
  }
};

/**
 * Hook for updating user profile
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    // When the mutation is successful, invalidate the userProfile query
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", variables.wallet_address],
      });
    },
  });
};
