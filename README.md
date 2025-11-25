# Remotion Captioning Platform

A full-stack web application that allows users to upload MP4 videos, automatically generate captions using Google Cloud Speech-to-Text, and render those captions onto videos using Remotion. The application supports Hinglish (Hindi + English) with proper font rendering and offers multiple caption styles.

## 🌟 Features

- **Video Upload**: Clean UI for uploading .mp4 video files
- **Auto-Caption Generation**: Uses Google Cloud Speech-to-Text API for accurate transcription
- **Hinglish Support**: Proper rendering of mixed Hindi (Devanagari) and English text using Noto Sans fonts
- **Multiple Caption Styles**:
  - Bottom-centered subtitles (standard)
  - Top-bar captions (news-style)
  - Karaoke-style highlighting (word-by-word)
- **Real-time Preview**: Preview captions on video using Remotion Player
- **Video Export**: Render and download the final captioned video as MP4

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Video Rendering**: Remotion 4.x
- **Speech-to-Text**: Google Cloud Speech-to-Text API
- **Storage**: Google Cloud Storage
- **Audio Processing**: FFmpeg via fluent-ffmpeg
- **Styling**: CSS Modules
- **Fonts**: Noto Sans, Noto Sans Devanagari

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **FFmpeg**: Installed and available in system PATH
- **Google Cloud Platform Account** with:
  - Speech-to-Text API enabled
  - Cloud Storage bucket created
  - Service account with appropriate permissions

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd remotion-caption-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 4. Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Cloud Speech-to-Text API
   - Cloud Storage API
3. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant roles: "Speech-to-Text Admin" and "Storage Object Admin"
   - Create and download a JSON key file
4. Create a Cloud Storage bucket:
   - Go to Cloud Storage
   - Create a new bucket (e.g., "captiongenerator")
   - Set appropriate permissions

5. Place your service account key file as `key.json` in the project root

### 5. Environment Variables

Copy `.env.example` to `.env` and fill in your details:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1. **Upload Video**: Click "Choose Video File" and select an MP4 file
2. **Generate Captions**: Click "Auto-generate Captions" button
   - The app will extract audio from the video
   - Send audio to Google Cloud Speech-to-Text
   - Display generated captions with timestamps
3. **Select Style**: Choose from three caption styles:
   - Bottom Centered: Traditional subtitle style at the bottom
   - Top Bar: News-style captions at the top
   - Karaoke Style: Word-by-word highlighting effect
4. **Preview**: View the video with captions in the Remotion Player
5. **Export**: Click "Export Video" to render the final video with captions
6. **Download**: Download the rendered MP4 file

## 🎨 Caption Styles

### Bottom-Centered
- Traditional subtitle placement at the bottom
- Semi-transparent black background
- White text with proper line spacing
- Best for general content

### Top-Bar
- Full-width bar at the top
- News broadcast style
- Solid dark background
- Ideal for informative content

### Karaoke
- Word-by-word highlighting
- Yellow color for active word
- Center-aligned
- Great for music videos and lyrics

## 🌐 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env`
   - Upload `key.json` as a file or encode it as base64

4. Deploy:
```bash
vercel --prod
```

### Alternative Platforms

**Render:**
- Connect your GitHub repository
- Add environment variables
- Deploy as Web Service

**Netlify:**
- Configure as Next.js site
- Add environment variables
- Deploy via Git

## 📁 Project Structure

```
remotion-caption-app/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── upload.ts        # Video upload & caption generation
│   │   │   └── render.ts        # Video rendering endpoint
│   │   ├── _app.tsx
│   │   └── index.tsx            # Main UI page
│   ├── remotion/
│   │   ├── compositions/
│   │   │   ├── Captions.tsx     # Caption components
│   │   │   └── CaptionedVideo.tsx
│   │   └── index.ts             # Remotion entry point
│   ├── services/
│   │   └── speechToText.ts      # Google Cloud integration
│   └── styles/
│       ├── globals.css
│       └── Home.module.css
├── public/
│   └── uploads/                 # Uploaded videos (gitignored)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🔧 Configuration

### Google Cloud Speech-to-Text Settings

Located in `src/services/speechToText.ts`:

```typescript
const config = {
  encoding: 'MP3',
  sampleRateHertz: 44100,
  languageCode: 'en-US',
  alternativeLanguageCodes: ['hi-IN'], // For Hinglish support
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  model: 'latest_long',
};
```

### Caption Segmentation

Captions are automatically segmented based on:
- Maximum 10 words per caption
- Natural pauses (>1 second gap between words)
- Punctuation boundaries

Modify in `src/services/speechToText.ts` function `transcribeAudio()`.

## 🐛 Troubleshooting

### FFmpeg Not Found
```
Error: ffmpeg not found
```
**Solution**: Install FFmpeg and ensure it's in your system PATH.

### Google Cloud Authentication Error
```
Error: Could not load the default credentials
```
**Solution**: 
- Verify `key.json` exists in project root
- Check `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Ensure service account has proper permissions

### Large Video Upload Fails
**Solution**: Increase body size limit in `next.config.js`:
```javascript
api: {
  bodyParser: {
    sizeLimit: '200mb', // Increase as needed
  },
}
```

### Remotion Rendering Fails
**Solution**:
- Check video file path is correct
- Ensure sufficient disk space
- Verify all Remotion dependencies are installed

## 📝 Speech-to-Text Implementation

The application uses Google Cloud Speech-to-Text API similar to the provided `audio.py` implementation:

1. **Audio Extraction**: Extracts MP3 audio from uploaded video using FFmpeg
2. **Cloud Upload**: Uploads audio to Google Cloud Storage
3. **Transcription**: Uses `long_running_recognize` for longer audio files
4. **Word Timing**: Enables word-level time offsets for karaoke-style captions
5. **Language Support**: Configures both English and Hindi language codes
6. **Segmentation**: Breaks transcription into caption-friendly segments

## 🎯 Requirements Checklist

- ✅ Remotion integration for caption overlay
- ✅ Video upload functionality (.mp4)
- ✅ Auto-generate captions button with STT
- ✅ Hinglish support with Noto Sans fonts
- ✅ 3 caption style presets
- ✅ Real-time preview with Remotion Player
- ✅ Video export as MP4
- ✅ Ready for deployment
- ✅ Comprehensive documentation
- ✅ Google Cloud Speech-to-Text integration

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This application is designed for demonstration purposes. For production use, implement proper error handling, rate limiting, authentication, and video size restrictions.
