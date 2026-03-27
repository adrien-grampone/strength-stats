import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { LucideUser, LucideTrophy, LucideDumbbell, LucideZap, LucideLogOut, LucideSettings, LucideAward, LucideActivity } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { PressableScale } from '../../components/PressableScale';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../theme/tokens';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Stats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  personalRecords: any[];
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalVolume: 0,
    totalSets: 0,
    personalRecords: []
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch Stats
      const { data: sessions, error: sError } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          session_exercises (
            sets (weight, reps)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (sessions) {
        let volume = 0;
        let setsCount = 0;
        sessions.forEach(s => {
          s.session_exercises.forEach((se: any) => {
            se.sets.forEach((set: any) => {
              volume += (set.weight * set.reps);
              setsCount++;
            });
          });
        });

        // Fetch PRs (Max weight per exercise)
        // This is a simplified version for the MVP. In a real app, we'd do a more complex query.
        const { data: prData } = await supabase
          .from('sets')
          .select(`
            weight,
            reps,
            session_exercise:session_exercises (
              exercise:exercises (name)
            )
          `)
          .order('weight', { ascending: false })
          .limit(3);

        setStats({
          totalWorkouts: sessions.length,
          totalVolume: volume,
          totalSets: setsCount,
          personalRecords: prData || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#020205] items-center justify-center">
        <ActivityIndicator color={COLORS.accent.violet} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#020205]">
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center mt-8 mb-10 px-6">
            <Animated.View entering={FadeInDown.springify()} className="relative">
              <View className="w-28 h-28 rounded-full border-2 border-[#8B5CF6] p-1">
                <View className="w-full h-full rounded-full bg-[#1C1C1E] items-center justify-center overflow-hidden">
                  <LucideUser size={50} color="#8B5CF6" />
                </View>
              </View>
              <View className="absolute bottom-0 right-0 bg-[#8B5CF6] w-8 h-8 rounded-full items-center justify-center border-2 border-[#020205]">
                <LucideAward size={16} color="#FFF" />
              </View>
            </Animated.View>
            
            <Text className="text-white text-3xl font-black mt-4 tracking-tighter">
              {user?.email?.split('@')[0] || 'Athlète'}
            </Text>
            <Text className="text-[#888888] text-sm uppercase tracking-[3px] font-bold mt-1">
              Niveau 4 • Elite
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="px-6 flex-row flex-wrap justify-between mt-4">
            <StatCard 
              label="Séances" 
              value={stats.totalWorkouts.toString()} 
              icon={<LucideDumbbell size={20} color="#8B5CF6" />} 
              delay={100}
            />
            <StatCard 
              label="Volume (kg)" 
              value={stats.totalVolume.toLocaleString()} 
              icon={<LucideZap size={20} color="#06B6D4" />} 
              delay={200}
            />
            <StatCard 
              label="Séries" 
              value={stats.totalSets.toString()} 
              icon={<LucideActivity size={20} color="#10B981" />} 
              delay={300}
            />
            <StatCard 
              label="Records" 
              value={stats.personalRecords.length.toString()} 
              icon={<LucideTrophy size={20} color="#F59E0B" />} 
              delay={400}
            />
          </View>

          {/* PRs Section */}
          <View className="px-6 mt-12">
            <Text className="text-white text-xl font-bold mb-6 tracking-tight">Records Personnels</Text>
            {stats.personalRecords.length > 0 ? (
              stats.personalRecords.map((pr, idx) => (
                <Animated.View 
                  key={idx}
                  entering={FadeInRight.delay(idx * 100).springify()}
                  className="bg-[#121214] rounded-3xl p-5 mb-4 border border-white/5 flex-row items-center"
                >
                  <View className="bg-[#1C1C1E] w-12 h-12 rounded-2xl items-center justify-center mr-4 border border-white/5">
                    <LucideTrophy size={20} color="#F59E0B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base">{pr.session_exercise.exercise.name}</Text>
                    <Text className="text-[#666666] text-xs uppercase tracking-widest font-bold">Record de poids</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-black text-xl">{pr.weight}kg</Text>
                    <Text className="text-[#888888] text-[10px]">{pr.reps} reps</Text>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View className="bg-[#121214] rounded-3xl p-8 border border-white/5 items-center">
                <Text className="text-[#666666] text-center font-medium italic">Tes premiers records apparaîtront ici après tes prochaines séances.</Text>
              </View>
            )}
          </View>

          {/* Progress Visualization (Mini Chart Simulation with SVG) */}
          <View className="px-6 mt-12">
            <Text className="text-white text-xl font-bold mb-6 tracking-tight">Volume Hebdomadaire</Text>
            <View className="bg-[#121214] rounded-[32px] p-6 border border-white/5 overflow-hidden">
              <View className="h-32 w-full items-end flex-row justify-between pt-10 px-2">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => (
                  <View key={i} className="items-center">
                    <View 
                      style={{ height: h * 60 }} 
                      className={`w-4 rounded-full ${i === 6 ? 'bg-[#8B5CF6]' : 'bg-[#1C1C1E] border border-white/5'}`}
                    />
                    <Text className="text-[8px] text-[#444] font-bold mt-3">{"LMMJVSD"[i]}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-[10px] text-[#666666] font-bold tracking-[2px] uppercase mt-6 text-center">Tendance Positive (+12%)</Text>
            </View>
          </View>

          {/* Account Actions */}
          <View className="px-6 mt-12 gap-y-4">
            <PressableScale className="bg-[#121214] border border-white/5 flex-row items-center p-5 rounded-3xl">
              <LucideSettings size={20} color="#FFF" />
              <Text className="text-white font-bold ml-4 text-base">Paramètres</Text>
              <View className="ml-auto bg-[rgba(139,92,246,0.1)] px-3 py-1 rounded-full border border-[#8B5CF6]/30">
                <Text className="text-[#8B5CF6] text-[10px] font-bold uppercase">Pro</Text>
              </View>
            </PressableScale>

            <PressableScale 
              onPress={handleLogout}
              className="bg-[#121214] border border-white/5 flex-row items-center p-5 rounded-3xl"
            >
              <LucideLogOut size={20} color="#FF4444" />
              <Text className="text-[#FF4444] font-bold ml-4 text-base">Déconnexion</Text>
            </PressableScale>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ label, value, icon, delay }: { label: string, value: string, icon: any, delay: number }) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={{ width: (width - 48 - 12) / 2 }}
      className="bg-[#121214] rounded-3xl p-5 mb-3 border border-white/5"
    >
      <View className="bg-[#1C1C1E] w-10 h-10 rounded-2xl items-center justify-center mb-6">
        {icon}
      </View>
      <Text className="text-white text-2xl font-black tracking-tighter">{value}</Text>
      <Text className="text-[#666666] text-xs font-bold uppercase tracking-wider mt-0.5">{label}</Text>
    </Animated.View>
  );
}
