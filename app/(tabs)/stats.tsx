import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '../../theme/tokens';
import { LucideTrophy, LucideFlame, LucideBarChart2, LucideZap } from 'lucide-react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BAR_WIDTH = 32;
const CHART_HEIGHT = 120;

interface WeeklyVolume {
  label: string;
  volume: number;
}

interface PR {
  exerciseName: string;
  maxWeight: number;
  reps: number;
}

interface GlobalStats {
  totalSessions: number;
  totalVolume: number;
  totalExercises: number;
  currentStreak: number;
  weeklyVolumes: WeeklyVolume[];
  personalRecords: PR[];
}

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats>({
    totalSessions: 0,
    totalVolume: 0,
    totalExercises: 0,
    currentStreak: 0,
    weeklyVolumes: [],
    personalRecords: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all completed sessions with exercises and sets
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          start_time,
          session_exercises (
            exercise:exercises(name),
            sets(weight, reps, order_index)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('start_time', { ascending: false });

      if (!sessions) return;

      // --- Global Counts ---
      let totalVolume = 0;
      const exerciseNames = new Set<string>();
      const prMap: Record<string, { maxWeight: number; reps: number }> = {};

      sessions.forEach(s => {
        s.session_exercises.forEach((se: any) => {
          const name = se.exercise?.name || 'Inconnu';
          exerciseNames.add(name);
          se.sets.forEach((set: any) => {
            const vol = (set.weight || 0) * (set.reps || 0);
            totalVolume += vol;
            // Track PR per exercise
            if (!prMap[name] || set.weight > prMap[name].maxWeight) {
              prMap[name] = { maxWeight: set.weight, reps: set.reps };
            }
          });
        });
      });

      // --- Personal Records (top 5 by weight) ---
      const personalRecords: PR[] = Object.entries(prMap)
        .map(([exerciseName, val]) => ({ exerciseName, ...val }))
        .sort((a, b) => b.maxWeight - a.maxWeight)
        .slice(0, 5);

      // --- Weekly Volume (last 5 weeks) ---
      const weeklyVolumes: WeeklyVolume[] = [];
      for (let w = 4; w >= 0; w--) {
        const end = new Date();
        end.setDate(end.getDate() - w * 7);
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);

        let weekVol = 0;
        sessions.forEach(s => {
          const d = new Date(s.start_time);
          if (d >= start && d <= end) {
            s.session_exercises.forEach((se: any) => {
              se.sets.forEach((set: any) => {
                weekVol += (set.weight || 0) * (set.reps || 0);
              });
            });
          }
        });

        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        weeklyVolumes.push({
          label: w === 0 ? 'Cette sem.' : `S-${w}`,
          volume: weekVol,
        });
      }

      // --- Streak (consecutive weeks with at least 1 session) ---
      let streak = 0;
      for (let w = 0; w < 52; w++) {
        const end = new Date();
        end.setDate(end.getDate() - w * 7);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        const hasSession = sessions.some(s => {
          const d = new Date(s.start_time);
          return d >= start && d <= end;
        });
        if (hasSession) streak++;
        else break;
      }

      setStats({
        totalSessions: sessions.length,
        totalVolume,
        totalExercises: exerciseNames.size,
        currentStreak: streak,
        weeklyVolumes,
        personalRecords,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020205', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.accent.violet} size="large" />
      </View>
    );
  }

  const maxVol = Math.max(...stats.weeklyVolumes.map(w => w.volume), 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#020205' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
            <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: -1 }}>Statistiques</Text>
            <Text style={{ color: '#666', fontSize: 13, fontWeight: '600', marginTop: 4 }}>Toute ta progression d'un coup d'œil</Text>
          </View>

          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12 }}>
            <SummaryCard label="Séances" value={stats.totalSessions.toString()} icon={<LucideFlame size={18} color="#8B5CF6" />} color="#8B5CF6" delay={50} />
            <SummaryCard label="Volume total" value={`${(stats.totalVolume / 1000).toFixed(1)}t`} icon={<LucideZap size={18} color="#06B6D4" />} color="#06B6D4" delay={100} />
            <SummaryCard label="Exercices" value={stats.totalExercises.toString()} icon={<LucideBarChart2 size={18} color="#10B981" />} color="#10B981" delay={150} />
            <SummaryCard label="Série sem." value={`${stats.currentStreak}w`} icon={<LucideTrophy size={18} color="#F59E0B" />} color="#F59E0B" delay={200} />
          </View>

          {/* Volume Hebdomadaire Chart */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginHorizontal: 24, marginTop: 32, backgroundColor: '#121214', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 4 }}>Volume par semaine</Text>
            <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', marginBottom: 24 }}>kg soulevés × reps</Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: CHART_HEIGHT + 24 }}>
              {stats.weeklyVolumes.map((week, i) => {
                const barH = maxVol > 0 ? Math.max((week.volume / maxVol) * CHART_HEIGHT, 6) : 6;
                const isLast = i === stats.weeklyVolumes.length - 1;
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    {week.volume > 0 && (
                      <Text style={{ color: isLast ? '#8B5CF6' : '#555', fontSize: 9, fontWeight: '700', marginBottom: 6 }}>
                        {week.volume >= 1000 ? `${(week.volume/1000).toFixed(1)}t` : `${week.volume}kg`}
                      </Text>
                    )}
                    <View style={{ width: BAR_WIDTH, height: barH, borderRadius: 8, overflow: 'hidden' }}>
                      <Svg width={BAR_WIDTH} height={barH}>
                        <Defs>
                          <LinearGradient id={`bar${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={isLast ? '#A78BFA' : '#2A2A2E'} stopOpacity="1" />
                            <Stop offset="100%" stopColor={isLast ? '#7C3AED' : '#1A1A1E'} stopOpacity="1" />
                          </LinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width={BAR_WIDTH} height={barH} fill={`url(#bar${i})`} rx="8" />
                      </Svg>
                    </View>
                    <Text style={{ color: isLast ? '#FFF' : '#555', fontSize: 9, fontWeight: '700', marginTop: 8 }}>{week.label}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Personal Records */}
          <View style={{ marginHorizontal: 24, marginTop: 32 }}>
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 16, letterSpacing: -0.5 }}>Records Personnels</Text>

            {stats.personalRecords.length === 0 ? (
              <View style={{ backgroundColor: '#121214', borderRadius: 28, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' }}>
                <Text style={{ color: '#555', fontStyle: 'italic', textAlign: 'center' }}>
                  Tes records apparaîtront après ta première séance !
                </Text>
              </View>
            ) : (
              stats.personalRecords.map((pr, idx) => (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.delay(300 + idx * 80).springify()}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#121214',
                    borderRadius: 20,
                    padding: 18,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: idx === 0 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: idx === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.1)',
                    alignItems: 'center', justifyContent: 'center', marginRight: 14
                  }}>
                    <Text style={{ fontSize: 16 }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>{pr.exerciseName}</Text>
                    <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                      {pr.reps} reps
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: idx === 0 ? '#F59E0B' : '#FFF', fontWeight: '900', fontSize: 22, letterSpacing: -1 }}>
                      {pr.maxWeight}
                    </Text>
                    <Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>kg</Text>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryCard({ label, value, icon, color, delay }: { label: string; value: string; icon: any; color: string; delay: number }) {
  const cardWidth = (width - 48 - 12) / 2;
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={{
        width: cardWidth,
        backgroundColor: '#121214',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${color}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        {icon}
      </View>
      <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: -1 }}>{value}</Text>
      <Text style={{ color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{label}</Text>
    </Animated.View>
  );
}
