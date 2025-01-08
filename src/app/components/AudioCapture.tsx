"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import styles from "../styles/index.module.scss";
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from "../types/speechRecognitionInterfaces";

const AudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [saveAudio, setSaveAudio] = useState(false); // Controla si el audio se guarda o no
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const isSpeechRecognitionSupported =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    if (!isSpeechRecognitionSupported) {
      alert("El navegador no soporta la API de SpeechRecognition.");
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (saveAudio && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (saveAudio) {
          const audioBlob = new Blob(chunks, { type: "audio/wav" });
          setAudioChunks([...audioChunks, audioBlob]);
          const audioURL = URL.createObjectURL(audioBlob);
          setAudioURL(audioURL);
        }
      };

      mediaRecorder.start();
      startTranscription(); // Iniciar transcripción en paralelo
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    stopTranscription(); // Detener transcripción
  };

  const toggleRecording = () => {
    setIsRecording((prev) => {
      if (prev) {
        stopRecording();
      } else {
        startRecording();
      }
      return !prev;
    });
  };

  const toggleSaveAudio = () => {
    setSaveAudio((prev) => !prev);
  };

  const startTranscription = () => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = "es-ES";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ");
        setTranscribedText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Error en la transcripción:", event.error);
      };

      recognition.start();
    } else {
      console.error("El navegador no soporta la API de SpeechRecognition.");
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return (
    <div className={styles.audio}>
      <button
        onClick={toggleRecording}
        className={`${styles.recordButton} ${isRecording ? styles.recording : ""}`}
      >
        {isRecording ? (
          <FaMicrophoneSlash className={styles.icon} />
        ) : (
          <FaMicrophone className={styles.icon} />
        )}
      </button>
      <button
        onClick={toggleSaveAudio}
        className={`${styles.saveAudioButton} ${saveAudio ? styles.active : ""}`}
      >
        {saveAudio ? "Guardar audio: Sí" : "Guardar audio: No"}
      </button>
      {saveAudio && audioURL && (
        <div className={styles.audioPreview}>
          <audio controls>
            <source src={audioURL} type="audio/wav" />
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      )}
      <div className={styles.transcription}>
        <p>{transcribedText}</p>
      </div>
    </div>
  );
};

export default AudioCapture;
