export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
    },
    COACH: {
        MASTER: {
            GET: '/coach/master',
            GET_BY_ID: (id: string) => `/coach/master${id ? `/${id}` : ''}`,
            UPDATE: (id: string) => `/coach/master${id ? `/${id}` : ''}`
        },
        HISTORY: {
            GET: '/coach/history',
            UPDATE: (id: string) => `/coach/history${id ? `/${id}` : ''}`
        },
        YARD: {
            ADD: '/coach/yard'
        },
        AIR_BRAKE: {
            BULK_UPDATE: '/coach/air-brake'
        }
    }
};
