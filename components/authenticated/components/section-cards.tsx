"use client"

import { TrendingDownIcon, TrendingUpIcon, Loader2, TrainFront, Armchair, Users } from "lucide-react"
import { useState, useEffect } from "react"

import { getShopStatistics } from "@/app/(authenticated)/dashboard/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

export interface SectionCardsProps {
  stats: {
    parelCoaches: number
    yardCoaches: number
    totalMasterCoaches: number
    totalHistoryCoaches: number
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  const [showParelStats, setShowParelStats] = useState(false)
  const [shopStats, setShopStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (showParelStats && !shopStats) {
      setLoading(true)
      getShopStatistics()
        .then(setShopStats)
        .finally(() => setLoading(false))
    }
  }, [showParelStats, shopStats])

  return (
    <>
      <Dialog open={showParelStats} onOpenChange={setShowParelStats}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Coaches in Parel - Statistics</DialogTitle>
            <DialogDescription>
              Detailed breakdown of coaches currently in Parel shop (POHBY = PL)
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shopStats ? (
            <div className="space-y-6 py-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total in Shop</CardTitle>
                    <TrainFront className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{shopStats.total}</div>
                    <p className="text-xs text-muted-foreground">Coaches</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">LHB Coaches</CardTitle>
                    <TrainFront className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{shopStats.lhbCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {((shopStats.lhbCount / shopStats.total) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ICF Coaches</CardTitle>
                    <TrainFront className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{shopStats.icfCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {((shopStats.icfCount / shopStats.total) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Detailed Breakdown Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Type Breakdown</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">AC</TableHead>
                          <TableHead className="text-right">Non-AC</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">LHB</TableCell>
                          <TableCell className="text-right">{shopStats.lhbAcCount}</TableCell>
                          <TableCell className="text-right">{shopStats.lhbNacCount}</TableCell>
                          <TableCell className="text-right font-bold">{shopStats.lhbCount}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ICF</TableCell>
                          <TableCell className="text-right">{shopStats.icfAcCount}</TableCell>
                          <TableCell className="text-right">{shopStats.icfNacCount}</TableCell>
                          <TableCell className="text-right font-bold">{shopStats.icfCount}</TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="text-right font-bold">
                            {shopStats.lhbAcCount + shopStats.icfAcCount}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {shopStats.lhbNacCount + shopStats.icfNacCount}
                          </TableCell>
                          <TableCell className="text-right font-bold">{shopStats.total}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Code-wise Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Code-wise Distribution</h3>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(shopStats.codeWiseCount)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .map(([code, count]: [string, any]) => (
                          <div
                            key={code}
                            className="flex items-center space-x-2 rounded-full border px-3 py-1 text-sm"
                          >
                            <span className="font-medium">{code}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        <Card
          className="@container/card cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md"
          onClick={() => setShowParelStats(true)}
        >
          <CardHeader className="relative">
            <CardDescription>Coaches in Parel</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.parelCoaches.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              POHBY - PL <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Coaches currently in Parel
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Coaches in Yard</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.yardCoaches.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingDownIcon className="size-3" />
                Yard
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              POHBY - YD <TrendingDownIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Coaches currently in Yard
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>Total Master Coaches</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.totalMasterCoaches.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                Total
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              All Coaches <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">Total coaches in master record</div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader className="relative">
            <CardDescription>History Coaches Count</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.totalHistoryCoaches.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                History
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Archived Data <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">Total coaches in history</div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
