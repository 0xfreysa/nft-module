interface ReplicateInput {
  aspect_ratio: string;
  extra_lora_scale: number;
  go_fast: boolean;
  guidance_scale: number;
  lora_scale: number;
  megapixels: string;
  model: string;
  num_inference_steps: number;
  num_outputs: number;
  output_format: string;
  output_quality: number;
  prompt: string;
  prompt_strength: number;
  replicate_weights?: string;
}

interface ReplicateUrls {
  cancel: string;
  get: string;
  stream: string;
}

interface ReplicateResponse {
  id: string;
  model: string;
  version: string;
  input: ReplicateInput;
  logs: string;
  output: string[];
  data_removed: boolean;
  error: string | null;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  created_at: string;
  urls: ReplicateUrls;
}

export const replicateRunAPI = async ({
  prompt,
  numOutputs,
}: {
  prompt: string;
  numOutputs: number;
}) => {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      version:
        "728c47d1aaa9bca3fa37888ef1fc36bc4ab7306579dd2321afcb99e530a17a33",
      input: {
        prompt: prompt,
        model: "dev",
        go_fast: false,
        lora_scale: 0.82,
        megapixels: "1",
        num_outputs: numOutputs,
        aspect_ratio: "1:1",
        output_format: "webp",
        guidance_scale: 2.5,
        output_quality: 80,
        prompt_strength: 0.8,
        extra_lora_scale: 1,
        num_inference_steps: 28,
      },
    }),
  });

  const data = (await response.json()) as ReplicateResponse;
  return data.output ?? null;
};

export const replicateRunWithRetry = async ({
  prompt,
  numOutputs,
  maxRetries = 5,
}: {
  prompt: string;
  numOutputs: number;
  maxRetries?: number;
}) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const output = await replicateRunAPI({
        prompt: prompt,
        numOutputs: numOutputs,
      });
      if (output) {
        return output;
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // Re-throw on final attempt
      }
      console.error(`Attempt ${i + 1} failed, retrying...`, error);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return [];
};
