import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, MapPin, Phone, Globe, Star, Navigation, Search, Filter } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const SAMPLE_DOCTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    specialty: 'Ophthalmologist',
    address: '123 Medical Center Dr, Suite 400',
    distance: '0.8 miles',
    rating: 4.9,
    reviews: 124,
    phone: '555-0123',
    website: 'https://example.com',
    openNow: true,
  },
  {
    id: '2',
    name: 'Elite Vision Care',
    specialty: 'Optometry Clinic',
    address: '456 Eye Care Blvd',
    distance: '1.2 miles',
    rating: 4.7,
    reviews: 89,
    phone: '555-0124',
    website: 'https://example.com',
    openNow: true,
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    specialty: 'Retina Specialist',
    address: '789 Health Plaza, Room 12',
    distance: '2.5 miles',
    rating: 5.0,
    reviews: 56,
    phone: '555-0125',
    website: 'https://example.com',
    openNow: false,
  },
];

export default function DoctorFinder() {
  const { theme } = useTheme();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      await Location.getCurrentPositionAsync({});
      setLoading(false);
    })();
  }, []);

  const openMap = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const callDoctor = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Eye Specialist</Text>
        <Text style={styles.headerSubtitle}>Nearby ophthalmologists and clinics</Text>
      </LinearGradient>

      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
          <Search size={20} color={theme.colors.subtext} />
          <Text style={[styles.searchText, { color: theme.colors.subtext }]}>Search by name or specialty...</Text>
          <Filter size={20} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loaderText, { color: theme.colors.subtext }]}>Locating specialists near you...</Text>
          </View>
        ) : (
          <>
            <View style={styles.locationBanner}>
              <MapPin size={16} color={theme.colors.primary} />
              <Text style={[styles.locationText, { color: theme.colors.text }]}>
                {errorMsg ? 'Defaulting to City Center' : 'Showing results near your location'}
              </Text>
            </View>

            {SAMPLE_DOCTORS.map((doc) => (
              <View key={doc.id} style={[styles.doctorCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.docInfo}>
                    <Text style={[styles.docName, { color: theme.colors.text }]}>{doc.name}</Text>
                    <Text style={[styles.docSpecialty, { color: theme.colors.primary }]}>{doc.specialty}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingText, { color: theme.colors.text }]}>{doc.rating}</Text>
                    <Text style={[styles.reviewsText, { color: theme.colors.subtext }]}>({doc.reviews})</Text>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MapPin size={14} color={theme.colors.subtext} />
                    <Text style={[styles.detailText, { color: theme.colors.subtext }]} numberOfLines={1}>
                      {doc.address} • {doc.distance}
                    </Text>
                  </View>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: doc.openNow ? '#34C759' : '#FF3B30' }]} />
                    <Text style={[styles.statusText, { color: doc.openNow ? '#34C759' : '#FF3B30' }]}>
                      {doc.openNow ? 'Open Now' : 'Closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.colors.primary + '15' }]}
                    onPress={() => callDoctor(doc.phone)}
                  >
                    <Phone size={18} color={theme.colors.primary} />
                    <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.colors.primary + '15' }]}
                    onPress={() => openMap(doc.address)}
                  >
                    <Navigation size={18} color={theme.colors.primary} />
                    <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.bookBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => Linking.openURL(doc.website)}
                  >
                    <Text style={styles.bookBtnText}>Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/search/eye+doctor+near+me`)}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View all nearby clinics on Maps</Text>
              <Globe size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loader: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 14,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  doctorCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  docSpecialty: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewsText: {
    fontSize: 12,
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
  }
});
