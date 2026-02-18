# Last Minute Learner - Server

This repository contains the backend server for the Last Minute Learner application. This Express.js server provides an API for generating study reviewers using AI capabilities.

## Features

- **AI-Powered Reviewer Generation**: Utilizes Anthropic's Claude Sonnet 4 model through AI Gateway to generate comprehensive study reviewers.
- **Multiple File Format Support**: Accepts PDF, DOCX, and PPTX files as input, extracts text, and uses it for reviewer generation.
- **Prompt-Based Generation**: Allows users to provide text prompts directly for generating study material.
- **Schema Validation**: Employs Zod for robust input validation and ensuring structured output from the AI model.
- **CORS Enabled**: Configured for cross-origin resource sharing to allow secure communication with the frontend.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **AI SDK**: Vercel AI SDK for unified AI model interactions with gateway support.
- **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.
- **PDF-Parse**: A library to extract text from PDF files.
- **officeparser**: Library for extracting text from DOCX and PPTX files.
- **Zod**: TypeScript-first schema declaration and validation library.
- **CORS**: Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options. Configured to allow requests from `http://localhost:3000` and `https://last-minute-learner.vercel.app`.
- **Dotenv**: Zero-dependency module that loads environment variables from a `.env` file.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/last-minute-learner.git
    cd last-minute-learner/last-minute-learner-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

### Environment Variables

Create a `.env` file in the `last-minute-learner-server` directory with the following content:

```
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY
PORT=5000 # Optional, defaults to 5000
```

Replace `YOUR_ANTHROPIC_API_KEY` with your actual Anthropic API key. The server uses AI Gateway to connect to Claude Sonnet 4.

### Running the Server

To start the server, run:

```bash
npm start
```
The server will start on the port specified in your `.env` file (default: `5000`).

## API Endpoints

### `POST /api/generate-reviewer`

Generates a study reviewer based on a provided prompt and/or a file upload.

-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`

#### Request Body

-   `prompt` (optional): A string containing the text prompt for the AI model.
-   `file` (optional): A PDF, DOCX, or PPTX file to be processed.

**Note**: At least one of `prompt` or `file` must be provided.

#### Example Request (with `prompt` only)

```bash
curl -X POST http://localhost:5000/api/generate-reviewer \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Explain the concepts of photosynthesis."}'
```

#### Example Request (with `file` only)

```bash
curl -X POST http://localhost:5000/api/generate-reviewer \
     -F "file=@/path/to/your/document.pdf"
```

Supported file formats: PDF (.pdf), Word (.docx), PowerPoint (.pptx)

#### Example Request (with both `prompt` and `file`)

```bash
curl -X POST http://localhost:5000/api/generate-reviewer \
     -F "prompt=Summarize the key points in this document and provide essential facts." \
     -F "file=@/path/to/your/document.pdf"
```

#### Response (JSON)

```json
{
  "title": "Photosynthesis: Light-Dependent and Light-Independent Reactions",
  "description": "A review of photosynthesis, covering its two main stages: light-dependent reactions and the Calvin cycle, and their significance.",
  "field": "Biology",
  "detailedReviewer": "## Photosynthesis Overview\nPhotosynthesis is the process...",
  "terminologies": [
    { "term": "Photosynthesis", "definition": "Process by which green plants..." },
    { "term": "Chlorophyll", "definition": "Green pigment..." }
  ],
  "essentialFacts": [
    "Photosynthesis occurs in chloroplasts.",
    "Light is absorbed by chlorophyll."
  ]
}
```

### `GET /api/custom`

A simple test endpoint.

-   **Method**: `GET`

#### Response (JSON)

```json
{
  "message": "Hello from Express API"
}
```

## Contributing

Feel free to open issues or submit pull requests.

## License

ISC License
