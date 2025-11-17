import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const QuickActionSkeleton: React.FC = () => {
  return (
    <View style={styles.quickActionSkeleton}>
      <SkeletonLoader width={48} height={48} borderRadius={12} style={styles.iconSkeleton} />
      <SkeletonLoader width={60} height={12} borderRadius={6} style={{ marginTop: 8 }} />
    </View>
  );
};

export const AppointmentCardSkeleton: React.FC = () => {
  return (
    <View style={styles.appointmentCardSkeleton}>
      <SkeletonLoader width={56} height={56} borderRadius={16} />
      <View style={styles.appointmentTextSkeleton}>
        <SkeletonLoader width="60%" height={16} borderRadius={8} />
        <SkeletonLoader width="40%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        <SkeletonLoader width="50%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  quickActionSkeleton: {
    width: 110,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconSkeleton: {
    marginBottom: 12,
  },
  appointmentCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appointmentTextSkeleton: {
    flex: 1,
    marginLeft: 16,
  },
});
