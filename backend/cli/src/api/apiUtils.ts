// This file contains utility functions for making API requests to external services. 

import axios, { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
import { writeFile } from '../utils/utils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiGetRequest = async <T>(
    url: string, 
    token?: string, 
    retries: number = 10,
    retryDelay: number = 2000
): Promise<ApiResponse<T>> => {
    try {
        console.log(url)
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        };

        let response = await axios.get<T>(url, config);
        
        if (response.status === 202 && retries > 0) {
            await delay(retryDelay);
            return await apiGetRequest<T>(url, token, retries - 1, retryDelay);
        }

        return { data: response.data, error: null };
    } catch (error: any) {
        console.log("Apigetrequest error")
        console.log(url)
        // Check for 404 error and specific GitHub License API documentation URL
        if (error.response?.status === 404 && error.response?.data?.documentation_url === 'https://docs.github.com/rest/licenses/licenses#get-the-license-for-a-repository') {
            console.warn('No license found for this repository.');
            return { data: null, error: "Not Found" };
        }
        
        console.error('Error details:', error.response?.data || error.message || error);
        return { data: null, error: error.response?.data?.message || error.message || 'apigetrequest error' };
    }
};

export const apiPostRequest = async <T>(
    url: string, 
    data: any, 
    token?: string
): Promise<ApiResponse<T>> => {
    try {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        };
        
        console.log("post request sent to:", url);
        const response = await axios.post<T>(url, data, config);
        
        return { data: response.data, error: null };
    } catch (error: any) {
        console.log("apipostrequest error")
        console.log(url)

        console.error('Error details:', error.response?.data || error.message || error);
        return { data: null, error: error.response?.data?.message || error.message || 'apipostrequest error' };
    }
};