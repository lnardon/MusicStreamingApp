import { Audio } from "expo-av";
import { create } from "zustand";

interface Song {
  id?: string;
  album: string;
  file: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
}
interface PlayerState {
  song: Song;
  setSong: (song: Song) => void;

  isPlaying: boolean;
  isShuffled: boolean;
  isRepeating: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsShuffled: (isShuffled: boolean) => void;
  setIsRepeating: (isRepeating: boolean) => void;

  queue: Song[];
  setQueue: (queue: Song[]) => void;

  audioRef: HTMLAudioElement | null;
  setAudioRef: (audioRef: HTMLAudioElement) => void;

  audioCtx: Audio.Sound | null;
  setAudioCtx: (audioCtx: Audio.Sound) => void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  song: {
    id: "",
    album: "",
    file: "",
    title: "",
    artist: {
      id: "",
      name: "",
    },
  },
  setSong: (song: Song) => set({ song }),

  isPlaying: false,
  isShuffled: false,
  isRepeating: false,
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsShuffled: (isShuffled: boolean) => set({ isShuffled }),
  setIsRepeating: (isRepeating: boolean) => set({ isRepeating }),

  queue: [],
  setQueue: (queue: Song[]) => set({ queue }),

  audioRef: null,
  setAudioRef: (audioRef: HTMLAudioElement) => set({ audioRef }),

  audioCtx: null,
  setAudioCtx: (audioCtx: Audio.Sound) => set({ audioCtx }),
}));
