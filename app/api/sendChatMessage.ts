import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { SERVER_URL } from "@/lib/constants";

interface SendChatMessageParams {
  pubKey: string;
  newMessage: string;
  memeWarState: string;
}

export interface IMessage {
  id?: string;
  sender: string;
  message: string;
  memeWarState?: string;
  senderTime?: Date;
}

interface SendChatMessageResponse {
  message: string;
  data: IMessage;
}

export const sendChatMessage = async ({
  pubKey,
  newMessage,
  memeWarState,
}: SendChatMessageParams) => {
  if (!newMessage.trim()) throw new Error("Message cannot be empty");
  if (!memeWarState) throw new Error("MemeWarState is required");
  if (!pubKey) throw new Error("Sender public key is required");

  try {
    const response = await axios.post(
      `${SERVER_URL}/sendChatMessage`,
      {
        sender: pubKey,
        message: newMessage,
        memeWarState,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      }
    );
    // if (!response.status) {
    //     const errorData = await response.data;
    //     console.log("Error Data when sign in while sending message: ", errorData);
    //     if (response.status === 401 && errorData.requiresSignature) {
    //         // Token is invalid or missing, need to sign and get new token
    //         const newToken = await handleSignIn;
    //         console.log("Sending message after handleSignIn called");
    //         // Retry the message send with new token
    //         return await axios.post(`${SERVER_URL}/sendChatMessage`, {
    //             sender: pubKey,
    //             message: newMessage,
    //             memeWarState,
    //         }, {
    //             headers: {
    //                 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    //             }
    //         });
    //     }
    // }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to send message"
      );
    }
    throw error;
  }
};

export const useSendChatMessage = (onSuccess?: () => void) => {
  return useMutation<SendChatMessageResponse, Error, SendChatMessageParams>({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      // Optional: Add error handling, perhaps show a toast or log the error
      console.error("Message send failed:", error.message);
    },
  });
};
