import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "@/components/overview";
import { FraudDistribution } from "@/components/fraud-distribution";
import { Upload } from "lucide-react";
import { InitialPredictions } from "@/components/initial-predictions";
import Stats from "@/components/stats";
import Link from "next/link";

export const metadata = {
  title: "Fraud Detection Dashboard",
  description: "Monitor and analyze transaction fraud detection",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8">
        <Stats />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>
                Fraud vs. legitimate transactions over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Fraud Distribution</CardTitle>
              <CardDescription>
                Distribution of fraud by transaction amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FraudDistribution />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <InitialPredictions />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:justify-center">
          <Link href="/predict">
            <Button className="w-full md:w-auto">
              Single Transaction Prediction
            </Button>
          </Link>
          <Link href="/batch">
            <Button className="w-full md:w-auto" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Batch Prediction
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
