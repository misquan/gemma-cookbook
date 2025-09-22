# Run a fine-tuned Gemma 3 270M model in the browser with MediaPipe LLM Inference API

This app demonstrates how to generate emojis from a text input using a fine-tuned Gemma 3 270M model running directly in the browser. 

Fine-tuning allows you to adapt models to specific tasks by training it with your own data.  To use your own fine-tuned model, you'll first need to convert it to the LiteRT (.tflite) format and bundle it in a .task file. You can then replace the demo model by updating the model path in `worker.js`.

## How it works
This demo sets up a simple web server to host a frontend where users can enter a text prompt. This starts a generation process in a web worker to avoid blocking the main UI thread. The worker uses a bundled version of the MediaPipe Tasks GenAI package ([@mediapipe/tasks-genai](https://www.npmjs.com/package/@mediapipe/tasks-genai)) to generate a response from the model and send it back to the user.

## Run the demo

1. Open terminal and clone the repo on your local machine: `git clone https://github.com/google-gemini/gemma-cookbook.git`.
2. Navigate to the app directory: `cd gemma-cookbook/Demos/Emoji-Gemma-on-Web/app-mediapipe`.
3. Run `npx serve` to start the local server.
4. Open the provided `localhost` URL in your browser to run the app.

**To run your own model:**

*  Convert your fine-tuned Gemma 3 270M model to the .tflite format and bundle it in a .task file.
*  Download the app files in this directory and replace the `modelPath` string in the `worker.js` file to point to your model.
*  Open your terminal, navigate (`cd`) to your app's directory, and run steps 3-4 above.
 
## Resources
* [Notebook: Fine-tune Gemma 3 270M IT](/resources/Fine_tune_Gemma_3_270M_for_emoji_generation%20(1).ipynb)
* [Notebook: Convert Gemma 3 270M IT to LiteRT (.tflite) for use with MediaPipe](/resources/Convert_Gemma_models_to_run_on_device_with_MediaPipe_LLM_Inference_API.ipynb)
* [MediaPipe LLM Inference API Web documentation](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)
