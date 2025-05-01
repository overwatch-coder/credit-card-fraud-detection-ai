import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export function BatchResults({ results }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {results.predictions.length} of {results.total_rows} transactions
        </div>
        <div className="text-sm">
          Page {results.page} of {Math.ceil(results.total_rows / results.limit)}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Index</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Fraud Probability</TableHead>
              <TableHead className="text-right">Legitimate Probability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.predictions.map((prediction) => (
              <TableRow key={prediction.index}>
                <TableCell className="font-medium">{prediction.index}</TableCell>
                <TableCell>
                  {prediction.is_fraud ? (
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
                <TableCell className="text-right">{(prediction.probabilities.fraud * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">{(prediction.probabilities.non_fraud * 100).toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
