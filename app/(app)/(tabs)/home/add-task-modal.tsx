import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";
import { useRef } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/app/context/supabase-service";
import { useSession } from "@/app/context/ctx";

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  const titleRef = useRef("");
  const descriptionRef = useRef("");
  const router = useRouter();
  const { user } = useSession();

  const { isError, isSuccess, mutateAsync } = useMutation({
    mutationFn: async ({
      title,
      description,
      owner,
    }: {
      title: string;
      description: string;
      owner: string;
    }) => {
      const { data, error } = await supabaseClient
        .from("Tasks")
        .insert({ title, description, owner })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {},
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <FontAwesome
                  name="close"
                  size={25}
                  color={Colors[colorScheme ?? "light"].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: "10%",
          backgroundColor: "transparent",
        }}
      >
        <View style={{ width: "80%", backgroundColor: "transparent" }}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Title"
            autoCapitalize="none"
            nativeID="title"
            onChangeText={(text) => {
              titleRef.current = text;
            }}
            style={styles.textInput}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Description"
            autoCapitalize="none"
            nativeID="description"
            multiline={true}
            numberOfLines={8}
            onChangeText={(text) => {
              descriptionRef.current = text;
            }}
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={async () => {
              try {
                const response = await mutateAsync({
                  title: titleRef.current,
                  description: descriptionRef.current,
                  owner: user?.id as string,
                });

                // this forces the update
                router.replace("/(app)/(tabs)/home/");
              } catch (error) {
                Alert.alert("Create Task Error", (error as Error)?.message);
              }
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>SAVE TASK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    color: "#455fff",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#455fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
