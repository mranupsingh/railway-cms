export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
    },
    COACH: {
        MASTER: {
            GET: '/coach/master',
            GET_BY_ID: (id: string) => `/coach/master/${id}`,
        },
        HISTORY: {
            GET: '/coach/history'
        }
    }
};
