"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight } from "lucide-react";
import { BatchResults } from "@/components/batch-results";
import { Pagination } from "@/components/pagination";
import { API_URL } from "@/lib/constants";

export function InitialPredictions() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const uploadId = "creditcard_with_predictions";

  useEffect(() => {
    const fetchInitialPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/predict-csv?upload_id=${uploadId}&page=${page}&limit=${limit}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch initial predictions");
        }

        setResults(data);
        setTotalPages(Math.ceil(data.total_rows / limit));
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching initial predictions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPredictions();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const viewAllResults = () => {
    router.push(`/batch/${uploadId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Predictions</CardTitle>
        <CardDescription>
          Showing predictions from the default dataset
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
        <CardFooter className="flex flex-col gap-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <Button onClick={viewAllResults} className="w-full sm:w-auto">
            View All Results
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
