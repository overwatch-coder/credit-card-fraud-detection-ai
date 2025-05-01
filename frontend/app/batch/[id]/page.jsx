"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { BatchResults } from "@/components/batch-results";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { API_URL } from "@/lib/constants";

export default function BatchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadId = params.id;
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/predict-csv?upload_id=${uploadId}&page=${page}&limit=${limit}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch results");
        }

        setResults(data);
        setTotalPages(Math.ceil(data.total_rows / limit));
      } catch (err) {
        setError(err.message || "An error occurred while fetching results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [uploadId, page, limit]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this upload?")) return;

    try {
      const response = await fetch(
        `${API_URL}/delete-upload?upload_id=${uploadId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete upload");
      }

      router.push("/batch");
    } catch (err) {
      setError(err.message || "An error occurred while deleting the upload");
    }
  };

  const handlePageChange = (newPage) => {
    router.push(`/batch/${uploadId}?page=${newPage}&limit=${limit}`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/batch")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Uploads
          </Button>
          {uploadId !== "creditcard_with_predictions" && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Upload
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Batch Prediction Results</CardTitle>
            <CardDescription>
              {uploadId === "8b0d6a0f-cb3f-4361-af60-5bb5ddfe52c1"
                ? "Viewing results from the default credit card dataset"
                : `Viewing results for upload ID: ${uploadId}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <BatchResults results={results} />
            )}
          </CardContent>
          {!loading && !error && results && (
            <CardFooter className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
