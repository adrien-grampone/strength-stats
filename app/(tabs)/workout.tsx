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
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  LucidePlus, 
  LucideTrash2, 
  LucideCheck, 
  LucideSearch, 
  LucideChevronRight, 
  LucideDumbbell, 
  LucideX 
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { PressableScale } from '../../components/PressableScale';
import { COLORS, RADIUS, SPACING } from '../../theme/tokens';
import { Database } from '../../lib/database.types';

type Exercise = Database['public']['Tables']['exercises']['Row'];

interface Set {
  id: string;
  reps: string;
  weight: string;
}

interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: Set[];
}

const MUSCLE_GROUPS = ['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
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

  // Fetch exercises from Supabase
  useEffect(() => {
    if (showExerciseModal) {
      fetchExercises();
    }
  }, [showExerciseModal]);

  async function fetchExercises() {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (data) setAvailableExercises(data);
    setLoading(false);
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
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
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

      // 1. Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          status: 'completed'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

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

        if (seError) continue;

        const setsToInsert = ex.sets.map((s, sIndex) => ({
          session_exercise_id: seData.id,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          order_index: sIndex
        }));

        await supabase.from('sets').insert(setsToInsert);
      }

      alert('Séance enregistrée !');
      setIsWorkoutActive(false);
      setExercises([]);
    } catch (e: any) {
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

  if (!isWorkoutActive) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <Animated.View entering={FadeInDown.springify()} style={styles.iconContainer}>
            <LucideDumbbell size={48} color={COLORS.accent.violet} />
          </Animated.View>
          <Text style={styles.emptyTitle}>Prêt pour la séance ?</Text>
          <Text style={styles.emptySubtitle}>Tes records n'attendent que toi.</Text>
          <PressableScale onPress={startWorkout} style={styles.startButton}>
            <Text style={styles.startButtonText}>Démarrer une séance</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <>
    <SafeAreaView style={styles.container}>
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
                  style={styles.setInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                  value={set.reps}
                  onChangeText={(val) => updateSet(ex.id, set.id, 'reps', val)}
                />
                <View style={styles.setCheck}>
                  <LucideCheck size={16} color={COLORS.accent.success} />
                </View>
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

        <TouchableOpacity 
          onPress={() => setShowExerciseModal(true)} 
          style={styles.addExerciseButton}
        >
          <LucidePlus size={24} color={COLORS.accent.violet} />
          <Text style={styles.addExerciseText}>Ajouter un exercice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

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

      {/* CREATE CUSTOM EXERCISE MODAL */}
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
    </>
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
    paddingVertical: SPACING.md,
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
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: '#FFF',
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
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
});
