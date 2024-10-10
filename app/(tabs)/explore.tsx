import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { Audio } from "expo-av";

type Song = {
  id: string;
  title: string;
  path: string;
};

const SERVER_API_URL = "http://192.168.15.10:7777";

export default function Screen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "http://192.168.15.10:7777/getAllSongs"
        );
        console.log("Fetched songs:", response.data);
        setSongs(response.data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  const playSong = async (songId: string) => {
    try {
      // If there's a sound already playing, stop and unload it
      if (sound) {
        await sound.unloadAsync();
      }

      // Make the API request to get the song file
      const apiUrl = `${SERVER_API_URL}/getSong?file=${songId}`; // Replace with your actual server IP
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: apiUrl,
      });

      // Set the new sound and play it
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => playSong(item.id)}>
      <Text style={styles.songText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
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
  songItem: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: "#f9c2ff",
    borderRadius: 5,
  },
  songText: {
    fontSize: 18,
  },
});
