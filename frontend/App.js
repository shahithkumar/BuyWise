import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, SafeAreaView, Linking,
  Platform, Keyboard, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// For Android emulator it usually needs 10.0.2.2 instead of localhost
// Change this to your machine's local IP address if testing on a physical device!
const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [intent, setIntent] = useState(null);

  const searchProducts = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      setResults(data.results || []);
      setIntent(data.understood_intent || null);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to connect to backend. Make sure FastAPI is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    searchProducts(text);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.ratingText}>⭐ {item.rating || "N/A"}</Text>
        </View>
        <Text style={styles.scoreBadge}>{item.match_score} Match</Text>
      </View>

      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.productImage} resizeMode="contain" />
      ) : null}

      <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>

      <View style={styles.specsContainer}>
        {item.features?.camera && <Text style={styles.specText}>📷 {item.features.camera}</Text>}
        {item.features?.battery && <Text style={styles.specText}>🔋 {item.features.battery}</Text>}
        {item.features?.processor && <Text style={styles.specText}>⚙️ {item.features.processor}</Text>}
      </View>

      <View style={styles.tagsContainer}>
        {item.tags?.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => Linking.openURL(item.link || 'https://amazon.in')}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>BuyWise</Text>
          <Text style={styles.subtitle}>Your Smart Shopping Assistant</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Best gaming phone under 25k"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => searchProducts(query)}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => searchProducts(query)}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Suggestions - only show if haven't searched yet */}
        {!hasSearched && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Try asking:</Text>
            <TouchableOpacity onPress={() => handleSuggestion("Best gaming phone under 25k")}>
              <Text style={styles.suggestionChip}>🎮 Best gaming phone under 25k</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSuggestion("Phones with great camera under 20k")}>
              <Text style={styles.suggestionChip}>📸 Phones with great camera under 20k</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSuggestion("Big battery backup phone")}>
              <Text style={styles.suggestionChip}>🔋 Big battery backup phone</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section */}
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : hasSearched && (
          <View style={styles.resultsArea}>
            {intent && (
              <View style={styles.intentBox}>
                <Text style={styles.intentText}>
                  Filters: {intent.budget ? `Max ₹${intent.budget}` : 'Any Price'}
                  {intent.feature_need ? ` • Focus: ${intent.feature_need}` : ''}
                </Text>
              </View>
            )}

            <FlatList
              data={results}
              keyExtractor={item => item.id}
              renderItem={renderProduct}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>No products matched your exact needs. Try a different query!</Text>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    elevation: 3,                 // Android shadow
    shadowColor: '#000',          // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchButton: {
    marginLeft: 10,
    width: 50,
    height: 50,
    backgroundColor: '#0066cc',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchButtonText: {
    fontSize: 20,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: '#e6f2ff',
    color: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
    fontWeight: '500',
  },
  loader: {
    marginTop: 50,
  },
  resultsArea: {
    flex: 1,
  },
  intentBox: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  intentText: {
    color: '#2e7d32',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#ff9900',
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 150,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  scoreBadge: {
    backgroundColor: '#fffae6',
    color: '#d48806',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 12,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },
  buyButton: {
    backgroundColor: '#ff9900', // Amazon orange-ish
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  }
});
