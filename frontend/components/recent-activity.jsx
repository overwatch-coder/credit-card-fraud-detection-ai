"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle } from "lucide-react"

// Sample data - in a real app, this would come from your API
const sampleData = [
  {
    id: "1",
    amount: 120.5,
    time: "2023-05-01T10:30:00Z",
    is_fraud: false,
    probability: 0.03,
  },
  {
    id: "2",
    amount: 1500.0,
    time: "2023-05-01T11:15:00Z",
    is_fraud: true,
    probability: 0.92,
  },
  {
    id: "3",
    amount: 75.25,
    time: "2023-05-01T12:45:00Z",
    is_fraud: false,
    probability: 0.08,
  },
  {
    id: "4",
    amount: 250.0,
    time: "2023-05-01T14:20:00Z",
    is_fraud: false,
    probability: 0.12,
  },
  {
    id: "5",
    amount: 890.75,
    time: "2023-05-01T15:10:00Z",
    is_fraud: true,
    probability: 0.87,
  },
]

export function RecentActivity() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      // In a real app, you would fetch from your API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTransactions(sampleData)
      setLoading(false)
    }

    fetchData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Probability</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">#{transaction.id}</TableCell>
              <TableCell>${transaction.amount.toFixed(2)}</TableCell>
              <TableCell>{formatDate(transaction.time)}</TableCell>
              <TableCell>
                {transaction.is_fraud ? (
                  <Badge variant="destructive" className="flex w-fit items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Fraud
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="flex w-fit items-center gap-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Legitimate
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {transaction.is_fraud
                  ? `${(transaction.probability * 100).toFixed(2)}% Fraud`
                  : `${((1 - transaction.probability) * 100).toFixed(2)}% Safe`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
