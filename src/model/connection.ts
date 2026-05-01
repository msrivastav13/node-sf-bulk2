export interface Connection {
    accessToken: string;
    apiVersion: string;
    instanceUrl: string;
    isTooling?: boolean;
    callOptions?: {
        client?: string;
        defaultNamespace?: string;
    }
}