# Run a fine-tuned Gemma 3 270M model in the browser with Transformers.js

This app demonstrates how to generate emojis from a text input using a fine-tuned Gemma 3 270M model running directly in the browser. 

Fine-tuning allows you to adapt models to specific tasks by training it with your own data.  To use your own fine-tuned model, you'll first need to convert it to the .onnx format. You can then replace the demo model by updating the model path in `worker.js`.

## How it works
This demo sets up a simple web server to host a frontend where users can enter a text prompt. This starts a generation process in a web worker to avoid blocking the main UI thread. The worker uses [Transformers.js](https://huggingface.co/docs/transformers.js/index) to generate a response from the model and send it back to the user.

## Run the demo

1. Open terminal and clone the repo on your local machine: `git clone https://github.com/google-gemini/gemma-cookbook.git`.
2. Navigate to the app directory: `cd gemma-cookbook/Demos/Emoji-Gemma-on-Web/app-transformersjs`.
3. Run `npx serve` to start the local server.
4. Open the provided `localhost` URL in your browser to run the app.

**To run your own model:**

*  Convert your fine-tuned Gemma 3 270M model to the .onnx format.
*  Download the app files in this directory and replace the model string in the `pipeline()` function call in `worker.js` to point to your model on Hugging Face Hub.
    *  Alternatively, include the model files in a new subdirectory i.e. `./myemoji-gemma-3-270m-it-onnx/` for full offline use.
*  Open your terminal, navigate (cd) to your app's directory, and run steps 3-4 above.
 
## Resources
* [Notebook: Fine-tune Gemma 3 270M](https://github.com/google-gemini/gemma-cookbook/blob/main/Demos/Emoji-Gemma-on-Web/resources/Fine_tune_Gemma_3_270M_for_emoji_generation.ipynb)
* [Notebook: Convert Gemma 3 270M to ONNX](https://github.com/google-gemini/gemma-cookbook/blob/main/Demos/Emoji-Gemma-on-Web/resources/Convert_Gemma_3_270M_to_ONNX.ipynb)
* [Hugging Face Transformers.js documentation](https://huggingface.co/docs/transformers.js/index)
