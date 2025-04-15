import axios from "axios";

import { SERVER_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

const getHomePageDetails = async () => {
  const response = await axios.get(SERVER_URL + `/getHomePageDetails`);
  return response.data.data;
};

const getWarDetails = async (
  sortBy: string,
  filterBy: string,
  limit: number,
  offset: number
) => {
  const response = await axios.get(SERVER_URL + `/getWarDetails`, {
    params: {
      sortBy,
      filterBy,
      limit,
      offset,
    },
  });
  return response.data.data;
};

const searchMemeWars = async (query: string) => {
  try {
    console.log(`Sending search request for query: "${query}"`);
    const response = await axios.get(SERVER_URL + `/searchMemeWar`, {
      params: { query },
    });
    console.log(`Search response received, status: ${response.status}`);
    return response.data.data;
  } catch (error) {
    console.error("Search error:", error);
    if (axios.isAxiosError(error)) {
      console.error(`Response status: ${error.response?.status}`);
      console.error(`Response data:`, error.response?.data);
    }
    throw error;
  }
};

export const useGetHomePageDetails = () => {
  return useQuery({
    queryKey: ["getHomePageDetails"],
    queryFn: () => getHomePageDetails(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: false,
  });
};

export const useGetWarDetails = (
  sortBy: string,
  filterBy: string,
  limit: number,
  offset: number
) => {
  return useQuery({
    queryKey: ["getWarDetails", sortBy, filterBy, limit, offset],
    queryFn: () => getWarDetails(sortBy, filterBy, limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 3, // 3 minute
    refetchIntervalInBackground: false,
  });
};

export const useSearchMemeWars = (query: string) => {
  return useQuery({
    queryKey: ["searchMemeWars", query],
    queryFn: () => searchMemeWars(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!query, // Only run the query if there is a search term
  });
};
