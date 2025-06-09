import React, { useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";

export default function ChatRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    // Doğrudan messages sayfasına yönlendir
    if (id) {
      router.replace({
        pathname: "/messages/[id]",
        params: { id },
      });
    } else {
      router.replace("/messages");
    }
  }, [id]);

  return null; // Sadece yönlendirme yapıyor, bir şey render etmiyor
}
