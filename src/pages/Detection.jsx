import AudioWaveform from "../components/AudioWaveforms";
import {
  ArrowLeft,
  AudioLines,
  Check,
  FileAudio,
  Info,
  Mic,
  RotateCcw,
  Upload,
  Waves,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Detection() {
  const [mode, setMode] = useState("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneStream, setMicrophoneStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  /* -----------------------------
     Recording timer
  ------------------------------ */

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((previous) => previous + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [isRecording]);

  /* -----------------------------
     Format recording time
  ------------------------------ */

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* -----------------------------
     Start recording
  ------------------------------ */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      setMicrophoneStream(stream);

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        setAudioUrl(url);
        setAudioFile(
          new File([blob], "neurovoice-recording.webm", {
            type: "audio/webm",
          })
        );

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      setRecordingTime(0);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);

      alert(
        "Microphone access was denied. Please allow microphone permission and try again."
      );
    }
  };

  /* -----------------------------
     Stop recording
  ------------------------------ */

  const stopRecording = () => {
  if (
    mediaRecorderRef.current &&
    mediaRecorderRef.current.state !== "inactive"
  ) {
    mediaRecorderRef.current.stop();
  }

  clearInterval(timerRef.current);

  setIsRecording(false);

  if (microphoneStream) {
    microphoneStream
      .getTracks()
      .forEach((track) => track.stop());

    setMicrophoneStream(null);
  }
};

  /* -----------------------------
     Handle uploaded file
  ------------------------------ */

  const handleFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      "audio/wav",
      "audio/x-wav",
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/x-m4a",
      "audio/webm",
    ];

    const isAudio =
      file.type.startsWith("audio/") ||
      allowedTypes.includes(file.type);

    if (!isAudio) {
      alert("Please select an audio file.");
      return;
    }

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setMode("upload");
  };

  /* -----------------------------
     File input
  ------------------------------ */

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);
  };

  /* -----------------------------
     Drag & drop
  ------------------------------ */

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  /* -----------------------------
     Reset
  ------------------------------ */

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioFile(null);
    setRecordingTime(0);
  };

  /* -----------------------------
     Analyze
  ------------------------------ */

  const handleAnalyze = () => {
    if (!audioFile) {
      alert("Please record or upload a voice sample first.");
      return;
    }

    /*
      Backend integration will be added here.

      Example later:

      const formData = new FormData();
      formData.append("file", audioFile);

      fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
    */

    alert(
      "Voice sample ready. ML backend integration will be connected next."
    );
  };

  return (
    <main className="min-h-screen bg-[#07111f] pt-20">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-32 h-112.5 w-112.5 -translate-x-1/2 rounded-full bg-cyan-400/5 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12 lg:px-8">

        {/* Back */}
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Heading */}
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <AudioLines className="h-7 w-7 text-cyan-400" />
          </div>

          <p className="mt-6 text-sm font-bold tracking-[0.2em] text-cyan-400 uppercase">
            Voice Analysis
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Analyze your voice
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Record a sustained vowel sound or upload an existing voice
            recording for analysis.
          </p>

        </div>

        {/* Main card */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/2.5 p-5 shadow-2xl sm:p-8">

          {/* Mode selector */}
          <div className="mx-auto flex max-w-md rounded-xl border border-white/10 bg-black/20 p-1">

            <button
              onClick={() => setMode("record")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                mode === "record"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mic className="h-4 w-4" />
              Record
            </button>

            <button
              onClick={() => setMode("upload")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                mode === "upload"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>

          </div>

          {/* =================================================
              RECORD MODE
          ================================================== */}

          {mode === "record" && !audioUrl && (
            <div className="mt-10">

              <div className="rounded-2xl border border-white/10 bg-[#050d18] p-8 sm:p-12">

                {/* Recording visualization */}
                <AudioWaveform
  stream={microphoneStream}
  active={isRecording}
  height={192}
/>

                {/* Timer */}
                <div className="mt-8 text-center">

                  <div className="text-4xl font-semibold tabular-nums text-white">
                    {formatTime(recordingTime)}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {isRecording
                      ? "Recording your voice..."
                      : "Ready to record"}
                  </p>

                </div>

                {/* Record button */}
                <div className="mt-8 flex justify-center">

                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="group flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10 transition hover:scale-105 hover:bg-cyan-300"
                    >
                      <Mic className="h-8 w-8 transition group-hover:scale-110" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-400/20 bg-cyan-400 text-slate-950"
                    >
                      <div className="h-7 w-7 rounded-md bg-slate-950" />
                    </button>
                  )}

                </div>

                <p className="mt-5 text-center text-xs text-slate-600">
                  {isRecording
                    ? "Click to stop recording"
                    : "Click the microphone to begin"}
                </p>

              </div>

            </div>
          )}

          {/* =================================================
              UPLOAD MODE
          ================================================== */}

          {mode === "upload" && !audioUrl && (
            <div className="mt-10">

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex min-h-80 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-400/5"
                    : "border-white/10 bg-[#050d18] hover:border-cyan-400/30 hover:bg-white/2"
                }`}
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <FileAudio className="h-7 w-7 text-cyan-400" />
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  Upload a voice recording
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Drag and drop your audio file here, or click to browse
                  your device.
                </p>

                <span className="mt-5 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-slate-400">
                  WAV · MP3 · M4A · WEBM
                </span>

              </button>

            </div>
          )}

          {/* =================================================
              AUDIO PREVIEW
          ================================================== */}

          {audioUrl && audioFile && (
            <div className="mt-10">

              <div className="rounded-2xl border border-cyan-400/10 bg-[#050d18] p-6">

                {/* Success */}
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10">
                    <Check className="h-5 w-5 text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Voice sample ready
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {audioFile.name}
                    </p>
                  </div>

                </div>

                {/* Audio */}
                <div className="mt-6 rounded-xl border border-white/5 bg-white/2.5 p-4">
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                  />
                </div>

                {/* File information */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-xl border border-white/5 bg-white/2 p-4">
                    <p className="text-xs text-slate-600">
                      File
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-slate-300">
                      {audioFile.name}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/2 p-4">
                    <p className="text-xs text-slate-600">
                      Size
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-300">
                      {(audioFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/2 p-4">
                    <p className="text-xs text-slate-600">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-cyan-400">
                      Ready
                    </p>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button
                    onClick={resetRecording}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Choose Another
                  </button>

                  <button
                    onClick={handleAnalyze}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <Waves className="h-4 w-4" />
                    Analyze Voice
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* Instructions */}
          {!audioUrl && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/5 bg-white/1.5 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />

              <p className="text-xs leading-5 text-slate-600">
                For the research-based workflow, the voice sample can
                consist of a sustained vowel sound. Keep the recording
                clear and minimize background noise.
              </p>
            </div>
          )}

        </div>

        {/* Disclaimer */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-6 text-slate-600">
          This system is an academic research project. Results are
          experimental and should not be interpreted as a medical diagnosis.
        </p>

      </div>
    </main>
  );
}