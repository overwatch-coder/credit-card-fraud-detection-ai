import { DashboardLayout } from "@/components/dashboard-layout"
import { PredictionForm } from "@/components/prediction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Single Transaction Prediction",
  description: "Predict fraud for a single transaction",
}

export default function PredictPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Single Transaction Prediction</CardTitle>
            <CardDescription>Enter transaction details to predict if it's fraudulent</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictionForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
