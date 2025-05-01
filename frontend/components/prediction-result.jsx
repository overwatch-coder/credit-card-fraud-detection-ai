import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export function PredictionResult({ result, error }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!result) return null

  const fraudProbability = result.probabilities.fraud * 100
  const nonFraudProbability = result.probabilities.non_fraud * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {result.is_fraud ? (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">Fraudulent Transaction</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500">Legitimate Transaction</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fraud Probability</span>
              <span className="text-sm font-medium">{fraudProbability.toFixed(2)}%</span>
            </div>
            <Progress value={fraudProbability} className="h-2 bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Legitimate Probability</span>
              <span className="text-sm font-medium">{nonFraudProbability.toFixed(2)}%</span>
            </div>
            <Progress value={nonFraudProbability} className="h-2 bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
