
# TalkGPT

This project is a React application that integrates with OpenAI’s API to chat and improve your English communication skills.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **OpenAI API Key**: You’ll need an API key from OpenAI to use their API.

## Installation

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/matiasfdevecchi/TalkGPT
cd TalkGPT
```

### 2. Install Dependencies

Install the project dependencies by running:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add your OpenAI API key:

```plaintext
VITE_OPENAI_API_KEY=your_openai_api_key
```

Replace `your_openai_api_key` with your actual OpenAI API key.

### 4. Configuration Variables

In `src/App.tsx`, there are three configuration variables that affect audio processing:

- `silenceThreshold`: Sets the threshold to detect silence in the audio input. Default is `0.01`.
- `silenceDuration`: Specifies the duration (in milliseconds) to wait when silence is detected. Default is `1500`.
- `silenceAfterAudio`: Determines the time (in milliseconds) to pause after playing the audio response and before recording again. Default is `300`.

You can adjust these values directly in `src/App.tsx` as needed:

```typescript
// src/App.tsx
const silenceThreshold = 0.01;
const silenceDuration = 1500;
const silenceAfterAudio = 300;
```

### 5. Run the Project

Start the development server by running:

```bash
npm run dev
```

---

Enjoy using the application to improve your English communication skills!
