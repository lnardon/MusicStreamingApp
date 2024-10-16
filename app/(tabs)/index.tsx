import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import axios from "axios";

const SERVER_API_URL = "http://192.168.15.10:7777";

export default function HomeScreen() {
  const [lastAlbums, setLastAlbums] = useState([]);
  const [lastSongs, setLastSongs] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get(`${SERVER_API_URL}/getHistory`);
        setLastAlbums(response.data.albums);
        setLastSongs(response.data.songs);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <FlatList
        style={styles.albumsList}
        data={lastAlbums}
        horizontal={true}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <Image
              source={{
                uri: `${SERVER_API_URL}/getCover?file=${item.id}`,
              }}
              style={{
                width: 150,
                height: 150,
                borderRadius: 8,
                marginHorizontal: 10,
              }}
            />
            {/* <ThemedText type="subtitle">{item.title}</ThemedText> */}
          </TouchableOpacity>
        )}
      />
      <Text style={styles.titleContainer}>Recently Played</Text>
      <FlatList
        style={{}}
        data={lastSongs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 8,
            }}
          >
            <Image
              source={{
                uri: `${SERVER_API_URL}/getCover?file=${item.album}`,
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 4,
                marginHorizontal: 10,
              }}
            />
            <ThemedText type="subtitle">{item.title}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    padding: 16,
    marginTop: 42,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 8,
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  albumsList: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: 256,
  },
});
