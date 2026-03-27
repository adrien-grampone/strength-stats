import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Modal, 
  FlatList, 
  ActivityIndicator, 
  Platform,
  Keyboard,
  Share,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  LucidePlus, 
  LucideTrash2, 
  LucideCheck, 
  LucideSearch, 
  LucideChevronRight, 
  LucideDumbbell, 
  LucideX,
  LucideClock,
  LucideActivity,
  LucideZap,
  LucideShare2,
  LucideEye
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { PressableScale } from '../../components/PressableScale';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';
import { Database } from '../../lib/database.types';

type Exercise = Database['public']['Tables']['exercises']['Row'];

interface Set {
  id: string;
  reps: string;
  weight: string;
  completed?: boolean;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: Set[];
}

const MUSCLE_GROUPS = ['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Tous');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [creating, setCreating] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingSession, setViewingSession] = useState<any | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  // Fetch exercises from Supabase
  useEffect(() => {
    if (showExerciseModal) {
      fetchExercises();
    }
  }, [showExerciseModal]);

  useEffect(() => {
    if (!isWorkoutActive) {
      fetchHistory();
    }
  }, [isWorkoutActive]);

  // React to navigation params from Dashboard - runs on every focus
  useEffect(() => {
    const action = params.action as string;
    if (!action) return;
    
    if (action === 'start') {
      // Start a fresh empty workout
      setExercises([]);
      setIsWorkoutActive(true);
    } else if (action === 'ai_start') {
      // Start a workout with AI-suggested exercises pre-filled
      try {
        const preFilled = JSON.parse(params.exercises as string || '[]');
        const workoutExercises: WorkoutExercise[] = preFilled.map((ex: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          exercise: ex,
          sets: [{ id: Math.random().toString(36).substr(2, 9), reps: '10', weight: '0' }]
        }));
        setExercises(workoutExercises);
        setIsWorkoutActive(true);
      } catch (e) {
        setExercises([]);
        setIsWorkoutActive(true);
      }
    } else if (action === 'exercises') {
      // Open the exercise library modal directly
      if (!isWorkoutActive) {
        setExercises([]);
        setIsWorkoutActive(true);
      }
      setTimeout(() => setShowExerciseModal(true), 300);
    } else if (action === 'history') {
      // Make sure we are on the history view
      setIsWorkoutActive(false);
      fetchHistory();
    }
  }, [params.action, params.t]);

  async function deleteSession(sessionId: string) {
    Alert.alert(
      "Supprimer la séance",
      "Es-tu sûr de vouloir supprimer cette séance ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId);
              
              if (error) throw error;
              
              setRecentSessions(prev => prev.filter(s => s.id !== sessionId));
              setViewingSession(null);
            } catch (e: any) {
              alert(e.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  async function shareSession(session: any) {
    const totalVolume = session.session_exercises.reduce((acc: number, se: any) => 
      acc + se.sets.reduce((sAcc: number, s: any) => sAcc + (s.weight * s.reps), 0), 0
    );

    const message = `🔥 Séance terminée sur Strength Stats !\n\n📊 Résumé :\n📅 ${new Date(session.start_time).toLocaleDateString('fr-FR')}\n🏋️ ${session.session_exercises.length} exercices\n⚡ ${totalVolume.toLocaleString()} kg de volume total\n\nPrêt pour la prochaine ? 💪`;

    try {
      await Share.share({ message });
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          session_exercises (
            exercise:exercises(name),
            sets(weight, reps, order_index)
          )
        `)
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .limit(5);

      if (data) setRecentSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function fetchExercises() {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (data) setAvailableExercises(data);
    setLoading(false);
  }

  function toggleSetCompletion(exerciseId: string, setId: string) {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
        };
      }
      return ex;
    }));
  }

  const filteredExercises = availableExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Tous' || ex.target_muscle === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  function startWorkout() {
    setIsWorkoutActive(true);
    setExercises([]);
  }

  function addExerciseToWorkout(exercise: Exercise) {
    const newWorkoutExercise: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      exercise,
      sets: [{ id: '1', reps: '', weight: '' }]
    };
    setExercises([...exercises, newWorkoutExercise]);
    setShowExerciseModal(false);
  }

  function addSet(exerciseId: string) {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: Math.random().toString(36).substr(2, 9), 
            reps: lastSet?.reps || '', 
            weight: lastSet?.weight || '' 
          }]
        };
      }
      return ex;
    }));
  }

  function removeExercise(exerciseId: string) {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  }

  function updateSet(exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value, completed: false } : s)
        };
      }
      return ex;
    }));
  }

  async function finishWorkout() {
    if (exercises.length === 0) {
      setIsWorkoutActive(false);
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      // 1. Ensure profile exists (Sync trigger might have a tiny delay or fail)
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (pError || !profile) {
        // Attempt to manual create if trigger failed
        await supabase.from('profiles').insert({ id: user.id, username: user.email?.split('@')[0] });
      }

      // 2. Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session Error:', sessionError);
        throw new Error(`Erreur session: ${sessionError.message}`);
      }

      // 2. Create exercises and sets (Simplified for MVP)
      for (const [index, ex] of exercises.entries()) {
        const { data: seData, error: seError } = await supabase
          .from('session_exercises')
          .insert({
            session_id: sessionData.id,
            exercise_id: ex.exercise.id,
            order_index: index
          })
          .select()
          .single();

        if (seError) {
          console.error('SE Error:', seError);
          continue;
        }

        const setsToInsert = ex.sets.map((s, sIndex) => ({
          session_exercise_id: seData.id,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          order_index: sIndex
        }));

        const { error: setsError } = await supabase.from('sets').insert(setsToInsert);
        if (setsError) console.error('Sets Error:', setsError);
      }

      alert('Séance enregistrée !');
      setIsWorkoutActive(false);
      setExercises([]);
      fetchHistory(); // Refresh history immediately
    } catch (e: any) {
      console.error('Finish Workout Error:', e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function createCustomExercise() {
    if (!newExName || !newExMuscle) return;
    
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: newExName,
          target_muscle: newExMuscle,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      addExerciseToWorkout(data);
      setShowCreateModal(false);
      setNewExName('');
      setNewExMuscle('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function relaunchWorkout(sessionId: string) {
    setLoading(true);
    try {
      const { data: session, error: sError } = await supabase
        .from('workout_sessions')
        .select(`
          session_exercises (
            id,
            exercise_id,
            exercise:exercises(*),
            sets (*)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sError) throw sError;

      const relaunchedExercises: WorkoutExercise[] = session.session_exercises.map(se => ({
        id: Math.random().toString(36).substr(2, 9),
        exercise: se.exercise as any,
        sets: (se.sets as any[]).sort((a,b) => a.order_index - b.order_index).map(s => ({
          id: Math.random().toString(36).substr(2, 9),
          reps: s.reps.toString(),
          weight: s.weight.toString(),
          completed: false
        }))
      }));

      setExercises(relaunchedExercises);
      setIsWorkoutActive(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {isWorkoutActive ? (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Séance en cours</Text>
            <PressableScale 
              onPress={finishWorkout} 
              disabled={saving}
              style={[styles.finishButton, { opacity: saving ? 0.5 : 1 }]}
            >
              <Text style={styles.finishButtonText}>{saving ? '...' : 'Terminer'}</Text>
            </PressableScale>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {exercises.map((ex, index) => (
              <Animated.View 
                key={ex.id}
                entering={FadeInDown.delay(index * 50)}
                layout={LinearTransition}
                style={styles.exerciseCard}
              >
                <View style={styles.exerciseHeader}>
                  <View>
                    <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                    <Text style={styles.exerciseMuscle}>{ex.exercise.target_muscle}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(ex.id)}>
                    <LucideTrash2 size={20} color={COLORS.accent.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.setsHeader}>
                  <Text style={styles.setLabel}>Série</Text>
                  <Text style={styles.setLabel}>kg</Text>
                  <Text style={styles.setLabel}>Reps</Text>
                  <View style={{ width: 30 }} />
                </View>

                {ex.sets.map((set, sIndex) => (
                  <View key={set.id} style={styles.setRow}>
                    <View style={styles.setNumberContainer}>
                      <Text style={styles.setNumberText}>{sIndex + 1}</Text>
                    </View>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                      value={set.weight}
                      onChangeText={(val) => updateSet(ex.id, set.id, 'weight', val)}
                    />
                    <TextInput
                      style={[styles.setInput, set.completed && styles.setInputCompleted]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                      value={set.reps}
                      onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)}
                    />
                    <TouchableOpacity 
                      onPress={() => toggleSetCompletion(ex.id, set.id)}
                      style={[styles.setCheck, set.completed && styles.setCheckActive]}
                    >
                      <View style={[styles.checkInner, set.completed && styles.checkInnerActive]}>
                        <LucideCheck size={14} color={set.completed ? "#FFF" : "transparent"} />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity 
                  style={styles.addSetButton} 
                  onPress={() => addSet(ex.id)}
                >
                  <LucidePlus size={16} color={COLORS.text.secondary} />
                  <Text style={styles.addSetText}>Ajouter une série</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.floatingContainer}>
            <TouchableOpacity 
              onPress={() => setShowExerciseModal(true)} 
              style={styles.floatingAddButton}
            >
              <LucidePlus size={24} color="#FFF" />
              <Text style={styles.floatingAddButtonText}>Ajouter un exercice</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Séances</Text>
          </View>
          <ScrollView contentContainerStyle={styles.emptyScrollContent}>
            {loadingHistory ? (
              <View style={{ marginTop: 60 }}>
                <ActivityIndicator color={COLORS.accent.violet} size="large" />
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: '600' }}>Chargement de tes exploits...</Text>
              </View>
            ) : recentSessions.length > 0 ? (
              <View style={styles.historySection}>
                {recentSessions.map((session, sIdx) => (
                  <Animated.View 
                    key={session.id} 
                    entering={FadeInDown.delay(sIdx * 50)}
                    style={styles.historyCard}
                  >
                    <View style={styles.historyCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyDate}>
                          {new Date(session.start_time).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.historySummary} numberOfLines={1}>
                          {session.session_exercises.length} exercices • {session.session_exercises.map((se:any) => se.exercise.name).join(', ')}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => {
                          setViewingSession(session);
                          setShowShareCard(true);
                        }}
                        style={styles.historyShareBtn}
                      >
                        <LucideShare2 size={18} color={COLORS.accent.violet} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.historyCardActions}>
                      <TouchableOpacity 
                        onPress={() => setViewingSession(session)}
                        style={styles.historyActionBtn}
                      >
                        <Text style={styles.historyActionBtnText}>Voir</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => relaunchWorkout(session.id)}
                        style={[styles.historyActionBtn, styles.historyActionBtnPrimary]}
                      >
                        <Text style={[styles.historyActionBtnText, { color: '#FFF' }]}>Recommencer</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContent}>
                <Animated.View entering={FadeInDown.springify()} style={styles.iconContainer}>
                  <LucideDumbbell size={48} color={COLORS.accent.violet} />
                </Animated.View>
                <Text style={styles.emptyTitle}>Ta bibliothèque est vide</Text>
                <Text style={styles.emptySubtitle}>Commence ta première séance pour voir tes progrès ici.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.floatingContainer}>
            <PressableScale onPress={startWorkout} style={styles.startButton}>
              <LucidePlus size={24} color="#000" />
              <Text style={styles.startButtonText}>Démarrer une séance</Text>
            </PressableScale>
          </View>
        </View>
      )}

      {/* GLOBAL MODALS */}
      <Modal visible={showExerciseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bibliothèque</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowExerciseModal(false)}>
                <LucideX size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <LucideSearch size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Chercher un exercice..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity 
              style={styles.createExerciseInline}
              onPress={() => setShowCreateModal(true)}
            >
              <LucidePlus size={18} color={COLORS.accent.violet} />
              <Text style={styles.createExerciseInlineText}>Créer un exercice personnalisé</Text>
            </TouchableOpacity>

            <View style={styles.categoriesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                {MUSCLE_GROUPS.map(muscle => (
                  <TouchableOpacity 
                    key={muscle}
                    onPress={() => setSelectedMuscle(muscle)}
                    style={[
                      styles.categoryChip, 
                      selectedMuscle === muscle && styles.categoryChipActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedMuscle === muscle && styles.categoryTextActive
                    ]}>{muscle}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {loading ? (
              <ActivityIndicator color={COLORS.accent.violet} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.exerciseListItem}
                    onPress={() => addExerciseToWorkout(item)}
                  >
                    <View style={styles.exerciseListIcon}>
                      <LucideDumbbell size={20} color={COLORS.accent.violet} />
                    </View>
                    <View>
                      <Text style={styles.exerciseListName}>{item.name}</Text>
                      <Text style={styles.exerciseListMuscle}>{item.target_muscle}</Text>
                    </View>
                    <LucideChevronRight size={20} color="#333" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ padding: SPACING.md }}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={!!viewingSession} animationType="fade" transparent>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, paddingTop: insets.top }}>
            <View style={styles.modalHeaderWide}>
              <TouchableOpacity 
                style={styles.modalCloseBtnCircle} 
                onPress={() => setViewingSession(null)}
              >
                <LucideX size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitleCenter}>Récapitulatif</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity 
                  style={styles.modalActionBtn} 
                  onPress={() => deleteSession(viewingSession.id)}
                >
                  <LucideTrash2 size={20} color="#FF4444" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalActionBtn} 
                  onPress={() => setShowShareCard(true)}
                >
                  <LucideShare2 size={20} color={COLORS.accent.violet} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
              {viewingSession && (
                <View style={styles.detailSummaryCard}>
                  <View style={styles.summaryItem}>
                    <LucideClock size={16} color={COLORS.accent.violet} />
                    <Text style={styles.summaryText}>
                      {new Date(viewingSession.start_time).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'short' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <LucideActivity size={16} color={COLORS.accent.success} />
                    <Text style={styles.summaryText}>{viewingSession.session_exercises.length} Exos</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <LucideZap size={16} color="#F59E0B" />
                    <Text style={styles.summaryText}>
                      {viewingSession.session_exercises.reduce((acc: number, se: any) => 
                        acc + se.sets.reduce((sAcc: number, s: any) => sAcc + (s.weight * s.reps), 0), 0
                      ).toLocaleString()} kg
                    </Text>
                  </View>
                </View>
              )}

              {viewingSession?.session_exercises.map((se: any, idx: number) => (
                <Animated.View 
                  key={idx} 
                  entering={FadeInDown.delay(idx * 100)}
                  style={styles.detailExerciseCard}
                >
                  <View style={styles.detailExHeader}>
                    <Text style={styles.detailExNameLarge}>{se.exercise.name}</Text>
                    <View style={styles.detailExBadge}>
                       <Text style={styles.detailExBadgeText}>{se.sets.length} séries</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailSetsList}>
                    {se.sets.sort((a:any, b:any) => a.order_index - b.order_index).map((s: any, sIdx: number) => (
                      <View key={sIdx} style={styles.detailSetRow}>
                        <Text style={styles.detailSetNum}>{sIdx + 1}</Text>
                        <Text style={styles.detailSetVal}>{s.weight}<Text style={styles.detailSetUnit}>kg</Text></Text>
                        <LucideX size={10} color="#444" />
                        <Text style={styles.detailSetVal}>{s.reps}<Text style={styles.detailSetUnit}>reps</Text></Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={styles.detailActionContainer}>
              <PressableScale 
                onPress={() => {
                  const id = viewingSession.id;
                  setViewingSession(null);
                  relaunchWorkout(id);
                }}
                style={styles.relaunchBigButton}
              >
                <LucideZap size={20} color="#000" fill="#000" />
                <Text style={styles.relaunchBigButtonText}>REFAIRE CETTE SÉANCE</Text>
              </PressableScale>
            </View>
          </View>
        </BlurView>
      </Modal>

      <Modal visible={showCreateModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.smallModalContent}>
            <Text style={styles.smallModalTitle}>Nouvel exercice</Text>
            <TextInput
              style={styles.smallModalInput}
              placeholder="Nom (ex: Curl Marteau)"
              placeholderTextColor="#666"
              value={newExName}
              onChangeText={setNewExName}
            />
            <TextInput
              style={styles.smallModalInput}
              placeholder="Muscle (ex: Biceps)"
              placeholderTextColor="#666"
              value={newExMuscle}
              onChangeText={setNewExMuscle}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={createCustomExercise}
                disabled={creating}
                style={[styles.confirmButton, { opacity: creating ? 0.5 : 1 }]}
              >
                <Text style={styles.confirmButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020205',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  finishButton: {
    backgroundColor: COLORS.accent.violet,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  finishButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  exerciseMuscle: {
    fontSize: 14,
    color: COLORS.accent.violet,
    fontWeight: '600',
    marginTop: 2,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  setLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  setNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  setInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    height: 36,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  setCheck: {
    width: 30,
    alignItems: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    gap: 8,
  },
  addSetText: {
    color: COLORS.text.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 24,
    paddingVertical: 20,
    gap: 12,
  },
  addExerciseText: {
    color: COLORS.accent.violet,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 32,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  floatingAddButton: {
    backgroundColor: COLORS.accent.violet,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.accent.violet,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingAddButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyScrollContent: {
    paddingBottom: 120,
  },
  historySection: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  historyDate: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  historySummary: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  historyCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  historyActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyActionBtnPrimary: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  historyActionBtnText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '700',
  },
  relaunchBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  relaunchBtnText: {
    color: COLORS.accent.violet,
    fontSize: 12,
    fontWeight: '700',
  },
  setInputCompleted: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    color: COLORS.accent.violet,
  },
  setCheckActive: {
    // No longer needed on parent
  },
  checkInner: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  checkInnerActive: {
    backgroundColor: COLORS.accent.success,
    borderColor: COLORS.accent.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 15,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  exerciseListIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseListName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  exerciseListMuscle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  createExerciseInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 24,
    marginTop: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  createExerciseInlineText: {
    color: COLORS.accent.violet,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  smallModalContent: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  smallModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 20,
  },
  smallModalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    color: '#FFF',
    marginBottom: 12,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.accent.violet,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '800',
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent.violet,
    borderColor: COLORS.accent.violet,
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  detailExerciseBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  detailExName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  detailSetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailSetTag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailSetText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  modalHeaderWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCloseBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitleCenter: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  detailSummaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  detailExerciseCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  detailExHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailExNameLarge: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  detailExBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailExBadgeText: {
    color: COLORS.accent.violet,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailSetsList: {
    gap: 8,
  },
  detailSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  detailSetNum: {
    color: '#444',
    fontSize: 12,
    fontWeight: '800',
    width: 20,
  },
  detailSetVal: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  detailSetUnit: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  detailActionContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  relaunchBigButton: {
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  relaunchBigButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  modalActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareCardContainer: {
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: '#0A0A0F',
    borderRadius: 40,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: COLORS.accent.violet,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  shareCardHeader: {
    marginBottom: 30,
  },
  shareCardApp: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
    textAlign: 'center',
  },
  shareCardDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  shareCardStatItem: {
    alignItems: 'center',
  },
  shareCardStatVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  shareCardStatLabel: {
    fontSize: 10,
    color: COLORS.accent.violet,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  shareCardContent: {
    flex: 1,
  },
  shareCardSectionTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  shareCardExLine: {
    marginBottom: 12,
  },
  shareCardExName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  shareCardExSets: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 2,
  },
  shareCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  shareCardFooterText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  shareCardActions: {
    marginTop: 30,
    width: '100%',
    gap: 12,
  },
  shareCardActionBtn: {
    backgroundColor: COLORS.accent.violet,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shareCardActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  historyShareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
