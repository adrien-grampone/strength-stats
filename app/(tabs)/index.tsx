import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, useSharedValue, useAnimatedStyle, 
  withRepeat, withTiming, Easing 
} from 'react-native-reanimated';
import { LucideDumbbell, LucidePlay, LucideZap, LucideTrendingUp, LucideChevronRight, LucideUser, LucideActivity, LucidePlus } from 'lucide-react-native';
import { PressableScale } from '../../components/PressableScale';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop, RadialGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

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
function WeeklyCalendar() {
  const [selectedDay, setSelectedDay] = React.useState(3); // Today is index 3 (Thursday)
  
  const days = [
    { label: 'L', active: true, today: false },
    { label: 'M', active: false, today: false },
    { label: 'M', active: true, today: false },
    { label: 'J', active: false, today: true },
    { label: 'V', active: false, today: false },
    { label: 'S', active: false, today: false },
    { label: 'D', active: false, today: false },
  ];

  return (
    <View className="flex-row justify-between w-full px-6 mb-8 mt-2">
      {days.map((day, i) => (
        <TouchableOpacity 
          key={i} 
          onPress={() => setSelectedDay(i)}
          className="items-center"
          activeOpacity={0.7}
        >
          <Text className={`text-[10px] font-bold mb-2 transition-colors duration-200 ${i === selectedDay ? 'text-white' : 'text-[rgba(255,255,255,0.4)]'}`}>{day.label}</Text>
          <View className={`w-8 h-8 rounded-full items-center justify-center transition-all duration-200 ${i === selectedDay ? 'border border-[#8B5CF6] bg-[#8B5CF6]/20' : ''}`}>
             {day.active && i !== selectedDay && <View className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />}
             {i === selectedDay && <View className="w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_15px_#8B5CF6]" />}
             {!day.active && i !== selectedDay && <View className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.1)]" />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}


export default function Dashboard() {
  return (
    <View className="flex-1 bg-black">
      <BackgroundBlobs />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Sleek Top Nav */}
        <View className="px-6 pb-2 flex-row justify-between items-center z-10">
          <View className="bg-[rgba(255,255,255,0.05)] px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)]">
            <Text className="text-white font-semibold tracking-[2px] text-[10px] uppercase">Strength OS</Text>
          </View>
          <PressableScale className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] justify-center items-center border border-[rgba(255,255,255,0.1)]">
             <LucideUser size={18} color="#FFF" />
          </PressableScale>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.delay(100).springify().damping(20).mass(0.8)} className="items-center mt-6">
             {/* Weekly Calendar Tracker */}
             <WeeklyCalendar />
             {/* Ring is slightly smaller to fit better horizontally */}
             <CircularProgress progress={87} size={180} strokeWidth={10} />
          </Animated.View>

          <View className="mt-8">
            <Animated.View entering={FadeInDown.delay(200).springify().damping(20)} className="mb-10 px-6">
              <Text className="text-[rgba(255,255,255,0.4)] text-[10px] font-bold tracking-[2px] uppercase mb-3 ml-2">Séance d'aujourd'hui</Text>
              
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

                <Text className="text-white text-[32px] font-medium tracking-tighter leading-none mb-3">
                  Force Maximum
                </Text>

                <Text className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-8 font-medium">
                  Récupération nerveuse à 94%. Le volume est réduit pour maximiser ton record sur le Développé Couché (+2.5kg suggérés).
                </Text>
                
                {/* Actionable button inside the card */}
                <PressableScale className="bg-white rounded-full py-4 flex-row justify-center items-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Text className="text-black font-bold text-sm tracking-widest uppercase mr-2">Accepter & Démarrer</Text>
                  <LucidePlay size={16} color="#000" fill="#000" />
                </PressableScale>
              </View>
            </Animated.View>

            <Text className="text-[rgba(255,255,255,0.4)] text-[10px] font-bold tracking-[2px] uppercase mb-4 ml-8">Explorer</Text>
            
            {/* Horizontal Scrolling Actions */}
            <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                <ActionSquare icon={<LucidePlus size={24} color="#fff" />} title="Séance Libre" subtitle="Custom" gradient={['#8B5CF6', '#6D28D9']} />
                <ActionSquare icon={<LucideActivity size={24} color="#fff" />} title="Historique" subtitle="Records" gradient={['#06B6D4', '#0369A1']} />
                <ActionSquare icon={<LucideTrendingUp size={24} color="#fff" />} title="Statistiques" subtitle="Évolution" gradient={['#10B981', '#047857']} />
                <ActionSquare icon={<LucideDumbbell size={24} color="#fff" />} title="Exercices" subtitle="Bibliothèque" gradient={['#F59E0B', '#B45309']} />
              </ScrollView>
            </Animated.View>
          </View>

        </ScrollView>
        
        {/* Floating Action Button (Sticky Bottom) */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(20)} className="absolute bottom-10 left-6 right-6">
          <PressableScale scaleTo={0.96} className="bg-[#8B5CF6] rounded-full py-5 flex-row justify-center items-center shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-[#A78BFA]">
            <Text className="text-white font-black text-base tracking-[3px] uppercase mr-3">Commencer</Text>
            <LucideChevronRight size={20} color="#fff" strokeWidth={3} />
          </PressableScale>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

function ActionSquare({ icon, title, subtitle, gradient }: { icon: React.ReactNode, title: string, subtitle: string, gradient: string[] }) {
  return (
    <PressableScale scaleTo={0.95} className="w-36 h-40 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,25,0.5)] p-5 justify-between">
      <View className="w-12 h-12 rounded-[16px] overflow-hidden items-center justify-center">
        <View style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <SvgLinearGradient id={`boxGrad-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={gradient[0]} stopOpacity="1" />
                <Stop offset="100%" stopColor={gradient[1]} stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: gradient[0] }]} />
          </Svg>
        </View>
        {icon}
      </View>
      <View>
        <Text className="text-white text-[14px] font-bold tracking-tight mb-0.5">{title}</Text>
        <Text className="text-[rgba(255,255,255,0.4)] text-[10px] uppercase font-bold tracking-wider">{subtitle}</Text>
      </View>
    </PressableScale>
  );
}
