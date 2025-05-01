import { DashboardLayout } from "@/components/dashboard-layout"
import { BatchUpload } from "@/components/batch-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Batch Prediction",
  description: "Upload CSV file for batch fraud prediction",
}

export default function BatchPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Batch Prediction</CardTitle>
            <CardDescription>Upload a CSV file to predict fraud for multiple transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <BatchUpload />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
