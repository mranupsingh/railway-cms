"use server"

import prisma from "@/lib/db/prisma"

export async function getDashboardStats() {
    const [parelCoaches, yardCoaches, totalMasterCoaches, totalHistoryCoaches] = await Promise.all([
        prisma.coach_master.count({
            where: {
                pohby: "PL",
            },
        }),
        prisma.coach_master.count({
            where: {
                pohby: "YD",
            },
        }),
        prisma.coach_master.count(),
        prisma.history.count(),
    ])

    return {
        parelCoaches,
        yardCoaches,
        totalMasterCoaches,
        totalHistoryCoaches,
    }
}

export async function getDashboardChartData() {
    // Fetching coaches commissioned over the last 3 months for the chart
    // Grouping by date (comdt)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const rawData = await prisma.coach_master.findMany({
        where: {
            comdt: {
                gte: threeMonthsAgo,
            },
        },
        select: {
            comdt: true,
        },
        orderBy: {
            comdt: "asc",
        },
    })

    // Process data to group by date and count
    const groupedData: Record<string, number> = {}

    rawData.forEach((item: { comdt: Date | null }) => {
        if (item.comdt) {
            const dateStr = item.comdt.toISOString().split('T')[0]
            groupedData[dateStr] = (groupedData[dateStr] || 0) + 1
        }
    })

    const chartData = Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
    }))

    return chartData
}

export async function getCoaches({
    page = 1,
    pageSize = 10,
    search = "",
    type = "PL", // PL or YD
    filters = [],
}: {
    page?: number
    pageSize?: number
    search?: string
    type?: "PL" | "YD"
    filters?: any[]
}) {
    const skip = (page - 1) * pageSize

    const where: any = {
        pohby: type,
    }

    if (search) {
        where.coachno = {
            contains: search,
            mode: "insensitive",
        }
    }

    // Apply advanced filters
    if (filters && filters.length > 0) {
        filters.forEach((filter) => {
            if (filter.operator === "equals") {
                where[filter.column] = { equals: filter.value, mode: "insensitive" }
            } else if (filter.operator === "contains") {
                where[filter.column] = { contains: filter.value, mode: "insensitive" }
            } else if (filter.operator === "gt") {
                where[filter.column] = { gt: Number(filter.value) }
            } else if (filter.operator === "lt") {
                where[filter.column] = { lt: Number(filter.value) }
            } else if (filter.operator === "gte") {
                where[filter.column] = { gte: Number(filter.value) }
            } else if (filter.operator === "lte") {
                where[filter.column] = { lte: Number(filter.value) }
            }
        })
    }

    const [data, total] = await Promise.all([
        prisma.coach_master.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                coachno: "asc",
            },
        }),
        prisma.coach_master.count({
            where,
        }),
    ])

    return {
        success: true,
        data,
        metadata: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    }
}

export async function getDetailedStatistics(type: "PL" | "YD" | "MASTER" | "HISTORY") {
    let coaches: any[] = []

    if (type === "HISTORY") {
        const historyCoaches = await prisma.history.findMany({
            distinct: ['COACHNO'], // Count only distinct coaches
            select: {
                LHBNLHB: true,
                ACNAC: true,
            },
        })
        // Map uppercase fields to standard structure
        coaches = historyCoaches.map(c => ({
            lhbnlhb: c.LHBNLHB,
            acnac: c.ACNAC,
            shop: null
        }))
    } else {
        const where: any = {}
        if (type === "PL") {
            where.pohby = "PL"
        } else if (type === "YD") {
            where.pohby = "YD"
        }
        // MASTER has no filter (get all)

        coaches = await prisma.coach_master.findMany({
            where,
            select: {
                lhbnlhb: true,
                acnac: true,
                shop: true, // Only relevant for PL, but included for type consistency
            },
        })
    }

    const total = coaches.length

    // Initialize shop wise counts (Only populated for PL)
    const shopMap: Record<string, string> = {
        "1": "CR-1",
        "2": "CR-2",
        "ACC1": "ACC-1",
        "ACC2": "ACC-2"
    }

    const shopWiseCount: Record<string, {
        lhbAc: number,
        lhbNac: number,
        icfAc: number,
        icfNac: number,
        total: number
    }> = {
        "CR-1": { lhbAc: 0, lhbNac: 0, icfAc: 0, icfNac: 0, total: 0 },
        "CR-2": { lhbAc: 0, lhbNac: 0, icfAc: 0, icfNac: 0, total: 0 },
        "ACC-1": { lhbAc: 0, lhbNac: 0, icfAc: 0, icfNac: 0, total: 0 },
        "ACC-2": { lhbAc: 0, lhbNac: 0, icfAc: 0, icfNac: 0, total: 0 },
    }

    let lhbCount = 0
    let icfCount = 0
    let lhbAcCount = 0
    let lhbNacCount = 0
    let icfAcCount = 0
    let icfNacCount = 0

    coaches.forEach((coach) => {
        // Determine Shop Name using map or fallback to "Other"
        // Only calculate shop sats for PL type
        let shopName = "Other"
        if (type === "PL" && coach.shop && shopMap[coach.shop]) {
            shopName = shopMap[coach.shop]
        }

        // Initialize dynamic shop entry if needed (though we predefined the main ones)
        if (type === "PL" && !shopWiseCount[shopName] && shopName !== "Other") {
            shopWiseCount[shopName] = { lhbAc: 0, lhbNac: 0, icfAc: 0, icfNac: 0, total: 0 }
        }

        // LHB vs ICF
        const isLhb = coach.lhbnlhb === "Y"
        if (isLhb) {
            lhbCount++
            if (coach.acnac === "AC") {
                lhbAcCount++
                if (type === "PL" && shopName !== "Other") shopWiseCount[shopName].lhbAc++
            } else {
                lhbNacCount++
                if (type === "PL" && shopName !== "Other") shopWiseCount[shopName].lhbNac++
            }
        } else {
            icfCount++
            if (coach.acnac === "AC") {
                icfAcCount++
                if (type === "PL" && shopName !== "Other") shopWiseCount[shopName].icfAc++
            } else {
                icfNacCount++
                if (type === "PL" && shopName !== "Other") shopWiseCount[shopName].icfNac++
            }
        }

        if (type === "PL" && shopName !== "Other") shopWiseCount[shopName].total++
    })

    return {
        total,
        shopWiseCount,
        lhbCount,
        icfCount,
        lhbAcCount,
        lhbNacCount,
        icfAcCount,
        icfNacCount,
    }
}
