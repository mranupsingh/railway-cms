"use client"

import { motion } from "framer-motion"
import {
  History,
  Loader2,
  TrainFront,
  TrendingDown,
  TrendingUp
} from "lucide-react"
import { useState } from "react"

import {
  getDetailedStatistics,
} from "@/app/(authenticated)/dashboard/actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface SectionCardsProps {
  stats: {
    parelCoaches: number
    yardCoaches: number
    totalMasterCoaches: number
    totalHistoryCoaches: number
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  // Dialog states
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shopStats, setShopStats] = useState<any>(null)
  const [selectedCard, setSelectedCard] = useState<"PL" | "YD" | "MASTER" | "HISTORY" | null>(null)

  const fetchDetailedStats = async (type: "PL" | "YD" | "MASTER" | "HISTORY") => {
    setLoading(true)
    try {
      const data = await getDetailedStatistics(type)
      setShopStats(data)
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (type: "PL" | "YD" | "MASTER" | "HISTORY") => {
    setSelectedCard(type)
    setOpen(true)
    fetchDetailedStats(type)
  }

  const getDialogTitle = () => {
    switch (selectedCard) {
      case "PL":
        return "Coaches in Parel - Statistics"
      case "YD":
        return "Coaches in Yard - Statistics"
      case "MASTER":
        return "Total Master Coaches - Statistics"
      case "HISTORY":
        return "Total History Coaches - Statistics"
      default:
        return "Statistics"
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Parel Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card
            className="group relative overflow-hidden transition-colors hover:border-primary/50 cursor-pointer"
            onClick={() => handleCardClick("PL")}
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
            <CardHeader className="relative pb-2">
              <CardDescription>Coaches in Parel</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stats.parelCoaches.toLocaleString()}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <TrendingUp className="size-3" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
              <div className="text-muted-foreground text-xs">
                Coaches currently in Parel
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Yard Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card
            className="group relative overflow-hidden transition-colors hover:border-blue-500/50 cursor-pointer"
            onClick={() => handleCardClick("YD")}
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150" />
            <CardHeader className="relative pb-2">
              <CardDescription>Coaches in Yard</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stats.yardCoaches.toLocaleString()}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <TrendingDown className="size-3" />
                  Yard
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
              <div className="text-muted-foreground text-xs">
                Coaches currently in Yard
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Master Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card
            className="group relative overflow-hidden transition-colors hover:border-purple-500/50 cursor-pointer"
            onClick={() => handleCardClick("MASTER")}
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-purple-500/10 transition-transform group-hover:scale-150" />
            <CardHeader className="relative pb-2">
              <CardDescription>Total Master Coaches</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stats.totalMasterCoaches.toLocaleString()}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                  <TrendingUp className="size-3" />
                  Total
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
              <div className="text-muted-foreground text-xs">
                Total coaches in master record
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* History Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card
            className="group relative overflow-hidden transition-colors hover:border-amber-500/50 cursor-pointer"
            onClick={() => handleCardClick("HISTORY")}
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-amber-500/10 transition-transform group-hover:scale-150" />
            <CardHeader className="relative pb-2">
              <CardDescription>History Coaches Count</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stats.totalHistoryCoaches.toLocaleString()}
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <History className="size-3 mr-1" />
                  History
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm pt-0">
              <div className="text-muted-foreground text-xs">
                Total coaches in history
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shopStats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden border-none shadow-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-in fade-in zoom-in-95 duration-500">
                  <div className="absolute -right-4 -top-4 opacity-20">
                    <TrainFront className="h-32 w-32 rotate-12 text-primary" />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Coaches</p>
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-4xl font-bold">{shopStats.total}</h3>
                        <span className="text-sm text-muted-foreground">coaches</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-none bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent animate-in fade-in zoom-in-95 duration-500 delay-100">
                  <div className="absolute -right-4 -top-4 opacity-40">
                    <TrainFront className="h-32 w-32 rotate-12 text-blue-500/50" />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">LHB Coaches</p>
                        <h3 className="text-3xl font-bold">{shopStats.lhbCount}</h3>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round((shopStats.lhbCount / shopStats.total) * 100) || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary">
                          <div
                            className="h-1.5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${(shopStats.lhbCount / shopStats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-none bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent animate-in fade-in zoom-in-95 duration-500 delay-200">
                  <div className="absolute -right-4 -top-4 opacity-40">
                    <TrainFront className="h-32 w-32 rotate-12 text-amber-500/50" />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">ICF Coaches</p>
                        <h3 className="text-3xl font-bold">{shopStats.icfCount}</h3>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round((shopStats.icfCount / shopStats.total) * 100) || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary">
                          <div
                            className="h-1.5 rounded-full bg-amber-500 transition-all"
                            style={{ width: `${(shopStats.icfCount / shopStats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Detailed Breakdown Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium leading-none">Type Breakdown</h3>
                  <div className="rounded-md border overflow-x-auto overflow-y-hidden">
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
                        <TableRow className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-100">
                          <TableCell className="font-medium">LHB</TableCell>
                          <TableCell className="text-right">{shopStats.lhbAcCount}</TableCell>
                          <TableCell className="text-right">{shopStats.lhbNacCount}</TableCell>
                          <TableCell className="text-right font-bold">{shopStats.lhbCount}</TableCell>
                        </TableRow>
                        <TableRow className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-200">
                          <TableCell className="font-medium">ICF</TableCell>
                          <TableCell className="text-right">{shopStats.icfAcCount}</TableCell>
                          <TableCell className="text-right">{shopStats.icfNacCount}</TableCell>
                          <TableCell className="text-right font-bold">{shopStats.icfCount}</TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both delay-300">
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

                {/* Shop Holdings Table - Only visible for Parel */}
                {selectedCard === "PL" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium leading-none">Shop Holdings</h3>
                    <div className="rounded-md border overflow-x-auto overflow-y-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Shop Name</TableHead>
                            <TableHead className="text-right">LHB AC</TableHead>
                            <TableHead className="text-right">LHB NAC</TableHead>
                            <TableHead className="text-right">ICF AC</TableHead>
                            <TableHead className="text-right">ICF NAC</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(shopStats.shopWiseCount || {}).map(([shopName, stats]: [string, any], index) => (
                            <TableRow
                              key={shopName}
                              className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                              style={{ animationDelay: `${index * 100 + 100}ms` }}
                            >
                              <TableCell className="font-medium">{shopName}</TableCell>
                              <TableCell className="text-right">{stats.lhbAc}</TableCell>
                              <TableCell className="text-right">{stats.lhbNac}</TableCell>
                              <TableCell className="text-right">{stats.icfAc}</TableCell>
                              <TableCell className="text-right">{stats.icfNac}</TableCell>
                              <TableCell className="text-right font-bold">{stats.total}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
