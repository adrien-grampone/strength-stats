import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Dimensions, Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, LinearTransition } from 'react-native-reanimated';
import { LucideMail, LucideLock, LucideChevronRight, LucideUser, LucideArrowLeft } from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { PressableScale } from '../../components/PressableScale';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');

// 1. REUSED OR ADAPTED DYNAMIC SVG BACKGROUND
function AuthBackground() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` as any }, { scale: 1.5 }] }));
  const animatedStyle2 = useAnimatedStyle(() => ({ transform: [{ rotate: `-${rotation.value * 0.7}deg` as any }, { scale: 1.8 }] }));

  return (
    <View style={StyleSheet.absoluteFill} className="bg-[#020205] overflow-hidden">
      <Animated.View style={[animatedStyle1, { position: 'absolute', top: -height * 0.3, left: -width * 0.8, width: width * 2.5, height: width * 2.5 }]}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <Stop offset="60%" stopColor="#4C1D95" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad1)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[animatedStyle2, { position: 'absolute', bottom: -height * 0.2, right: -width * 0.8, width: width * 2.2, height: width * 2.2 }]}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <Stop offset="60%" stopColor="#2563EB" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad2)" />
        </Svg>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(2, 2, 5, 0.4)' }]} />
    </View>
  );
}

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) alert(error.message);
      else alert('Vérifie tes emails pour confirmer ton inscription !');
    }
    setLoading(false);
  }

  return (
    <Pressable onPress={Keyboard.dismiss} style={styles.container}>
      <AuthBackground />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Animated.View
              entering={FadeInDown.springify().damping(20)}
              style={styles.header}
              layout={LinearTransition.springify()}
            >
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>OS v4</Text>
              </View>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>Strength Stats</Text>
              <Text style={styles.subtitle}>
                {isLogin ? 'Propulse tes performances' : 'Rejoins la nouvelle ère'}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.card}
              layout={LinearTransition.springify()}
            >
              <View style={styles.form}>
                {!isLogin && (
                  <Animated.View
                    entering={FadeInDown.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.inputWrapper}
                  >
                    <View style={styles.inputContainer}>
                      <LucideUser size={18} color={COLORS.text.secondary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Nom complet"
                        placeholderTextColor={COLORS.text.tertiary}
                        value={fullName}
                        onChangeText={setFullName}
                        style={styles.input}
                      />
                    </View>
                  </Animated.View>
                )}

                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <LucideMail size={18} color={COLORS.text.secondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor={COLORS.text.tertiary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <LucideLock size={18} color={COLORS.text.secondary} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Mot de passe"
                      placeholderTextColor={COLORS.text.tertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Oublié ?</Text>
                  </TouchableOpacity>
                )}

                <PressableScale
                  onPress={handleAuth}
                  disabled={loading}
                  style={[styles.loginButton, { backgroundColor: isLogin ? COLORS.text.primary : COLORS.accent.violet }]}
                >
                  <Text style={[styles.loginButtonText, { color: isLogin ? '#000' : '#FFF' }]}>
                    {loading ? 'Traitement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
                  </Text>
                  <LucideChevronRight size={18} color={isLogin ? '#000' : '#FFF'} strokeWidth={3} />
                </PressableScale>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.footer}
            >
              <Text style={styles.footerText}>
                {isLogin ? "Nouveau ici ?" : "Déjà membre ?"}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
                <Text style={styles.signUpText}>
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  logoBadgeText: {
    color: COLORS.accent.violet,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -2,
    marginBottom: 8,
    paddingRight: 4, // Prevents "s" clipping
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
    overflow: 'hidden',
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    color: COLORS.accent.blue,
    fontSize: 13,
    fontWeight: '700',
  },
  loginButton: {
    height: 60,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    paddingHorizontal: 8,
  },
  signUpText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
