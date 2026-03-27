import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, Modal, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, useSharedValue, useAnimatedStyle, 
  withRepeat, withTiming, Easing 
} from 'react-native-reanimated';
import { LucideDumbbell, LucidePlay, LucideZap, LucideBarChart2, LucideChevronRight, LucideUser, LucidePlus, LucideSearch, LucideX, LucideCheck } from 'lucide-react-native';
import { PressableScale } from '../../components/PressableScale';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS } from '../../theme/tokens';

const { width, height } = Dimensions.get('window');

const AI_SUGGESTED_EXERCISES = [
  { id: 'ai-1', name: 'Développé Couché', target_muscle: 'Pectoraux' },
  { id: 'ai-2', name: 'Squat Barre', target_muscle: 'Jambes' },
  { id: 'ai-3', name: 'Tractions', target_muscle: 'Dos' },
];

// 1. DYNAMIC SVG BACKGROUND
function BackgroundBlobs() {
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 30000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }, { scale: 1.2 }] as any }));
  const animatedStyle2 = useAnimatedStyle(() => ({ transform: [{ rotate: `-${rotation.value * 0.8}deg` }, { scale: 1.4 }] as any }));

  return (
    <View style={StyleSheet.absoluteFill} className="bg-[#020205] overflow-hidden">
      <Animated.View style={[animatedStyle1, { position: 'absolute', top: -height*0.2, left: -width*0.5, width: width*2, height: width*2 }] as any}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#4C1D95" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad1)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[animatedStyle2, { position: 'absolute', bottom: -height*0.1, right: -width*0.5, width: width*1.8, height: width*1.8 }] as any}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient id="grad2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#2563EB" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad2)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// 2. CIRCULAR SVG RING
function CircularProgress({ progress, size, strokeWidth }: { progress: number, size: number, strokeWidth: number }) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={center} cy={center} r={radius} stroke="url(#ringGrad)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="none" />
      </Svg>
      <View style={StyleSheet.absoluteFill} className="items-center justify-center">
        <Text className="text-white text-4xl font-black tracking-tighter">{progress}%</Text>
        <Text className="text-[#8888] text-[9px] uppercase font-bold tracking-[3px] mt-1">Régularité</Text>
      </View>
    </View>
  );
}

// 3. WEEKLY CALENDAR COMPONENT
function WeeklyCalendar({ activeDays }: { activeDays: number[] }) {
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <View className="flex-row justify-between w-full px-6 mb-8 mt-2">
      {days.map((day, i) => (
        <View key={i} className="items-center">
          <Text className={`text-[10px] font-bold mb-2 ${i === adjustedToday ? 'text-white' : 'text-[rgba(255,255,255,0.4)]'}`}>{day}</Text>
          <View className={`w-8 h-8 rounded-full items-center justify-center ${i === adjustedToday ? 'border border-[#8B5CF6] bg-[#8B5CF6]/20' : ''}`}>
             {activeDays.includes(i) ? (
               <View className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
             ) : (
               <View className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]" />
             )}
             {i === adjustedToday && <View className="absolute w-full h-full rounded-full border border-[#8B5CF6]/30" />}
          </View>
        </View>
      ))}
    </View>
  );
}

// 4. EXERCISE LIBRARY MODAL (standalone, no workout needed)
function ExerciseLibraryModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');
  const muscles = ['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];

  useEffect(() => {
    if (visible) fetchExercises();
  }, [visible]);

  async function fetchExercises() {
    setLoading(true);
    const { data } = await supabase.from('exercises').select('*').order('name');
    if (data) setExercises(data);
    setLoading(false);
  }

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = selectedMuscle === 'Tous' || ex.target_muscle === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <View style={{ flex: 1, backgroundColor: '#0A0A0E', marginTop: 60, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', flex: 1 }}>Bibliothèque</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <LucideX size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          {/* Search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <LucideSearch size={16} color="#666" />
            <TextInput
              style={{ flex: 1, color: '#FFF', marginLeft: 10, fontSize: 15 }}
              placeholder="Rechercher un exercice..."
              placeholderTextColor="#555"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {/* Muscle filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
            {muscles.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMuscle(m)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selectedMuscle === m ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: selectedMuscle === m ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text style={{ color: selectedMuscle === m ? '#FFF' : '#888', fontSize: 13, fontWeight: '600' }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* List */}
          {loading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20 }}
              renderItem={({ item }) => (
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
                  padding: 16, marginBottom: 10,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                }}>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <LucideDumbbell size={20} color="#8B5CF6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>{item.name}</Text>
                    <Text style={{ color: '#666', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{item.target_muscle}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={{ color: '#555', textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>Aucun exercice trouvé</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [stats, setStats] = React.useState({
    tonnage: 0,
    activeDays: [] as number[],
    regularity: 0,
    loading: true
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select(`id, start_time, session_exercises (sets (weight, reps))`)
        .eq('user_id', user.id)
        .gte('start_time', firstDayOfWeek.toISOString());

      if (sessions) {
        let totalTonnage = 0;
        const activeDaysSet = new Set<number>();

        sessions.forEach(session => {
          const date = new Date(session.start_time);
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          activeDaysSet.add(dayIndex);

          session.session_exercises.forEach((se: any) => {
            se.sets.forEach((s: any) => {
              totalTonnage += (s.weight || 0) * (s.reps || 0);
            });
          });
        });

        const activeDays = Array.from(activeDaysSet);
        const regularity = Math.min(Math.round((activeDays.length / 4) * 100), 100);

        setStats({ tonnage: totalTonnage, activeDays, regularity, loading: false });
      }
    } catch (e) {
      console.error('Fetch Stats Error:', e);
    }
  }

  // Start a workout with AI-suggested exercises pre-filled
  function startAIWorkout() {
    router.push({
      pathname: '/workout',
      params: { action: 'ai_start', exercises: JSON.stringify(AI_SUGGESTED_EXERCISES), t: Date.now() }
    });
  }

  return (
    <View className="flex-1 bg-black">
      <BackgroundBlobs />
      
      {/* Standalone Exercise Library Modal — no workout created */}
      <ExerciseLibraryModal visible={showExerciseLibrary} onClose={() => setShowExerciseLibrary(false)} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Nav */}
        <View className="px-6 pb-2 flex-row justify-between items-center z-10">
          <View className="bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)]">
            <Text className="text-white font-semibold tracking-[2px] text-[10px] uppercase">Strength OS</Text>
          </View>
          <PressableScale 
            onPress={() => router.push('/profile')}
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] justify-center items-center border border-[rgba(255,255,255,0.1)]"
          >
             <LucideUser size={18} color="#FFF" />
          </PressableScale>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.delay(100).springify().damping(20).mass(0.8)} className="items-center mt-6">
             <WeeklyCalendar activeDays={stats.activeDays} />
             <CircularProgress progress={stats.loading ? 0 : stats.regularity} size={180} strokeWidth={10} />
             
             <View className="flex-row mt-6 gap-4">
                <View className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] px-6 py-3 rounded-2xl items-center">
                  <Text className="text-[rgba(255,255,255,0.4)] text-[9px] font-bold uppercase tracking-wider mb-1">Volume Hebdo</Text>
                  <Text className="text-white text-xl font-black">{stats.tonnage.toLocaleString()} <Text className="text-sm font-normal text-[rgba(255,255,255,0.5)]">kg</Text></Text>
                </View>
                <View className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] px-6 py-3 rounded-2xl items-center">
                  <Text className="text-[rgba(255,255,255,0.4)] text-[9px] font-bold uppercase tracking-wider mb-1">Séances</Text>
                  <Text className="text-white text-xl font-black">{stats.activeDays.length} <Text className="text-sm font-normal text-[rgba(255,255,255,0.5)]">/ 4</Text></Text>
                </View>
             </View>
          </Animated.View>

          <View className="mt-8">
            {/* AI Suggestion Card */}
            <Animated.View entering={FadeInDown.delay(200).springify().damping(20)} className="mb-10 px-6">
              <Text className="text-[rgba(255,255,255,0.4)] text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-2">Suggestion du jour</Text>
              
              <View className="overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.7)] p-6">
                 <View className="absolute -top-10 -right-10 w-40 h-40 opacity-30">
                    <Svg height="100%" width="100%">
                      <Defs>
                        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                          <Stop offset="0%" stopColor="#06B6D4" stopOpacity="1" />
                          <Stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                        </RadialGradient>
                      </Defs>
                      <Circle cx="50%" cy="50%" r="50%" fill="url(#glow)" />
                    </Svg>
                 </View>

                <View className="flex-row justify-between items-start mb-6">
                  <View className="bg-[rgba(255,255,255,0.1)] p-3 rounded-[18px]">
                    <LucideZap size={24} color="#06B6D4" strokeWidth={1.5} />
                  </View>
                  <View className="bg-[rgba(6,182,212,0.15)] px-3 py-1.5 rounded-full border border-[rgba(6,182,212,0.3)]">
                    <Text className="text-[#06B6D4] text-[9px] font-bold tracking-[2px] uppercase">Optimisé IA</Text>
                  </View>
                </View>

                <Text className="text-white text-[28px] font-medium tracking-tighter leading-none mb-2">
                  Force Maximum
                </Text>

                {/* Pre-filled exercises preview */}
                <View className="mb-5 mt-2 gap-y-1">
                  {AI_SUGGESTED_EXERCISES.map((ex, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(6,182,212,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                        <LucideCheck size={9} color="#06B6D4" />
                      </View>
                      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' }}>
                        {ex.name} <Text style={{ color: 'rgba(255,255,255,0.3)' }}>• {ex.target_muscle}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* Actionable — starts with pre-filled exercises */}
                <PressableScale 
                  onPress={startAIWorkout}
                  className="bg-white rounded-full py-4 flex-row justify-center items-center"
                >
                  <Text className="text-black font-bold text-sm tracking-widest uppercase mr-2">Accepter & Démarrer</Text>
                  <LucidePlay size={16} color="#000" fill="#000" />
                </PressableScale>
              </View>
            </Animated.View>

            <Text className="text-[rgba(255,255,255,0.4)] text-[10px] font-bold tracking-[2px] uppercase mb-4 ml-8">Explorer</Text>
            
            {/* Horizontal Quick Actions — each with a distinct purpose */}
            <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                {/* Séance Libre: blank workout */}
                <ActionSquare
                  onPress={() => router.push({ pathname: '/workout', params: { action: 'start', t: Date.now() } })}
                  icon={<LucidePlus size={24} color="#fff" />}
                  title="Séance Libre"
                  subtitle="Blank"
                  gradient={['#8B5CF6', '#6D28D9']}
                />
                {/* Exercices: standalone browser, no workout */}
                <ActionSquare
                  onPress={() => setShowExerciseLibrary(true)}
                  icon={<LucideDumbbell size={24} color="#fff" />}
                  title="Exercices"
                  subtitle="Bibliothèque"
                  gradient={['#F59E0B', '#B45309']}
                />
                {/* Statistiques: real dedicated stats screen */}
                <ActionSquare
                  onPress={() => router.push('/stats')}
                  icon={<LucideBarChart2 size={24} color="#fff" />}
                  title="Statistiques"
                  subtitle="Évolution"
                  gradient={['#10B981', '#047857']}
                />
              </ScrollView>
            </Animated.View>
          </View>

        </ScrollView>
        
        {/* FAB — start blank workout */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(20)} className="absolute bottom-10 left-6 right-6">
          <PressableScale 
            onPress={() => router.push({ pathname: '/workout', params: { action: 'start', t: Date.now() } })}
            scaleTo={0.96} 
            className="bg-[#8B5CF6] rounded-full py-5 flex-row justify-center items-center border border-[#A78BFA]"
            style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20 }}
          >
            <Text className="text-white font-black text-base tracking-[3px] uppercase mr-3">Commencer</Text>
            <LucideChevronRight size={20} color="#fff" strokeWidth={3} />
          </PressableScale>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

function ActionSquare({ icon, title, subtitle, gradient, onPress }: { icon: React.ReactNode, title: string, subtitle: string, gradient: string[], onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.95} className="w-36 h-40 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.5)] p-5 justify-between">
      <View className="w-12 h-12 rounded-[16px] overflow-hidden items-center justify-center" style={{ backgroundColor: gradient[0] }}>
        {icon}
      </View>
      <View>
        <Text className="text-white text-[14px] font-bold tracking-tight mb-0.5">{title}</Text>
        <Text className="text-[rgba(255,255,255,0.4)] text-[10px] uppercase font-bold tracking-wider">{subtitle}</Text>
      </View>
    </PressableScale>
  );
}
