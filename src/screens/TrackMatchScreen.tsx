import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput as RNTextInput, Alert, Modal, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { H2, H3, P1, P2, Button } from '../components';
import { colors, spacing } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

const sports = [
  { id: 'tennis', name: 'Tennis', icon: 'tennis' },
  { id: 'padel', name: 'Padel', icon: 'tennis-ball' },
  { id: 'badminton', name: 'Badminton', icon: 'badminton' },
  { id: 'table-tennis', name: 'Ping Pong', icon: 'table-tennis' },
];

const courtTypes = ['Clay', 'Hard', 'Grass', 'Carpet'];
const matchTypes = ['Match', 'Practice', 'Tournament'];

// Court type colors
const getCourtTypeColor = (type: string) => {
  switch (type) {
    case 'Clay':
      return '#D2691E'; // Orange-brown for clay
    case 'Hard':
      return '#4169E1'; // Blue for hard court
    case 'Grass':
      return '#228B22'; // Green for grass
    case 'Carpet':
      return '#808080'; // Gray for carpet
    default:
      return colors.grey;
  }
};

export const TrackMatchScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState('tennis');
  const [opponentName, setOpponentName] = useState('');
  const [opponentRanking, setOpponentRanking] = useState('');
  const [opponentNameInput, setOpponentNameInput] = useState('');
  const [playerRanking] = useState('7.2');
  const [matchType] = useState<'singles' | 'doubles'>('singles');
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState('');
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const [courtType, setCourtType] = useState('Clay');
  const [location, setLocation] = useState('');
  const [selectedMatchType, setSelectedMatchType] = useState('Match');
  const [matchTitle, setMatchTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Date picker state
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Modal states
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [courtTypeModalVisible, setCourtTypeModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [matchTypeModalVisible, setMatchTypeModalVisible] = useState(false);

  const handleSetScore = (setIndex: number, type: 'player' | 'opponent', value: string) => {
    const newSets = [...sets];
    newSets[setIndex][type] = value;
    setSets(newSets);
  };

  const calculateResult = () => {
    let playerSets = 0;
    let opponentSets = 0;

    sets.forEach(set => {
      const playerScore = parseInt(set.player, 10) || 0;
      const opponentScore = parseInt(set.opponent, 10) || 0;

      if (playerScore > opponentScore) {
        playerSets++;
      }
      if (opponentScore > playerScore) {
        opponentSets++;
      }
    });

    return { playerSets, opponentSets, result: (playerSets > opponentSets ? 'win' : 'loss') as 'win' | 'loss' };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { playerSets, opponentSets, result } = calculateResult();
      
      const matchData = {
        opponentName,
        matchType,
        result,
        playerSets,
        opponentSets,
        sets: sets.filter(set => set.player && set.opponent),
        location: location || undefined,
        notes: notes || undefined,
        playedAt: selectedDate.toISOString(),
      };

      console.log('Submitting match:', matchData);
      
      const response = await api.matches.create(matchData);
      
      console.log('Match saved successfully:', response);
      
      navigation.navigate('MatchResult' as never, { 
        matchData: {
          ...matchData,
          date: matchData.playedAt,
          playerProfileImageUrl: user?.profile_image_url || undefined,
        },
        stats: response.stats,
      } as never);
    } catch (error: any) {
      console.error('Error saving match:', error);
      Alert.alert(
        'Error',
        'Failed to save match. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDuration = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '';
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}hr`;
    return `${hours}hr ${minutes}min`;
  };

  // Truncate location to show just the venue name (before first comma or colon)
  const formatLocationDisplay = (loc: string) => {
    if (!loc) return 'Select';
    // Extract just the venue name (before first comma or colon, whichever comes first)
    const match = loc.match(/^([^,:]+)/);
    return match ? match[1].trim() : loc;
  };

  // Duration picker functions
  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i);
  };

  const handleDurationConfirm = () => {
    const formatted = formatDuration(selectedHours, selectedMinutes);
    setDuration(formatted);
    setDurationModalVisible(false);
  };

  // Sync duration picker with current duration when modal opens
  useEffect(() => {
    if (durationModalVisible && duration) {
      // Parse duration string (e.g., "1hr 30min" or "30min" or "2hr")
      const hoursMatch = duration.match(/(\d+)hr/);
      const minutesMatch = duration.match(/(\d+)min/);
      const h = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const m = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
      setSelectedHours(h);
      setSelectedMinutes(m);
    } else if (durationModalVisible && !duration) {
      // Reset to 0 if no duration set
      setSelectedHours(0);
      setSelectedMinutes(0);
    }
  }, [durationModalVisible, duration]);

  // Auto-scroll to selected values when duration picker opens
  useEffect(() => {
    if (durationModalVisible) {
      // Scroll to selected hour
      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({
            y: selectedHours * 48,
            animated: true,
          });
        }
      }, 100);

      // Scroll to selected minute
      setTimeout(() => {
        if (minuteScrollRef.current) {
          minuteScrollRef.current.scrollTo({
            y: selectedMinutes * 48,
            animated: true,
          });
        }
      }, 150);
    }
  }, [durationModalVisible, selectedHours, selectedMinutes]);

  // Date picker functions
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
  };

  const handleDateConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    setSelectedDate(date);
    setDateModalVisible(false);
  };

  // Sync date picker with selectedDate when modal opens
  useEffect(() => {
    if (dateModalVisible) {
      const date = selectedDate;
      setSelectedDay(date.getDate());
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
  }, [dateModalVisible, selectedDate]);

  // Auto-scroll to selected values when date picker opens
  useEffect(() => {
    if (dateModalVisible) {
      // Scroll to selected day
      setTimeout(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const dayIndex = days.findIndex(d => d === selectedDay);
        if (dayIndex >= 0 && dayScrollRef.current) {
          dayScrollRef.current.scrollTo({
            y: dayIndex * 48,
            animated: true,
          });
        }
      }, 100);

      // Scroll to selected month
      setTimeout(() => {
        if (monthScrollRef.current) {
          monthScrollRef.current.scrollTo({
            y: selectedMonth * 48,
            animated: true,
          });
        }
      }, 150);

      // Scroll to selected year
      setTimeout(() => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);
        const yearIndex = years.findIndex(y => y === selectedYear);
        if (yearIndex >= 0 && yearScrollRef.current) {
          yearScrollRef.current.scrollTo({
            y: yearIndex * 48,
            animated: true,
          });
        }
      }, 200);
    }
  }, [dateModalVisible, selectedDay, selectedMonth, selectedYear]);

  const isValid = opponentName && sets[0].player && sets[0].opponent;

  const selectedSportData = sports.find(s => s.id === selectedSport);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Top Section with Back Arrow, Match Title and Sport Selector */}
        <View style={styles.topSection}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <View style={styles.topSectionTitles}>
            <H2 style={styles.matchTitle}>Match</H2>
            <P2 style={styles.sportSubtitle}>Sport</P2>
          </View>
          
          <TouchableOpacity 
            style={styles.sportSelector}
            onPress={() => setSportModalVisible(true)}
          >
            <View style={styles.sportSelectorLeft}>
              <Icon 
                name={selectedSportData?.icon || 'tennis'} 
                size={24} 
                color={colors.secondary} 
              />
              <P1 style={styles.sportSelectorText}>{selectedSportData?.name || 'Tennis'}</P1>
            </View>
            <Icon name="chevron-down" size={24} color={colors.grey} />
          </TouchableOpacity>
        </View>
        {/* Players Section */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Players</P2>
          <View style={styles.playersContainer}>
            {/* Player 1 - You */}
            <View style={styles.playerItem}>
              <View style={styles.flagIcon}>
                <P1 style={styles.flagEmoji}>🇪🇸</P1>
              </View>
              <P1 style={styles.playerItemName}>You</P1>
              <P1 style={styles.playerItemRanking}>{playerRanking}</P1>
            </View>

            {/* Player 2 - Opponent or Add Player */}
            {opponentName ? (
              <View style={styles.playerItem}>
                <View style={styles.flagIcon}>
                  <P1 style={styles.flagEmoji}>🇪🇸</P1>
                </View>
                <P1 style={styles.playerItemName}>{opponentName}</P1>
                <P1 style={styles.playerItemRanking}>{opponentRanking || playerRanking}</P1>
                <TouchableOpacity 
                  onPress={() => {
                    setOpponentName('');
                    setOpponentNameInput('');
                    setOpponentRanking('');
                  }}
                  style={styles.removePlayerButton}
                >
                  <Icon name="close" size={20} color={colors.grey} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.playerItem}>
                <RNTextInput
                  style={styles.addPlayerInput}
                  placeholder="Add a player"
                  placeholderTextColor={colors.grey}
                  value={opponentNameInput}
                  onChangeText={(text) => {
                    setOpponentNameInput(text);
                  }}
                  onSubmitEditing={(e) => {
                    const trimmedText = e.nativeEvent.text.trim();
                    if (trimmedText) {
                      setOpponentName(trimmedText);
                      setOpponentNameInput('');
                      Keyboard.dismiss();
                    }
                  }}
                  onBlur={() => {
                    const trimmedText = opponentNameInput.trim();
                    if (trimmedText) {
                      setOpponentName(trimmedText);
                      setOpponentNameInput('');
                    }
                  }}
                  blurOnSubmit={true}
                  returnKeyType="done"
                />
              </View>
            )}
          </View>
        </View>

        {/* Score Section */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Score</P2>
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={styles.scorePlayer}>
                <View style={styles.flagSmall}>
                  <P2 style={styles.flagEmoji}>🇪🇸</P2>
                </View>
                <P1 style={styles.scorePlayerName}>YOU</P1>
              </View>
              <View style={styles.scoreSets}>
                {sets.map((set, index) => (
                  <RNTextInput
                    key={`player-${index}`}
                    style={styles.scoreInput}
                    value={set.player}
                    onChangeText={(value) => handleSetScore(index, 'player', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                    blurOnSubmit={true}
                    returnKeyType="done"
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.scoreRow}>
              <View style={styles.scorePlayer}>
                <View style={styles.flagSmall}>
                  <P2 style={styles.flagEmoji}>🇪🇸</P2>
                </View>
                <P1 style={styles.scorePlayerName}>{opponentName || 'Player 2'}</P1>
              </View>
              <View style={styles.scoreSets}>
                {sets.map((set, index) => (
                  <RNTextInput
                    key={`opponent-${index}`}
                    style={styles.scoreInput}
                    value={set.opponent}
                    onChangeText={(value) => handleSetScore(index, 'opponent', value)}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="0"
                    placeholderTextColor={colors.lightGrey}
                    blurOnSubmit={true}
                    returnKeyType="done"
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Match Data Section */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Match Data</P2>
          <View style={styles.dataContainer}>
            <TouchableOpacity 
              style={styles.dataRow}
              onPress={() => setDateModalVisible(true)}
            >
              <View style={styles.dataRowLeft}>
                <Icon name="calendar" size={20} color={colors.grey} />
                <P2 style={styles.dataLabel}>Date</P2>
              </View>
              <View style={styles.dataRowRight}>
                <P2 style={styles.dataValue}>{formatDate(selectedDate)}</P2>
                <Icon name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dataRow}
              onPress={() => setDurationModalVisible(true)}
            >
              <View style={styles.dataRowLeft}>
                <Icon name="clock" size={20} color={colors.grey} />
                <P2 style={styles.dataLabel}>Duration</P2>
              </View>
              <View style={styles.dataRowRight}>
                <P2 style={styles.dataValue}>{duration || 'Select'}</P2>
                <Icon name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dataRow}
              onPress={() => setCourtTypeModalVisible(true)}
            >
              <View style={styles.dataRowLeft}>
                <View style={[styles.courtIcon, { backgroundColor: getCourtTypeColor(courtType) }]} />
                <P2 style={styles.dataLabel}>Court Type</P2>
              </View>
              <View style={styles.dataRowRight}>
                <P2 style={styles.dataValue}>{courtType}</P2>
                <Icon name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dataRow}
              onPress={() => setLocationModalVisible(true)}
            >
              <View style={styles.dataRowLeft}>
                <Icon name="map-marker" size={20} color={colors.grey} />
                <P2 style={styles.dataLabel}>Location</P2>
              </View>
              <View style={styles.dataRowRight}>
                <P2 
                  style={styles.dataValue} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatLocationDisplay(location)}
                </P2>
                <Icon name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dataRow}
              onPress={() => setMatchTypeModalVisible(true)}
            >
              <View style={styles.dataRowLeft}>
                <Icon name="trophy" size={20} color={colors.grey} />
                <P2 style={styles.dataLabel}>Type</P2>
              </View>
              <View style={styles.dataRowRight}>
                <P2 style={styles.dataValue}>{selectedMatchType}</P2>
                <Icon name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Title</P2>
          <View style={styles.titleCard}>
            <RNTextInput
              style={styles.titleInput}
              placeholder="Active state"
              placeholderTextColor={colors.grey}
              value={matchTitle}
              onChangeText={setMatchTitle}
            />
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <P2 style={styles.sectionLabel}>Notes</P2>
          <View style={styles.notesCard}>
            <RNTextInput
              style={styles.notesInput}
              placeholder="Multiline input is the place here. Multiline input is the place here. Multiline input is the place here."
              placeholderTextColor={colors.grey}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title={loading ? "Saving..." : "Save Match"}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          loading={loading}
          fullWidth
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Sport Selection Modal */}
      <Modal
        visible={sportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Choose a sport</H3>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportOption,
                  selectedSport === sport.id && styles.sportOptionSelected,
                ]}
                onPress={() => {
                  setSelectedSport(sport.id);
                  setSportModalVisible(false);
                }}
              >
                <Icon name={sport.icon} size={40} color={colors.secondary} />
                <P1 style={styles.sportOptionText}>{sport.name}</P1>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setDateModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.datePickerModalContent}
          >
            <View style={styles.modalHandle} />
            <H3 style={styles.actionSheetTitle}>Date</H3>
            <View style={styles.datePickerContainer}>
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={dayScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateDays().map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.datePickerItem,
                        selectedDay === day && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedDay === day && styles.datePickerItemTextSelected,
                      ]}>
                        {day}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={monthScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerItem,
                        selectedMonth === index && styles.datePickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedMonth(index);
                        // Adjust day if needed
                        const daysInMonth = new Date(selectedYear, index + 1, 0).getDate();
                        if (selectedDay > daysInMonth) {
                          setSelectedDay(daysInMonth);
                        }
                      }}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedMonth === index && styles.datePickerItemTextSelected,
                      ]}>
                        {month}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <ScrollView
                  ref={yearScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.datePickerItem,
                        selectedYear === year && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedYear === year && styles.datePickerItemTextSelected,
                      ]}>
                        {year}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.datePickerButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setDateModalVisible(false)}
                style={styles.datePickerButton}
              />
              <Button
                title="Confirm"
                onPress={handleDateConfirm}
                style={styles.datePickerButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Duration Modal */}
      <Modal
        visible={durationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDurationModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setDurationModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.datePickerModalContent}
          >
            <View style={styles.modalHandle} />
            <H3 style={styles.actionSheetTitle}>Duration</H3>
            <View style={styles.datePickerContainer}>
              {/* Hours Picker */}
              <View style={styles.datePickerColumn}>
                <P1 style={styles.datePickerColumnLabel}>Hours</P1>
                <ScrollView
                  ref={hourScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateHours().map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.datePickerItem,
                        selectedHours === hour && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedHours(hour)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedHours === hour && styles.datePickerItemTextSelected,
                      ]}>
                        {hour}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes Picker */}
              <View style={styles.datePickerColumn}>
                <P1 style={styles.datePickerColumnLabel}>Minutes</P1>
                <ScrollView
                  ref={minuteScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.datePickerScrollContent}
                >
                  {generateMinutes().map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.datePickerItem,
                        selectedMinutes === minute && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinutes(minute)}
                    >
                      <P2 style={[
                        styles.datePickerItemText,
                        selectedMinutes === minute && styles.datePickerItemTextSelected,
                      ]}>
                        {minute}
                      </P2>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={styles.datePickerButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setDurationModalVisible(false)}
                style={styles.datePickerButton}
              />
              <Button
                title="Confirm"
                onPress={handleDurationConfirm}
                style={styles.datePickerButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Court Type Modal */}
      <Modal
        visible={courtTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCourtTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Court Type</H3>
            {courtTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modalOption,
                  courtType === type && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setCourtType(type);
                  setCourtTypeModalVisible(false);
                }}
              >
                <View style={styles.modalOptionLeft}>
                  <View style={[styles.courtIcon, { backgroundColor: getCourtTypeColor(type) }]} />
                  <P1 style={styles.modalOptionText}>{type}</P1>
                </View>
                {courtType === type && (
                  <Icon name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setLocationModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.locationModalContainer}
        >
          <TouchableOpacity
            style={styles.locationModalOverlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setLocationModalVisible(false);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.locationModalContent}
            >
              {/* Header */}
              <View style={styles.locationModalHeader}>
                <View style={styles.modalHandle} />
                <H3 style={styles.locationModalTitle}>Location</H3>
              </View>

              {/* Google Places Autocomplete */}
              <View style={styles.locationInputContainer}>
                <GooglePlacesAutocomplete
                  placeholder="Search for a tennis club or location..."
                  keyboardShouldPersistTaps="handled"
                  onPress={(data) => {
                    setLocation(data.description);
                    Keyboard.dismiss();
                    setLocationModalVisible(false);
                  }}
                  query={{
                    key: config.googlePlacesApiKey,
                    language: 'en',
                    types: 'establishment',
                  }}
                  fetchDetails={false}
                  enablePoweredByContainer={false}
                  debounce={300}
                  textInputProps={{
                    returnKeyType: 'search',
                  }}
                  onFail={(error) => {
                    console.error('Google Places error:', error);
                  }}
                  styles={{
                    container: {
                      flex: 0,
                    },
                    textInputContainer: {
                      width: '100%',
                      backgroundColor: 'transparent',
                      borderTopWidth: 0,
                      borderBottomWidth: 0,
                      paddingHorizontal: 0,
                    },
                    textInput: {
                      backgroundColor: colors.hyperLightGrey,
                      borderRadius: 12,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      fontSize: 16,
                      color: colors.secondary,
                      height: 50,
                      marginLeft: 0,
                      marginRight: 0,
                    },
                    listView: {
                      backgroundColor: colors.white,
                      marginTop: spacing.sm,
                      maxHeight: 400,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.ultraLightGrey,
                    },
                    row: {
                      backgroundColor: colors.white,
                      paddingVertical: spacing.lg,
                      paddingHorizontal: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.ultraLightGrey,
                      marginVertical: 2,
                    },
                    description: {
                      color: colors.secondary,
                      fontSize: 14,
                    },
                    separator: {
                      height: 0,
                    },
                  }}
                />
              </View>

              {/* Cancel Button */}
              <TouchableOpacity 
                onPress={() => {
                  Keyboard.dismiss();
                  setLocationModalVisible(false);
                }}
                style={styles.locationCancelButton}
              >
                <P2 style={styles.locationCancelText}>Cancel</P2>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Match Type Modal */}
      <Modal
        visible={matchTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMatchTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Match Type</H3>
            {matchTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modalOption,
                  selectedMatchType === type && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setSelectedMatchType(type);
                  setMatchTypeModalVisible(false);
                }}
              >
                <P1 style={styles.modalOptionText}>{type}</P1>
                {selectedMatchType === type && (
                  <Icon name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    backgroundColor: colors.white,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: 12,
  },
  topSectionTitles: {
    marginBottom: spacing.md,
  },
  matchTitle: {
    color: colors.secondary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  sportSubtitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginTop: spacing.xs,
  },
  sportSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  playersContainer: {
    gap: spacing.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  flagIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 18,
  },
  playerItemName: {
    flex: 1,
    fontWeight: '700',
    color: colors.secondary,
    fontSize: 16,
  },
  playerItemRanking: {
    fontWeight: '700',
    color: colors.secondary,
    fontSize: 16,
  },
  removePlayerButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  addPlayerInput: {
    flex: 1,
    fontSize: 16,
    color: colors.grey,
    padding: 0,
  },
  scoreCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scorePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  flagSmall: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePlayerName: {
    fontWeight: '600',
    color: colors.secondary,
    fontSize: 14,
  },
  scoreSets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreInput: {
    width: 50,
    height: 50,
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    borderWidth: 1,
    borderColor: colors.ultraLightGrey,
  },
  dataContainer: {
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 55,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  dataRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dataRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'flex-end',
  },
  dataLabel: {
    color: colors.grey,
    fontSize: 14,
  },
  dataValue: {
    color: colors.secondary,
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  courtIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  titleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  titleInput: {
    fontSize: 16,
    color: colors.secondary,
    padding: 0,
  },
  notesCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  notesInput: {
    fontSize: 14,
    color: colors.secondary,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  locationModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  locationModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%', // Increased to give more space for results
  },
  locationModalHeader: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  locationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  locationInputContainer: {
    maxHeight: 450, // Increased height for more results
    marginBottom: spacing.md,
  },
  locationCancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 12,
  },
  locationCancelText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  autocompleteRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  autocompleteText: {
    color: colors.secondary,
    fontSize: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.lightGrey,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  sportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportOptionSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.hyperLightGrey,
  },
  sportOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.hyperLightGrey,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalTextInput: {
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.secondary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  modalText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  durationInputs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  durationInputContainer: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: spacing.sm,
  },
  durationInput: {
    backgroundColor: colors.hyperLightGrey,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
  // Date Picker Styles
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  datePickerContainer: {
    flexDirection: 'row',
    height: 240,
    marginVertical: spacing.lg,
    position: 'relative',
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerColumnLabel: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  datePickerScrollContent: {
    paddingVertical: 100,
  },
  datePickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  datePickerItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  datePickerItemText: {
    fontSize: 18,
    color: colors.grey,
    fontWeight: '400',
  },
  datePickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 20,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  datePickerButton: {
    flex: 1,
  },
});
