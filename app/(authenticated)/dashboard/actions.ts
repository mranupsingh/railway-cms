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

export async function getShopStatistics() {
    const coaches = await prisma.coach_master.findMany({
        where: {
            pohby: "PL",
        },
        select: {
            code: true,
            lhbnlhb: true,
            acnac: true,
        },
    })

    const total = coaches.length
    const codeWiseCount: Record<string, number> = {}
    let lhbCount = 0
    let icfCount = 0
    let lhbAcCount = 0
    let lhbNacCount = 0
    let icfAcCount = 0
    let icfNacCount = 0

    coaches.forEach((coach) => {
        // Code wise count
        const code = coach.code || "Unknown"
        codeWiseCount[code] = (codeWiseCount[code] || 0) + 1

        // LHB vs ICF
        const isLhb = coach.lhbnlhb === "Y"
        if (isLhb) {
            lhbCount++
            if (coach.acnac === "AC") {
                lhbAcCount++
            } else {
                lhbNacCount++
            }
        } else {
            icfCount++
            if (coach.acnac === "AC") {
                icfAcCount++
            } else {
                icfNacCount++
            }
        }
    })

    return {
        total,
        codeWiseCount,
        lhbCount,
        icfCount,
        lhbAcCount,
        lhbNacCount,
        icfAcCount,
        icfNacCount,
    }
}
