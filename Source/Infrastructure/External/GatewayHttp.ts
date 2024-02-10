import { ErrorExternal, ErrorExternalKey } from '@/Common/Error';

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class GatewaysHttp {
    private static _instance: GatewaysHttp;
    private readonly axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            withCredentials: true,
        });
    }

    public static get instance (): GatewaysHttp {
        if (!GatewaysHttp._instance)
            GatewaysHttp._instance = new GatewaysHttp();
        return GatewaysHttp._instance;
    }

    public async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.get(url, options);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error))
                throw this.handleError(error);
            else
                throw error;
        }
    }

    public async post<T, U>(url: string, data: T, options?: AxiosRequestConfig): Promise<U> {
        try {
            const response: AxiosResponse<U> = await this.axiosInstance.post(url, data, options);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error))
                throw this.handleError(error);
            else
                throw error;
        }
    }

    public async put<T>(url: string, data: T, options?: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, options);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error))
                throw this.handleError(error);
            else
                throw error;
        }
    }

    public async delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.axiosInstance.delete(url, options);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error))
                throw this.handleError(error);
            else
                throw error;
        }
    }

    private handleError(error: AxiosError): never {
        if (error.response)
            switch (error.response.status) {
            case 401:
                throw new ErrorExternal({
                    key: ErrorExternalKey.UNAUTHORIZED,
                });
            case 403:
                throw new ErrorExternal({
                    key: ErrorExternalKey.FORBIDDEN,
                });
            case 404:
                throw new ErrorExternal({
                    key: ErrorExternalKey.NOT_FOUND,
                });
            case 408:
                throw new ErrorExternal({
                    key: ErrorExternalKey.TIMEOUT,
                });
            case 500:
            default:
                throw new ErrorExternal({
                    key: ErrorExternalKey.SERVER_ERROR,
                });
            }
        else if (error.request)
            throw new ErrorExternal({
                key: ErrorExternalKey.TIMEOUT,
            });
        else
            throw new ErrorExternal({
                key: ErrorExternalKey.SERVER_ERROR,
            });
    }
}
