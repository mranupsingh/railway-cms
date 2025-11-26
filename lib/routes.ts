export type RouteInfoValueProps = {
    segment: Routes,
    type: RouteAccessType
}

export type MixedRouteProperties = {
    protected: Routes[];
    public: Routes[];
};

export const ROUTE_ACCESS = {
    PROTECTED: 'PROTECTED',
    PUBLIC: 'PUBLIC',
    NO_RESTRICTION: 'NO_RESTRICTION'
}
type RouteAccessType = typeof ROUTE_ACCESS[keyof typeof ROUTE_ACCESS]

export const ROUTE = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    MASTER_REPORT: '/master-report',
} as const
type Routes = typeof ROUTE[keyof typeof ROUTE]

export const RouteInfo = new Map<Routes, RouteInfoValueProps>([
    [ROUTE.HOME, { segment: ROUTE.HOME, type: ROUTE_ACCESS.PROTECTED }],
    [ROUTE.LOGIN, { segment: ROUTE.LOGIN, type: ROUTE_ACCESS.PUBLIC }],
    [ROUTE.DASHBOARD, { segment: ROUTE.DASHBOARD, type: ROUTE_ACCESS.PROTECTED }],
]);

// Precompute once at startup
export const routes: MixedRouteProperties = Array.from(RouteInfo.values()).reduce(
    (finalRoutes: MixedRouteProperties, currentValue: RouteInfoValueProps) => {
        if (currentValue.type === ROUTE_ACCESS.PROTECTED) {
            finalRoutes.protected.push(currentValue.segment);
        } else if (currentValue.type === ROUTE_ACCESS.PUBLIC) {
            finalRoutes.public.push(currentValue.segment);
        }
        return finalRoutes;
    },
    { protected: [], public: [] }
);

export function toRoute(path: string): Routes | undefined {
    const values = Object.values(ROUTE) as Routes[]
    const match = values.find((r) => r === path)
    return match
}
