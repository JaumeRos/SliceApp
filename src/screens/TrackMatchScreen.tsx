import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput as RNTextInput, Alert, Modal, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { H2, H3, P1, P2, Button } from '../components';
import { colors, spacing } from '../theme';
import { api } from '../services/api';

const sports = [
  { id: 'tennis', name: 'Tennis', icon: 'tennis' },
  { id: 'padel', name: 'Padel', icon: 'tennis-ball' },
  { id: 'badminton', name: 'Badminton', icon: 'badminton' },
  { id: 'table-tennis', name: 'Ping Pong', icon: 'table-tennis' },
];

const courtTypes = ['Clay', 'Hard', 'Grass', 'Carpet'];
const matchTypes = ['Match', 'Practice', 'Tournament'];

export const TrackMatchScreen = () => {
  const navigation = useNavigation();
  const [selectedSport, setSelectedSport] = useState('tennis');
  const [opponentName, setOpponentName] = useState('');
  const [opponentRanking, setOpponentRanking] = useState('');
  const [playerRanking] = useState('7.2');
  const [matchType] = useState<'singles' | 'doubles'>('singles');
  const [sets, setSets] = useState([
    { player: '', opponent: '' },
    { player: '', opponent: '' },
    { player: '', opponent: '' },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [courtType, setCourtType] = useState('Clay');
  const [location, setLocation] = useState('');
  const [selectedMatchType, setSelectedMatchType] = useState('Match');
  const [matchTitle, setMatchTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  const formatDuration = (hours: string, minutes: string) => {
    if (!hours && !minutes) return '';
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    if (h === 0 && m === 0) return '';
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}hr`;
    return `${h}hr ${m}min`;
  };

  const isValid = opponentName && sets[0].player && sets[0].opponent;

  const selectedSportData = sports.find(s => s.id === selectedSport);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Section with Match Title and Sport Selector */}
      <View style={styles.topSection}>
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
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
                  value={opponentName}
                  onChangeText={(text) => {
                    setOpponentName(text);
                  }}
                  onSubmitEditing={(e) => {
                    if (e.nativeEvent.text.trim()) {
                      setOpponentName(e.nativeEvent.text.trim());
                      Keyboard.dismiss();
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
                  <P2 style={styles.flagEmoji}>🏳️</P2>
                </View>
                <P1 style={styles.scorePlayerName}>Player 2</P1>
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
                <View style={[styles.courtIcon, styles.courtIconClay]} />
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
                <P2 style={styles.dataValue}>{location || 'Select'}</P2>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Select Date</H3>
            <View style={styles.datePickerContainer}>
              <P2 style={styles.modalText}>Date: {formatDate(selectedDate)}</P2>
              <P2 style={styles.modalSubtext}>Date picker coming soon</P2>
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setDateModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={() => setDateModalVisible(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Duration Modal */}
      <Modal
        visible={durationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDurationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Duration</H3>
            <View style={styles.durationInputs}>
              <View style={styles.durationInputContainer}>
                <P2 style={styles.durationLabel}>Hours</P2>
                <RNTextInput
                  style={styles.durationInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={durationHours}
                  onChangeText={setDurationHours}
                />
              </View>
              <View style={styles.durationInputContainer}>
                <P2 style={styles.durationLabel}>Minutes</P2>
                <RNTextInput
                  style={styles.durationInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                />
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setDurationModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={() => {
                  setDuration(formatDuration(durationHours, durationMinutes));
                  setDurationModalVisible(false);
                }}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
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
                <P1 style={styles.modalOptionText}>{type}</P1>
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
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <H3 style={styles.modalTitle}>Location</H3>
            <RNTextInput
              style={styles.modalTextInput}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setLocationModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={() => setLocationModalVisible(false)}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
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
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ultraLightGrey,
  },
  topSectionTitles: {
    marginBottom: spacing.md,
  },
  matchTitle: {
    color: colors.secondary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
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
    padding: spacing.lg,
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
  },
  dataLabel: {
    color: colors.grey,
    fontSize: 14,
  },
  dataValue: {
    color: colors.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
  courtIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  courtIconClay: {
    backgroundColor: '#F97316',
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
  datePickerContainer: {
    marginBottom: spacing.lg,
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
});
