import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { v4 } from 'uuid';
import { consultByAudio } from './client-assistance/core/actions/ConsultByAudio';
import { AssistanceResponse } from './client-assistance/core/domain/Action';
import './App.css';
import MicIcon from '@mui/icons-material/Mic';

const silenceThreshold = 0.01;
const silenceDuration = 1500;
const silenceAfterAudio = 300;

const base64ToBlob = (base64Data: string, contentType: string): Blob => {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data); // Decodifica base64
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

enum Owner {
  User = 'user',
  Bot = 'bot',
}

type Message = {
  id: string;
  text: string;
  owner: Owner;
  correction?: string;
}

const App: React.FC = () => {
  const [isTalking, setIsTalking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const startedToTalkRef = useRef<boolean>(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);


  const stopAudioRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      analyserRef.current = null;
      audioContextRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    startedToTalkRef.current = false;
    recordingRef.current = false;
  };

  useEffect(() => {
    return () => {
      stopAudioRecording();
    };
  }, []);

  const startRecording = async (): Promise<void> => {
    setIsRecording(true);
    recordingRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 2048;

    mediaRecorder.start();
    detectSilence();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
  };

  const detectSilence = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 128 - 1;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / bufferLength);

    if (rms < silenceThreshold) {
      if (startedToTalkRef.current && !silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(stopRecording, silenceDuration);
      }
    } else {
      if (!startedToTalkRef.current) {
        startedToTalkRef.current = true;
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }

    if (recordingRef.current) {
      requestAnimationFrame(detectSilence);
    }
  };

  const stopRecording = (): void => {
    setIsRecording(false);
    recordingRef.current = false;

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        const [text, response] = await consultByAudio.invoke('session', audioBlob);

        const id = v4();
        setMessages((m) => [...m, { owner: Owner.User, id, text, }]);
        handleResponse(id, response);
      };

      if (audioContextRef.current) {
        audioContextRef.current.close();
        analyserRef.current = null;
        audioContextRef.current = null;
      }

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      if (startedToTalkRef.current) {
        startedToTalkRef.current = false;
      }
    }
  };

  const handleResponse = (id: string, { audio, action }: AssistanceResponse) => {
    const message = { id: v4(), owner: Owner.Bot, text: action.response };
    setMessages((m) => {
      if (action.correction) {
        const index = m.findIndex((msg) => msg.id === id);
        if (index !== -1) {
          m[index].correction = action.correction;
        }
      }
      return [...m, message];
    });

    const audioBlobFromBase64 = base64ToBlob(audio, 'audio/webm');
    const audioUrlFromBase64 = URL.createObjectURL(audioBlobFromBase64);

    const audioElement = new Audio(audioUrlFromBase64);
    audioElementRef.current = audioElement;

    audioElement.addEventListener('ended', async () => {
      audioElementRef.current = null;
      await new Promise(resolve => setTimeout(resolve, silenceAfterAudio));
      startRecording();
    });

    audioElement.play();
  }

  const handleTalk = () => {
    if (isTalking) {
      stopAudioRecording();
      setIsTalking(false);
    } else {
      setIsTalking(true);
      startRecording();
    }
  };

  return (<Box p={2}>
    <Box display="flex" flexDirection="column" gap={2} mb={2}>
      {messages.map(({ owner, text, id, correction }) => (
        <Typography
          key={id}
          variant="body1"
          color="textPrimary"
          sx={{
            backgroundColor: owner === Owner.Bot ? 'white' : '#e0f7fa',
            padding: '8px 16px',
            borderRadius: '16px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            maxWidth: '60%',
            marginRight: owner === Owner.Bot ? 'auto' : '0',
            marginLeft: owner === Owner.User ? 'auto' : '0',
          }}
        >
          {text}{correction ? `(${correction})` : ''}
        </Typography>
      ))}
    </Box>

    <Box display="flex" alignItems="center" justifyContent='center' gap={1}>
      {
        !isTalking && <Button onClick={handleTalk} variant='contained'>
          Hablar
        </Button>
      }
      {
        isRecording && <div className="microphone-container">
          <div className="mic-icon">
            <MicIcon />
          </div>
          <div className="mic-wave"></div>
          <div className="mic-wave"></div>
          <div className="mic-wave"></div>
        </div>
      }
    </Box>
  </Box>
  );
};

export default App;
