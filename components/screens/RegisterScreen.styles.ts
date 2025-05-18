import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    height: 80,
    width: 260,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 15,
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  error: {
    color: '#e53935',
    marginBottom: 8,
    fontSize: 12,
    paddingLeft: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkboxLabel: {
    flex: 1,
    color: '#444',
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: '#001E80',
    fontWeight: '600',
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  or: {
    marginHorizontal: 12,
    color: '#999',
    fontWeight: '600',
    fontSize: 13,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
  contact: {
    textAlign: 'center',
    color: '#999',
    marginTop: 12,
    fontSize: 13,
  },
  languageToggle: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#001E80',
    borderRadius: 8,
  },
  languageToggleText: {
    color: '#001E80',
    fontWeight: '600',
    fontSize: 13,
  },
  footerText: {
    color: '#555',
    fontSize: 14,
  },
});
