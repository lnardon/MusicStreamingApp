import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av";
import { Repeat, Shuffle } from "react-native-feather";
import { usePlayerStore } from "../../stores/playerStore";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import axios from "axios";

const SERVER_API_URL = "http://192.168.15.10:7777";

const Player = () => {
  const {
    song: { id: songId, title, artist, album, file },
    setSong,
    isPlaying,
    setIsPlaying,
    isRepeating,
    isShuffled,
    setIsRepeating,
    setIsShuffled,
    queue,
    setQueue,
    audioCtx,
    setAudioCtx,
  } = usePlayerStore();
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const timelineRef = React.createRef<View>();

  const loadAudio = async (nextSong: any) => {
    try {
      if (audioCtx) {
        await audioCtx.unloadAsync();
      }

      Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      });

      const apiUrl = `${SERVER_API_URL}/getSong?file=${nextSong.id}`;
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        {
          uri: apiUrl,
        },
        {},
        onPlaybackStatusUpdate
      );
      setAudioCtx(newSound);

      usePlayerStore.setState({
        isPlaying: true,
        audioCtx: newSound,
        song: {
          id: nextSong.id,
          title: nextSong.title,
          album: nextSong.album,
          artist: {
            id: "",
            name: "",
          },
          file: apiUrl,
        },
      });

      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const unloadAudio = async () => {
    if (audioCtx) {
      await audioCtx.unloadAsync();
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && (status as AVPlaybackStatusSuccess).durationMillis) {
      const playbackStatus = status as AVPlaybackStatusSuccess;
      setPosition(playbackStatus.positionMillis);
      setDuration(playbackStatus.durationMillis!);
      setProgress(
        (playbackStatus.positionMillis / playbackStatus.durationMillis!) * 100
      );

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        handleNext();
      }
    }
  };

  let tmo: any;
  const handlePlayPause = async () => {
    if (audioCtx) {
      if (isPlaying) {
        clearInterval(tmo);
        await audioCtx.pauseAsync();
      } else {
        tmo = setInterval(async () => {
          onPlaybackStatusUpdate(await audioCtx.getStatusAsync());
        }, 1000);
        await audioCtx.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = async () => {
    if (queue.length > 0) {
      const nextSong = queue.shift();
      setSong(nextSong!);
      setQueue(queue);
      loadAudio(nextSong!);
    }
  };

  const handlePrevious = async () => {
    if (audioCtx) {
      await audioCtx.setPositionAsync(0);
    }
  };

  const handleSeek = async (value: any) => {
    console.log(value.nativeEvent);
    if (audioCtx) {
      timelineRef.current!.measure(async (fx, fy, width, height, px, py) => {
        console.log("Component width is: " + width);
        console.log("X offset to frame: " + fx);
        console.log("Y offset to frame: " + fy);
        console.log("X offset to page: " + px);
        console.log("Y offset to page: " + py);
        // calculate the relative position of the click based on the timeline width
        const relativeX = value.nativeEvent.locationX;
        const seekPosition = (relativeX * duration) / width;
        await audioCtx.setPositionAsync(seekPosition);
      });
    }
  };

  const formatTime = (millis: any) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    (async () => {
      if (audioCtx) {
        onPlaybackStatusUpdate(await audioCtx.getStatusAsync());
      }
    })();

    return () => {
      unloadAudio();
    };
  }, [audioCtx]);

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <Image
          source={{ uri: `${SERVER_API_URL}/getCover?file=${album}` }}
          style={styles.cover}
        />
        <View style={styles.text}>
          <Animated.Text
            style={[styles.title, { opacity: fadeAnim }]}
            onLayout={fadeIn}
          >
            {title}
          </Animated.Text>
          {/* <Text style={styles.artist}>{artist.name}</Text> */}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <TouchableOpacity onPressIn={handleSeek}>
          <View style={styles.timeline} ref={timelineRef}>
            <View
              style={{
                width: `${progress}%`,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#fefafa",
              }}
            ></View>
          </View>
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsRepeating(!isRepeating)}>
          <Repeat color={isRepeating ? "#ffd000" : "#444444"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrevious}>
          <TabBarIcon
            name={true ? "play-skip-back" : "play-skip-back-outline"}
            color={"#fafafa"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPressIn={handlePlayPause}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: !isPlaying ? "#ffd000" : "#262626",
            borderRadius: 64,
            padding: 16,
          }}
        >
          {isPlaying ? (
            <TabBarIcon
              name={true ? "pause" : "pause-outline"}
              color={true ? "#fafafa" : "#ffd000"}
              size={42}
            />
          ) : (
            <View>
              <TabBarIcon
                name={true ? "play" : "play-outline"}
                color={"#171717"}
                size={42}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <TabBarIcon
            name={true ? "play-skip-forward" : "play-skip-forward-outline"}
            color={"#fafafa"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsShuffled(!isShuffled)}>
          <Shuffle color={isShuffled ? "#ffd000" : "#444444"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#080808",
  },
  trackInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 128,
  },
  cover: {
    width: 320,
    height: 320,
    borderRadius: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 64,
  },
  artist: {
    fontSize: 14,
    color: "#aaa",
  },
  controls: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 64,
    width: "100%",
  },
  timelineContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 32,
  },
  timeline: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    height: 8,
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: "#888888",
    position: "relative",
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "#fff",
  },
});

export default Player;
