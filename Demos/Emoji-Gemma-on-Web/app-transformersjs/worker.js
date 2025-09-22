import {
  env,
  pipeline,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.6.3";

// Skip checking for local models
env.allowLocalModels = false;

// Hold reference to text-generation pipeline
let pipe;

// Listen for messages from the main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;
  switch (type) {
    case "load":
      let progressInterval;
      try {
        console.log("[Worker] Loading model...");
        
        // Check for WebGPU support, display message if not available 
        const hasWebGPU = !!navigator.gpu;
        if (!hasWebGPU) {
          self.postMessage({ 
            type: "status_update", 
            data: "WebGPU is not available for this browser or device. Using slower CPU (WASM) fallback" 
          });
        }

        // Set up pipeline options for WebGPU and WASM (CPU) fallback
        const pipelineOptions = {
          dtype: "q4",
          device: hasWebGPU ? "webgpu" : "wasm", // Use WebGPU if available, else fallback to WASM (CPU)
          progress_callback: (progress) => {
            if (progress.status === "progress" && progress.file?.endsWith?.("onnx_data")) {
              clearInterval(progressInterval);
              const reportedProgress = Math.floor(Math.min(progress.progress, 99));
              self.postMessage({ type: "progress", data: { progress: reportedProgress } });
            }
          },
        };  

        let fakeProgress = 0;
        progressInterval = setInterval(() => {
          fakeProgress += 1;
          if (fakeProgress <= 90) {
            self.postMessage({ type: "progress", data: { progress: fakeProgress } });
          } else {
            clearInterval(progressInterval);
          }
        }, 50);

        pipe = await pipeline(
          "text-generation", 
          "kr15t3n/my-emojigemma-onnx", 
          pipelineOptions
        );
        
        clearInterval(progressInterval);
        console.log("[Worker] Model loaded successfully.");
        self.postMessage({ type: "loaded" });
      } catch (error) {
        clearInterval(progressInterval);
        console.error("[Worker] Model loading failed:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;

    case "generate":
      try {
        const messages = [
          { "role": "system", "content": "Translate this text to emoji: " },
          { "role": "user", "content": data.prompt },
        ];
        const generatedResponses = new Set();
        
        for (let i = 0; i < 3; i++) {
          const results = await pipe(messages, { 
              max_new_tokens: 8, 
              do_sample: true, 
              temperature: 0.1, 
              top_p: 0.9, 
              num_return_sequences: 1, 
              repetition_penalty: 1.2,
              return_full_text: false 
          });
          
          let rawResponse = results[0].generated_text;
          console.log(`[Worker] Raw model output (Attempt ${i + 1}):`, rawResponse);
          
          let assistantResponse = '';

          if (Array.isArray(rawResponse)) {
              const lastMessage = rawResponse[rawResponse.length - 1];
              if (lastMessage && lastMessage.role === 'assistant' && typeof lastMessage.content === 'string') {
                  assistantResponse = lastMessage.content;
              }
          } else if (typeof rawResponse === 'string') {
              assistantResponse = rawResponse;
          }

          if (assistantResponse) {
              const cleanResponse = assistantResponse.replace(/[^\p{Emoji}\s]/gu, '').trim();
              // Check if the response is new and valid
              if (cleanResponse && !generatedResponses.has(cleanResponse)) {
                  generatedResponses.add(cleanResponse);
                  // Send the result immediately
                  self.postMessage({ type: "result", data: cleanResponse });
              }
          }
        }
        
        console.log("[Worker] Generation complete.");
        self.postMessage({ type: "complete" });
      } catch (error) {
        console.error("[Worker] Generation failed:", error);
        self.postMessage({ type: "error", data: error.message });
      }
      break;
  }
};