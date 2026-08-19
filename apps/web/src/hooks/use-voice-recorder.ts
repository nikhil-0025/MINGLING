"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface VoiceRecorderState {
  isRecording: boolean
  recordingTime: number
  audioBlob: Blob | null
  audioUrl: string | null
  error: string | null
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    recordingTime: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl)
      }
    }
  }, [state.audioUrl])

  const startRecording = useCallback(async () => {
    try {
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl)
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setState((prev) => ({ ...prev, audioBlob: blob, audioUrl: url, isRecording: false }))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(100)
      setState({ isRecording: true, recordingTime: 0, audioBlob: null, audioUrl: null, error: null })

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, recordingTime: prev.recordingTime + 1 }))
      }, 1000)
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Microphone access denied" }))
    }
  }, [state.audioUrl])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const clearRecording = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl)
    setState({ isRecording: false, recordingTime: 0, audioBlob: null, audioUrl: null, error: null })
  }, [state.audioUrl])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return {
    ...state,
    formattedTime: formatTime(state.recordingTime),
    startRecording,
    stopRecording,
    clearRecording,
  }
}