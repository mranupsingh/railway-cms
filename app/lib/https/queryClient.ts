import { isServer, QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                staleTime: 1000 * 60 * 5, // 5mins
                gcTime: 1000 * 60 * 30, // 30mins
                retry: 1,
            }
        }
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {

    if (isServer) {
        return makeQueryClient();
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient
    }

}