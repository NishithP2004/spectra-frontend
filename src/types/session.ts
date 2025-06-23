/**
 * Firestore Session Schema
 * This file defines the structure of session documents in Firestore
 */

export interface Session {
  id: string; // session-id
  title: string;
  createdAt: any; // Firestore timestamp
  owner: {
    uid: string;
    name: string;
    photo: string;
  };
  options: {
    enableRecording: boolean;
    mode: "Normal" | "Hacking";
    privacy: "public" | "private";
  };
  recording?: {
    duration: number; // time in seconds
    url: string; // GCS Bucket URL
    thumbnail: string;
    summary: string; // video summary
  };
}

/**
 * Type for creating a new session (without recording data)
 * The recording object will be set by a cloud function
 */
export type CreateSessionData = Omit<Session, 'recording'>;

/**
 * Type for session recording data that will be set by cloud functions
 */
export interface SessionRecording {
  duration: number; // time in seconds
  url: string; // GCS Bucket URL
  thumbnail: string;
  summary: string; // video summary
} 