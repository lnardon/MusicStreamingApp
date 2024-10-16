import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import axios from "axios";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { usePlayerStore } from "@/stores/playerStore";

type Song = {
  id: string;
  title: string;
  path: string;
  album: string;
  artist: {
    id: string;
    name: string;
  };
  file: string;
};

const SERVER_API_URL = "http://192.168.15.10:7777";

export default function Screen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuildingAudio, setIsBuildingAudio] = useState(false);

  const sound = usePlayerStore((state) => state.audioCtx);
  const queue = usePlayerStore((state) => state.queue);
  const setQueue = usePlayerStore((state) => state.setQueue);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${SERVER_API_URL}/getAllSongs`);
        setSongs(response.data);
        setFilteredSongs(response.data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    const filtered = songs.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  const playSong = async (song: any) => {
    try {
      if (isBuildingAudio) {
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      setIsBuildingAudio(true);
      Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
      });

      const apiUrl = `${SERVER_API_URL}/getSong?file=${song.id}`;
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: apiUrl,
      });

      usePlayerStore.setState({
        isPlaying: true,
        audioCtx: newSound,
        song: {
          id: song.id,
          title: song.title,
          album: song.album,
          artist: {
            id: "",
            name: "",
          },
          file: apiUrl,
        },
      });
      await newSound.playAsync();
      setIsBuildingAudio(false);
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => playSong(item)}
      onLongPress={() => {
        setQueue([...queue, item]);
      }}
    >
      <Text style={styles.songText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a song..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <Text style={styles.songText}>Artists</Text>
        <Text style={styles.songText}>Albums</Text>
        <Text style={styles.songText}>Songs</Text>
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 20,
    color: "#ddd",
  },
  songItem: {
    padding: 4,
    marginVertical: 2,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderBottomColor: "#333",
    borderBottomWidth: 2,
  },
  songText: {
    fontSize: 16,
    color: "#ddd",
  },
});
