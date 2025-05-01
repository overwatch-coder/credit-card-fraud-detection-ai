"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { PredictionResult } from "@/components/prediction-result";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/constants";

// Define the schema for the single textarea input
const formSchema = z.object({
  featuresText: z.string().min(1, "Please paste the feature values"),
});

// Define the expected feature order
const expectedFeatures = [
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
  "V18",
  "V19",
  "V20",
  "V21",
  "V22",
  "V23",
  "V24",
  "V25",
  "V26",
  "V27",
  "V28",
  "Amount",
  "V1_V2_Interaction",
  "V3_Amount_Ratio",
  "Hour",
];

export function PredictionForm() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      featuresText: "",
    },
  });

  async function onSubmit(values) {
    setLoading(true);
    setError(null);

    try {
      // Parse the comma-separated values from the textarea
      const featureValues = values.featuresText
        .split(",")
        .map((value) => parseFloat(value.trim()));

      // Validate the number of features
      if (featureValues.length !== expectedFeatures.length) {
        throw new Error(
          `Expected ${expectedFeatures.length} values, but received ${featureValues.length}. Please check your input.`
        );
      }

      // Construct the features array in the correct order
      // The values are already expected to be in the correct order based on the textarea input
      const features = featureValues;

      // Extract the amount for the API call (assuming 'Amount' is the 30th value, index 29)
      const amount = features[expectedFeatures.indexOf("Amount")];

      if (isNaN(amount)) {
        throw new Error("Could not parse the 'Amount' value.");
      }

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features, amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get prediction");
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message || "An error occurred while getting prediction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="featuresText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feature Values (Comma-Separated)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Paste your feature values here, comma-separated. Ensure the order is: ${expectedFeatures.join(
                      ", "
                    )}`}
                    rows={10} // Adjust rows as needed
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Paste the comma-separated values for all features in the
                  specified order: {expectedFeatures.join(", ")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Predict
          </Button>
        </form>
      </Form>

      {(result || error) && <PredictionResult result={result} error={error} />}
    </div>
  );
}
