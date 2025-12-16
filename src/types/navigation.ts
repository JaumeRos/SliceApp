export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: { onboardingData?: any };
  PreSignUpOnboarding: undefined;
  Onboarding: undefined;
  Main: undefined;
  Settings: undefined;
  TrackMatch: undefined;
  MatchResult: { matchData: any };
  MatchDetail: { matchId: number };
  EditProfile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Play: undefined;
  Profile: undefined;
};

