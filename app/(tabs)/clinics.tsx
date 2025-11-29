import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { clinicService } from '@/services/clinicService';
import { Clinic } from '@/types/clinic';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_APIKEY = 'AIzaSyCWKpcU0c9HCV2UpuKFDgk8zC_bleRTuJY';

// Parse working hours string into structured format with grouped days
const parseWorkingHours = (hoursString: string) => {
  if (!hoursString) return [];

  const days = [
    { key: 'Пн', label: 'Понедельник', order: 0 },
    { key: 'Вт', label: 'Вторник', order: 1 },
    { key: 'Ср', label: 'Среда', order: 2 },
    { key: 'Чт', label: 'Четверг', order: 3 },
    { key: 'Пт', label: 'Пятница', order: 4 },
    { key: 'Сб', label: 'Суббота', order: 5 },
    { key: 'Вс', label: 'Воскресенье', order: 6 },
  ];

  // First, parse all days
  const parsedDays: Array<{ dayShort: string; hours: string; order: number }> = [];
  const parts = hoursString.split(';').map(part => part.trim()).filter(Boolean);

  for (const part of parts) {
    const match = part.match(/^([А-Яа-я]{2}):\s*(.+)$/);
    if (match) {
      const dayKey = match[1];
      const hours = match[2].trim();
      const dayInfo = days.find(d => d.key === dayKey);

      if (dayInfo) {
        parsedDays.push({
          dayShort: dayKey,
          hours: hours,
          order: dayInfo.order,
        });
      }
    }
  }

  // Sort by day order
  parsedDays.sort((a, b) => a.order - b.order);

  // Group consecutive days with same hours
  const groupedSchedule: Array<{ dayRange: string; hours: string }> = [];
  let currentGroup: typeof parsedDays = [];

  for (let i = 0; i < parsedDays.length; i++) {
    const current = parsedDays[i];

    if (currentGroup.length === 0) {
      currentGroup.push(current);
    } else {
      const lastInGroup = currentGroup[currentGroup.length - 1];

      // Check if same hours and consecutive day
      if (current.hours === lastInGroup.hours && current.order === lastInGroup.order + 1) {
        currentGroup.push(current);
      } else {
        // Finalize current group
        groupedSchedule.push(formatGroup(currentGroup));
        currentGroup = [current];
      }
    }
  }

  // Add last group
  if (currentGroup.length > 0) {
    groupedSchedule.push(formatGroup(currentGroup));
  }

  return groupedSchedule;
};

// Format a group of days into a readable range
const formatGroup = (group: Array<{ dayShort: string; hours: string }>) => {
  if (group.length === 1) {
    return {
      dayRange: group[0].dayShort,
      hours: group[0].hours,
    };
  } else if (group.length === 2) {
    return {
      dayRange: `${group[0].dayShort}, ${group[1].dayShort}`,
      hours: group[0].hours,
    };
  } else {
    return {
      dayRange: `${group[0].dayShort} - ${group[group.length - 1].dayShort}`,
      hours: group[0].hours,
    };
  }
};

export default function ClinicsScreen() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [routeClinic, setRouteClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 43.238949, // Almaty coordinates
    longitude: 76.889709,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const mapRef = useRef<MapView>(null);
  const explanationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearestClinics();
    }
  }, [userLocation]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const fetchNearestClinics = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const data = await clinicService.getNearestClinics(
        userLocation.latitude,
        userLocation.longitude,
        50 // 50km radius
      );
      setClinics(data);
      setIsSearchMode(false);
      setAiExplanation('');

      // Center map on user location
      if (userLocation) {
        const newRegion = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(newRegion);
      }
    } catch (error) {
      console.error('Error fetching nearest clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    Keyboard.dismiss();

    // Clear any existing explanation timeout
    if (explanationTimeoutRef.current) {
      clearTimeout(explanationTimeoutRef.current);
    }

    try {
      setAiSearching(true);
      setIsSearchMode(true);

      const result = await clinicService.aiSearch({
        query: searchQuery,
        lat: userLocation?.latitude,
        lng: userLocation?.longitude,
      });

      setClinics(result.clinics);
      setAiExplanation(result.explanation);

      // Auto-dismiss explanation after 10 seconds
      explanationTimeoutRef.current = setTimeout(() => {
        setAiExplanation('');
      }, 10000);

      // If we have results, fit map to show all clinics
      if (result.clinics.length > 0) {
        const latitudes = result.clinics.map(c => c.latitude);
        const longitudes = result.clinics.map(c => c.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const newRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5 || 0.1,
          longitudeDelta: (maxLng - minLng) * 1.5 || 0.1,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    } catch (error) {
      console.error('Error in AI search:', error);
      setAiExplanation('Произошла ошибка при поиске. Попробуйте еще раз.');

      // Auto-dismiss error message after 5 seconds
      explanationTimeoutRef.current = setTimeout(() => {
        setAiExplanation('');
      }, 5000);
    } finally {
      setAiSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAiExplanation('');
    if (explanationTimeoutRef.current) {
      clearTimeout(explanationTimeoutRef.current);
    }
    fetchNearestClinics();
    Keyboard.dismiss();
  };

  const handleDismissExplanation = () => {
    setAiExplanation('');
    if (explanationTimeoutRef.current) {
      clearTimeout(explanationTimeoutRef.current);
    }
  };

  const handleMarkerPress = (clinic: Clinic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedClinic(clinic);
    setShowRoute(false);
    mapRef.current?.animateToRegion({
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const handleCloseDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedClinic(null);
    setShowRoute(false);
    setRouteClinic(null);
    setRouteDistance('');
    setRouteDuration('');
  };

  const handleShowRoute = () => {
    if (!selectedClinic || !userLocation) {
      if (!userLocation) {
        alert('Не удалось получить ваше местоположение');
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowRoute(true);

    // Store clinic for route rendering
    setRouteClinic(selectedClinic);

    // Close the clinic details panel to show full route
    setSelectedClinic(null);

    // Fit map to show both user location and clinic
    const coordinates = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedClinic.latitude, longitude: selectedClinic.longitude },
    ];

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
      animated: true,
    });
  };

  const handleGetDirections = () => {
    if (!selectedClinic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const url = Platform.select({
      ios: `maps:0,0?q=${selectedClinic.latitude},${selectedClinic.longitude}`,
      android: `geo:0,0?q=${selectedClinic.latitude},${selectedClinic.longitude}(${encodeURIComponent(selectedClinic.name)})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedClinic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // TODO: Navigate to appointment booking screen
    // For now, just show an alert
    alert('Функция записи на прием будет доступна в ближайшее время');
  };

  const handleCallClinic = () => {
    if (!selectedClinic?.phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${selectedClinic.phone}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3772ff" />
          <Text style={styles.loadingText}>Загрузка клиник...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Карта клиник</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{clinics.length}</Text>
        </View>
      </View>

      {/* AI Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="sparkles" size={20} color="#3772ff" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск клиники"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleAISearch}
          />
          {searchQuery && !aiSearching && (
            <Pressable onPress={handleClearSearch} style={styles.searchClearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
          <Pressable
            onPress={handleAISearch}
            style={styles.searchButton}
            disabled={!searchQuery.trim() || aiSearching}
          >
            <LinearGradient
              colors={searchQuery.trim() && !aiSearching ? ['#3772ff', '#2c5bcc'] : ['#9CA3AF', '#6B7280']}
              style={styles.searchButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {aiSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={18} color="#FFFFFF" />
              )}
            </LinearGradient>
          </Pressable>
        </View>
        {aiExplanation && (
          <View style={styles.aiExplanationContainer}>
            <Ionicons name="information-circle" size={16} color="#3772ff" />
            <Text style={styles.aiExplanationText}>{aiExplanation}</Text>
            <Pressable onPress={handleDismissExplanation} style={styles.dismissButton}>
              <Ionicons name="close" size={18} color="#003cffff" />
            </Pressable>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
        >
          {clinics.map((clinic) => (
            <Marker
              key={clinic.id}
              coordinate={{
                latitude: clinic.latitude,
                longitude: clinic.longitude,
              }}
              onPress={() => handleMarkerPress(clinic)}
            >
              <View style={styles.markerContainer}>
                <LinearGradient
                  colors={
                    selectedClinic?.id === clinic.id || routeClinic?.id === clinic.id
                      ? ['#3772ff', '#2c5bcc']
                      : ['#FFFFFF', '#F3F4F6']
                  }
                  style={styles.marker}
                >
                  <Ionicons
                    name="medical"
                    size={20}
                    color={selectedClinic?.id === clinic.id || routeClinic?.id === clinic.id ? '#FFFFFF' : '#ff3737ff'}
                  />
                </LinearGradient>
              </View>
            </Marker>
          ))}

          {/* Show route if requested */}
          {showRoute && routeClinic && userLocation && (
            <MapViewDirections
              origin={userLocation}
              destination={{
                latitude: routeClinic.latitude,
                longitude: routeClinic.longitude,
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="#3772ff"
              optimizeWaypoints={true}
              onReady={result => {
                const distanceKm = result.distance.toFixed(1);
                const durationMin = Math.round(result.duration);
                setRouteDistance(`${distanceKm} км`);
                setRouteDuration(`${durationMin} мин`);
              }}
              onError={(errorMessage) => {
                console.error('Directions error:', errorMessage);
                alert('Не удалось построить маршрут');
                setShowRoute(false);
                setRouteClinic(null);
              }}
            />
          )}
        </MapView>

        {/* Clinic Details Card */}
        {selectedClinic && (
          <View style={styles.detailsCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Close Button */}
              <Pressable style={styles.closeButton} onPress={handleCloseDetails}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </Pressable>

              {/* Clinic Header */}
              <View style={styles.clinicHeader}>
                <View style={styles.clinicIconWrapper}>
                  <LinearGradient
                    colors={['#ff3737ff', '#2c5bcc']}
                    style={styles.clinicIconGradient}
                  >
                    <Ionicons name="medical" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.clinicHeaderInfo}>
                  <Text style={styles.clinicName}>{selectedClinic.name}</Text>
                  {selectedClinic.rating && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>{selectedClinic.rating.toFixed(1)}</Text>
                      <Text style={styles.ratingLabel}>рейтинг</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                {/* Address */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location" size={18} color="#3772ff" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Адрес</Text>
                    <Text style={styles.infoValue}>{selectedClinic.address}</Text>
                  </View>
                </View>

                {/* Phone */}
                {selectedClinic.phone && (
                  <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="call" size={18} color="#3772ff" />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Телефон</Text>
                      <Text style={styles.infoValue}>{selectedClinic.phone}</Text>
                    </View>
                  </View>
                )}

                {/* Working Hours */}
                {selectedClinic.working_hours && (
                  <View style={styles.workingHoursCard}>
                    <View style={styles.workingHoursHeader}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name="time" size={18} color="#3772ff" />
                      </View>
                      <Text style={styles.workingHoursTitle}>Часы работы</Text>
                    </View>
                    <View style={styles.workingHoursList}>
                      {parseWorkingHours(selectedClinic.working_hours).map((schedule, index) => (
                        <View key={index} style={styles.workingHoursRow}>
                          <Text style={styles.dayLabel}>{schedule.dayRange}</Text>
                          <View style={styles.hoursDivider} />
                          <Text style={styles.hoursValue}>{schedule.hours}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Description */}
              {selectedClinic.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{selectedClinic.description}</Text>
                </View>
              )}

              {/* Services */}
              {selectedClinic.services && selectedClinic.services.length > 0 && (
                <View style={styles.servicesContainer}>
                  <Text style={styles.servicesTitle}>Услуги:</Text>
                  <View style={styles.servicesList}>
                    {selectedClinic.services.map((service, index) => (
                      <View key={index} style={styles.serviceChip}>
                        <Text style={styles.serviceText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {selectedClinic.phone && (
                  <Pressable style={styles.actionButton} onPress={handleCallClinic}>
                    <Ionicons name="call" size={18} color="#3772ff" />
                    <Text style={styles.actionButtonText}>Позвонить</Text>
                  </Pressable>
                )}
                <Pressable style={styles.actionButton} onPress={handleBookAppointment}>
                  <Ionicons name="calendar" size={18} color="#3772ff" />
                  <Text style={styles.actionButtonText}>Записаться</Text>
                </Pressable>
              </View>

              {/* Route Buttons - Different UI when route is active */}
              {showRoute && routeClinic?.id === selectedClinic.id ? (
                <View style={styles.routeActionButtons}>
                  <Pressable
                    style={styles.actionButtonSecondary}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSelectedClinic(null);
                    }}
                  >
                    <Ionicons name="navigate" size={18} color="#3772ff" />
                    <Text style={styles.actionButtonSecondaryText}>Вернуться к маршруту</Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionButtonDanger}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setShowRoute(false);
                      setRouteClinic(null);
                      setRouteDistance('');
                      setRouteDuration('');
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.actionButtonDangerText}>Отменить маршрут</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.actionButtonPrimary}
                  onPress={handleShowRoute}
                >
                  <LinearGradient
                    colors={['#3772ff', '#2c5bcc']}
                    style={styles.actionButtonPrimaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="map" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonPrimaryText}>
                      Показать маршрут
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </ScrollView>
          </View>
        )}

        {/* Route Info Indicator */}
        {showRoute && routeClinic && !selectedClinic && (
          <Pressable
            style={styles.routeInfoCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedClinic(routeClinic);
            }}
          >
            <LinearGradient
              colors={['#3772ff', '#2c5bcc']}
              style={styles.routeInfoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.routeInfoContent}>
                <View style={styles.routeInfoHeader}>
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={styles.routeInfoTitle} numberOfLines={1}>{routeClinic.name}</Text>
                </View>
                {(routeDistance || routeDuration) && (
                  <View style={styles.routeInfoStats}>
                    {routeDistance && (
                      <View style={styles.routeStat}>
                        <Ionicons name="location" size={16} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.routeStatText}>{routeDistance}</Text>
                      </View>
                    )}
                    {routeDuration && (
                      <View style={styles.routeStat}>
                        <Ionicons name="time" size={16} color="rgba(255, 255, 255, 0.9)" />
                        <Text style={styles.routeStatText}>{routeDuration}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <Pressable onPress={handleCloseDetails} style={styles.routeCloseButton}>
                <Ionicons name="close-circle" size={24} color="#FFFFFF" />
              </Pressable>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerBadge: {
    backgroundColor: '#3772ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  searchClearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchButton: {
    marginLeft: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiExplanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  aiExplanationText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 2,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: height * 0.65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingRight: 40,
  },
  clinicIconWrapper: {
    marginRight: 12,
  },
  clinicIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3772ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  clinicHeaderInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  ratingLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 2,
  },
  infoSection: {
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  workingHoursCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  workingHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workingHoursTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
  workingHoursList: {
    gap: 8,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 60,
  },
  hoursDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  servicesContainer: {
    marginBottom: 20,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  serviceText: {
    fontSize: 13,
    color: '#3772ff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3772ff',
  },
  actionButtonPrimary: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  routeButtonActive: {
    opacity: 0.9,
  },
  actionButtonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Route Info Indicator
  routeInfoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3772ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  routeInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  routeInfoContent: {
    flex: 1,
  },
  routeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  routeInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  routeInfoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routeCloseButton: {
    padding: 4,
  },
  // Route Action Buttons
  routeActionButtons: {
    gap: 8,
    marginTop: 4,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3772ff',
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  actionButtonDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
