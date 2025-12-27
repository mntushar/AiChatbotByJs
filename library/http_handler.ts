import Errors from "./error_handler";

class HttpHandler {
    async delete(uri: string, accessToken?: string): Promise<Record<string, any>> {
        const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: Object.fromEntries(this._buildHeaders(accessToken).entries()),
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async get(uri: string, accessToken?: string): Promise<any> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: Object.fromEntries(this._buildHeaders(accessToken).entries()),
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async getWithoutToken(uri: string): Promise<any> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: Object.fromEntries(this._buildHeaders().entries()),
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async post(uri: string, accessToken?: string, value: any = null): Promise<Record<string, any>> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: Object.fromEntries(this._buildHeaders(accessToken).entries()),
            body: value ? JSON.stringify(value) : null,
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async postWithoutToken(uri: string, value: any = null): Promise<any> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: Object.fromEntries(this._buildHeaders().entries()),
            body: value ? JSON.stringify(value) : null,
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async put(uri: string, accessToken?: string, value: any = null): Promise<any> {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: Object.fromEntries(this._buildHeaders(accessToken).entries()),
            body: value ? JSON.stringify(value) : null,
        };
        return await this._sendRequest(uri, requestOptions);
    }

    async getForFile(uri: string, accessToken?: string): Promise<any> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: Object.fromEntries(this._buildHeaders(accessToken).entries()),
        };
        return await this._sendFileRequest(uri, requestOptions);
    }

    async postForFile(uri: string, accessToken?: string, value: any = null): Promise<Record<string, any>> {
        const formData = new FormData();
        if (value) {
            formData.append('data', JSON.stringify(value));
        }

        const requestOptions: RequestInit = {
            method: 'POST',
            headers: this._buildHeaders(accessToken, false),
            body: formData,
        };
        return await this._sendFileRequest(uri, requestOptions);
    }

    private _buildHeaders(accessToken?: string, isJson: boolean = true): Headers {
        const headers = new Headers();
    
        if (isJson) {
            headers.set('Content-Type', 'application/json');
        }
    
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
    
        return headers;
    }

    private async _sendRequest(uri: string, requestOptions: RequestInit): Promise<Record<string, any>> {
        try {
            const response = await fetch(uri, requestOptions);
            if(response.ok) return await response.json();

            const error = await response.json();
            throw new Errors(error, response.status);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    private async _sendFileRequest(uri: string, requestOptions: RequestInit): Promise<Record<string, any>> {
        try {
            const response = await fetch(uri, requestOptions);
            if(response.ok) return await response.blob();

            const error = await response.json();
            throw new Errors(error, response.status);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export default HttpHandler;