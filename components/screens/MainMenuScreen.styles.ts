import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },

  // Animated Background
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E1A',
  },

  // Premium Sidebar
  sidebar: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(24px)',
  },

  floatingElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  floatingCircle1: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    opacity: 0.7,
  },

  floatingCircle2: {
    position: 'absolute',
    bottom: 160,
    right: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    opacity: 0.6,
  },

  floatingCircle3: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.5,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 70, 229, 0.18)',
    opacity: 0.5,
  },

  sidebarContent: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 16 : isTablet ? 32 : 20,
    paddingVertical: isSmallDevice ? 16 : isTablet ? 24 : 20,
    position: 'relative',
    zIndex: 10,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
    paddingTop: 12,
  },

  logoContainer: {
    position: 'relative',
  },

  logoGradient: {
    width: isSmallDevice ? 64 : isTablet ? 88 : 72,
    height: isSmallDevice ? 64 : isTablet ? 88 : 72,
    borderRadius: isSmallDevice ? 20 : isTablet ? 28 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  logoText: {
    fontSize: isSmallDevice ? 28 : isTablet ? 40 : 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    zIndex: 2,
    letterSpacing: 0.5,
  },

  logoShimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-12deg' }],
  },

  // User Section
  userSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },

  userAvatar: {
    marginBottom: 12,
  },

  avatarGradient: {
    width: isSmallDevice ? 76 : isTablet ? 96 : 84,
    height: isSmallDevice ? 76 : isTablet ? 96 : 84,
    borderRadius: isSmallDevice ? 20 : isTablet ? 28 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  avatarText: {
    fontSize: isSmallDevice ? 32 : isTablet ? 44 : 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },

  roleBadge: {
    marginBottom: 12,
  },

  roleBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    elevation: 6,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  userName: {
    fontSize: isSmallDevice ? 20 : isTablet ? 26 : 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },

  userEmail: {
    fontSize: isSmallDevice ? 14 : isTablet ? 17 : 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Menu Container
  menuContainer: {
    flex: 1,
    marginBottom: 20,
  },

  // Menu Items
  menuItemWrapper: {
    marginBottom: isSmallDevice ? 10 : isTablet ? 16 : 12,
  },

  menuItem: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  menuItemActive: {
    elevation: 12,
    shadowColor: '#6366F1',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },

  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 20 : isTablet ? 28 : 24,
    paddingVertical: isSmallDevice ? 16 : isTablet ? 20 : 18,
    position: 'relative',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    minHeight: isSmallDevice ? 64 : isTablet ? 80 : 72,
  },

  activeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  menuIconContainer: {
    width: isSmallDevice ? 48 : isTablet ? 60 : 52,
    height: isSmallDevice ? 48 : isTablet ? 60 : 52,
    borderRadius: isSmallDevice ? 14 : isTablet ? 18 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isSmallDevice ? 16 : isTablet ? 22 : 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  iconGlassEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },

  iconGlow: {
    position: 'absolute',
    width: '160%',
    height: '160%',
    borderRadius: 26,
    opacity: 0.25,
  },

  menuItemTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 16 : isTablet ? 19 : 17,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.2,
    lineHeight: isSmallDevice ? 20 : isTablet ? 24 : 22,
  },

  activeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: [{ skewX: '-15deg' }],
  },

  // Logout Button
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    marginTop: 8,
  },

  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallDevice ? 16 : isTablet ? 20 : 18,
    paddingHorizontal: isSmallDevice ? 20 : isTablet ? 28 : 24,
    gap: isSmallDevice ? 12 : isTablet ? 16 : 14,
    position: 'relative',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 20,
    minHeight: isSmallDevice ? 60 : isTablet ? 72 : 64,
  },

  logoutText: {
    fontSize: isSmallDevice ? 16 : isTablet ? 19 : 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  logoutShimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ skewX: '-15deg' }],
  },
});