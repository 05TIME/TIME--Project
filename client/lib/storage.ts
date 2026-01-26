import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Endpoint } from "@/types/endpoint";

const ENDPOINTS_KEY = "api_tester_endpoints";

export async function getEndpoints(): Promise<Endpoint[]> {
  try {
    const data = await AsyncStorage.getItem(ENDPOINTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Failed to load endpoints:", error);
    return [];
  }
}

export async function saveEndpoint(endpoint: Endpoint): Promise<void> {
  try {
    const endpoints = await getEndpoints();
    const existingIndex = endpoints.findIndex((e) => e.id === endpoint.id);
    if (existingIndex >= 0) {
      endpoints[existingIndex] = endpoint;
    } else {
      endpoints.unshift(endpoint);
    }
    await AsyncStorage.setItem(ENDPOINTS_KEY, JSON.stringify(endpoints));
  } catch (error) {
    console.error("Failed to save endpoint:", error);
    throw error;
  }
}

export async function deleteEndpoint(id: string): Promise<void> {
  try {
    const endpoints = await getEndpoints();
    const filtered = endpoints.filter((e) => e.id !== id);
    await AsyncStorage.setItem(ENDPOINTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete endpoint:", error);
    throw error;
  }
}

export async function updateEndpointLastUsed(id: string): Promise<void> {
  try {
    const endpoints = await getEndpoints();
    const endpoint = endpoints.find((e) => e.id === id);
    if (endpoint) {
      endpoint.lastUsed = Date.now();
      await AsyncStorage.setItem(ENDPOINTS_KEY, JSON.stringify(endpoints));
    }
  } catch (error) {
    console.error("Failed to update endpoint:", error);
  }
}
