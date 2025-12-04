export type RouteInfoValueProps = {
    segment: Routes,
    type: RouteAccessType,
    title: string
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
    MASTER_RECORD: '/master-record',
    HISTORY_RECORD: '/history-record',

    ADD_COACH_IN_YARD: '/add-coach-in-yard',
    REMOVE_COACHES_FROM_YARD: '/remove-coaches-from-yard',

    AIR_BRAKE: '/air-brake',
    R_LIFTING: '/r-lifting',
    UPHOLSTERY: '/upholstery',
    BATTERY_UPHOLSTERY: '/battery-upholstery',
    BIO_TANK: '/bio-tank',
    ELECTRIC_NTXR: '/electric-ntxr',
    LIFTING_REPORT: '/lifting-report',

    ADD_COACH_IN_SHOP: '/add-coach-in-shop',
    LOGS: '/logs',

} as const
export type Routes = typeof ROUTE[keyof typeof ROUTE]

export const RouteInfo = new Map<Routes, RouteInfoValueProps>([
    [ROUTE.HOME, { segment: ROUTE.HOME, type: ROUTE_ACCESS.PROTECTED, title: 'Home' }],
    [ROUTE.LOGIN, { segment: ROUTE.LOGIN, type: ROUTE_ACCESS.PUBLIC, title: 'Login' }],
    [ROUTE.DASHBOARD, { segment: ROUTE.DASHBOARD, type: ROUTE_ACCESS.PROTECTED, title: 'Dashboard' }],
    [ROUTE.MASTER_RECORD, { segment: ROUTE.MASTER_RECORD, type: ROUTE_ACCESS.PROTECTED, title: 'Master Record' }],
    [ROUTE.HISTORY_RECORD, { segment: ROUTE.HISTORY_RECORD, type: ROUTE_ACCESS.PROTECTED, title: 'History Record' }],
    [ROUTE.ADD_COACH_IN_YARD, { segment: ROUTE.ADD_COACH_IN_YARD, type: ROUTE_ACCESS.PROTECTED, title: 'Add Coach In Yard' }],
    [ROUTE.REMOVE_COACHES_FROM_YARD, { segment: ROUTE.REMOVE_COACHES_FROM_YARD, type: ROUTE_ACCESS.PROTECTED, title: 'Remove Coaches From Yard' }],
    [ROUTE.ADD_COACH_IN_SHOP, { segment: ROUTE.ADD_COACH_IN_SHOP, type: ROUTE_ACCESS.PROTECTED, title: 'Add Coach In Shop' }],
    [ROUTE.AIR_BRAKE, { segment: ROUTE.AIR_BRAKE, type: ROUTE_ACCESS.PROTECTED, title: 'Air Brake' }],
    [ROUTE.R_LIFTING, { segment: ROUTE.R_LIFTING, type: ROUTE_ACCESS.PROTECTED, title: 'R-Lifting' }],
    [ROUTE.UPHOLSTERY, { segment: ROUTE.UPHOLSTERY, type: ROUTE_ACCESS.PROTECTED, title: 'Upholstery' }],
    [ROUTE.BATTERY_UPHOLSTERY, { segment: ROUTE.BATTERY_UPHOLSTERY, type: ROUTE_ACCESS.PROTECTED, title: 'Battery & Upholstery' }],
    [ROUTE.BIO_TANK, { segment: ROUTE.BIO_TANK, type: ROUTE_ACCESS.PROTECTED, title: 'Bio-tank Update' }],
    [ROUTE.ELECTRIC_NTXR, { segment: ROUTE.ELECTRIC_NTXR, type: ROUTE_ACCESS.PROTECTED, title: 'Electric and NTXR Fit' }],
    [ROUTE.LIFTING_REPORT, { segment: ROUTE.LIFTING_REPORT, type: ROUTE_ACCESS.PROTECTED, title: 'Lifting Report' }],
    [ROUTE.LOGS, { segment: ROUTE.LOGS, type: ROUTE_ACCESS.PROTECTED, title: 'Audit Logs' }],
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
