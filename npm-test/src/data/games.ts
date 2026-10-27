export const OCCASIONS = [
  "house-party",
  "birthday",
  "sleepover",
  "family-gathering",
  "college-event",
  "festive-gathering",
  "casual-hangout",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export const OCCASION_LABELS: Record<Occasion, string> = {
  "house-party": "House party",
  birthday: "Birthday",
  sleepover: "Sleepover",
  "family-gathering": "Family gathering",
  "college-event": "College event",
  "festive-gathering": "Festive gathering",
  "casual-hangout": "Casual hangout",
};

export const GAME_TYPES = [
  "icebreaker",
  "social-deduction",
  "performance",
  "creative",
  "trivia",
  "word-game",
  "roleplay",
  "drawing",
] as const;

export type GameType = (typeof GAME_TYPES)[number];

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  icebreaker: "Icebreaker",
  "social-deduction": "Social deduction",
  performance: "Performance",
  creative: "Creative",
  trivia: "Trivia",
  "word-game": "Word game",
  roleplay: "Roleplay",
  drawing: "Drawing",
};

export const GAME_STYLES = [
  "funny",
  "strategic",
  "creative",
  "social-deduction",
  "trivia",
  "relaxed",
] as const;

export type GameStyle = (typeof GAME_STYLES)[number];

export const GAME_STYLE_LABELS: Record<GameStyle, string> = {
  funny: "Funny",
  strategic: "Strategic",
  creative: "Creative",
  "social-deduction": "Social deduction",
  trivia: "Trivia",
  relaxed: "Relaxed",
};

export const DIFFICULTIES = ["easy", "medium", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy to teach",
  medium: "A little setup",
  advanced: "Host-led",
};

export const PLAYER_AGE_GROUPS = [
  { value: "8", label: "Family · 8+", description: "Suitable with an 8-year-old at the table." },
  { value: "13", label: "Teens · 13+", description: "Suitable with a 13-year-old at the table." },
  { value: "18", label: "Adults · 18+", description: "All games, including grown-up themes." },
] as const;

export type ArtTheme =
  | "paper"
  | "night"
  | "forest"
  | "stage"
  | "notes"
  | "manor"
  | "amber"
  | "grid"
  | "buzzer"
  | "fold";

export interface GameRule {
  title: string;
  detail: string;
}

export interface OfflineGame {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: GameType;
  format: "offline";
  minPlayers: number;
  maxPlayers: number;
  minAge: number;
  durationMinutes: number;
  difficulty: Difficulty;
  occasions: Occasion[];
  styles: GameStyle[];
  materials: string[];
  setup: string;
  rules: GameRule[];
  howToWin: string;
  variations: string[];
  hostTip: string;
  artTheme: ArtTheme;
  featured?: boolean;
}

export const games: OfflineGame[] = [
  {
    slug: "two-truths-and-a-lie",
    title: "Two Truths and a Lie",
    tagline: "Three statements. One bluff.",
    description:
      "The classic getting-to-know-you game, with just enough detective work to keep it interesting. Everyone shares three statements about themselves — two true, one invented — and the table votes on the lie.",
    type: "icebreaker",
    format: "offline",
    minPlayers: 3,
    maxPlayers: 12,
    minAge: 8,
    durationMinutes: 15,
    difficulty: "easy",
    occasions: ["house-party", "birthday", "sleepover", "family-gathering", "college-event", "casual-hangout"],
    styles: ["funny", "relaxed"],
    materials: ["Small slip of paper and pen per player (or a private notes app)"],
    setup: "Give everyone a slip of paper and a pen. Decide whether you are keeping score or just playing for the conversation.",
    rules: [
      {
        title: "Write your three statements",
        detail:
          "Each player privately writes two true things about themselves and one plausible lie. Keep the statements specific enough to be interesting, but not so obscure that nobody can join in.",
      },
      {
        title: "Read them aloud",
        detail:
          "One at a time, each player reads all three statements without saying which are true. Try to deliver them in the same tone so the lie does not announce itself.",
      },
      {
        title: "Vote on the bluff",
        detail:
          "Everyone else votes for the statement they believe is the lie. Count hands, or point to the number you choose at the same time.",
      },
      {
        title: "Reveal and score",
        detail:
          "The storyteller reveals the lie. Every player who voted correctly gets one point. If nobody guesses the lie, the storyteller gets two points.",
      },
      {
        title: "Pass the turn",
        detail:
          "Continue clockwise until everyone has shared their three statements. Compare scores after the final reveal — or ignore them completely.",
      },
    ],
    howToWin:
      "The player with the most points after every turn wins. To keep it purely social, play without scores and simply let the best stories start the next conversation.",
    variations: [
      "Speed round: one true fact and one lie, with a 20-second limit.",
      "Team version: a team writes the three statements together and the other team votes.",
      "Theme it: music, travel tales, or the most unusual job anyone has had.",
    ],
    hostTip:
      "Put a gentle limit on sensitive topics before the first turn. The best version of this game reveals surprising, kind things — not secrets nobody wanted to share.",
    artTheme: "paper",
    featured: true,
  },
  {
    slug: "mafia",
    title: "Mafia",
    tagline: "Someone at this table is lying.",
    description:
      "A town full of ordinary villagers is hiding a small mafia. Between nights of secret choices, the table debates, accuses, and votes — and the mafia try to blend in long enough to take control.",
    type: "social-deduction",
    format: "offline",
    minPlayers: 6,
    maxPlayers: 16,
    minAge: 13,
    durationMinutes: 40,
    difficulty: "medium",
    occasions: ["house-party", "sleepover", "college-event", "casual-hangout", "festive-gathering"],
    styles: ["strategic", "social-deduction", "funny"],
    materials: ["One playing card or folded paper role card per player", "A timer or phone stopwatch"],
    setup:
      "Choose a moderator who will run the night phase and will not play. Prepare role cards: for 6–8 players use two mafia; for 9–16 use three mafia. Add one detective and one doctor, then fill the remaining cards with villagers. Deal one card face-down to every player.",
    rules: [
      {
        title: "Look at your role — quietly",
        detail:
          "Everyone checks their own card without showing it. Mafia should know who the other mafia are; the detective and doctor keep their roles secret.",
      },
      {
        title: "Night falls",
        detail:
          "The moderator asks everyone to close their eyes. The mafia open their eyes, agree silently on one victim, and close them again. The doctor then chooses one player to protect, and the detective points to one player and learns whether they are mafia.",
      },
      {
        title: "Day breaks",
        detail:
          "Everyone opens their eyes. The moderator reveals who was killed (the doctor's protected player survives). The killed player is out of the game but may stay as a quiet observer.",
      },
      {
        title: "Discuss and accuse",
        detail:
          "Give the table three to five minutes to compare stories, defend themselves, and build a case. The mafia will be doing the same thing for very different reasons.",
      },
      {
        title: "Vote someone out",
        detail:
          "Count votes aloud. The player with the most votes is eliminated and reveals their role. A tied vote means nobody is eliminated — or the moderator can ask for a one-minute runoff.",
      },
      {
        title: "Repeat until one side wins",
        detail:
          "Run another night and day. Keep the pace brisk: short nights, focused discussion, decisive votes.",
      },
    ],
    howToWin:
      "Villagers win when every mafia member has been eliminated. Mafia win when their numbers equal or exceed the number of remaining villagers, because they can no longer be outvoted.",
    variations: [
      "Add a second detective for 12+ players to keep information moving.",
      "No-moderator variant: use a trusted role app or have the moderator also play as a villager, with eyes closed during night actions.",
      "Short game: remove the doctor and play with villagers, mafia, and a single detective.",
    ],
    hostTip:
      "The moderator is the engine of the game. Set a discussion timer before every day phase and cut off circular arguments with a clear call to vote.",
    artTheme: "night",
    featured: true,
  },
  {
    slug: "werewolf",
    title: "Werewolf",
    tagline: "The village has a secret after dark.",
    description:
      "A story-driven social deduction game for a bigger table. By day the village searches for werewolves; by night the werewolves choose a victim, while a seer and healer work in secret.",
    type: "social-deduction",
    format: "offline",
    minPlayers: 6,
    maxPlayers: 18,
    minAge: 12,
    durationMinutes: 45,
    difficulty: "medium",
    occasions: ["house-party", "sleepover", "college-event", "festive-gathering", "family-gathering"],
    styles: ["social-deduction", "strategic", "funny"],
    materials: ["Role cards or folded paper slips", "A timer", "Optional: a small notebook for the moderator"],
    setup:
      "Appoint one moderator who does not play. For 6–9 players use two werewolves; for 10–18 use three. Add one seer and one healer, then fill all remaining cards with villagers. Deal the cards face-down.",
    rules: [
      {
        title: "Meet your role",
        detail:
          "Everyone secretly checks their card. Werewolves know each other. The seer can identify one player's role each night. The healer can protect one player each night.",
      },
      {
        title: "The village sleeps",
        detail:
          "The moderator calls the village to sleep and asks everyone to close their eyes. Werewolves wake, choose a victim, and sleep. The healer wakes and chooses someone to protect. The seer wakes and checks one player, receiving a silent yes or no for 'werewolf?'.",
      },
      {
        title: "Morning report",
        detail:
          "The moderator tells the village what happened overnight. A protected target survives; otherwise the chosen victim is out. The moderator should keep the narrative atmospheric but the facts clear.",
      },
      {
        title: "Discuss and vote",
        detail:
          "The village has a timed discussion. Each living player may speak once before the vote. Then everyone votes to banish one suspect. Ties are settled by a two-minute runoff or by no banishment.",
      },
      {
        title: "Continue the cycle",
        detail:
          "Repeat night and day. Eliminated players reveal their roles and become silent observers. The moderator checks the win condition after every elimination.",
      },
    ],
    howToWin:
      "The village wins by eliminating all werewolves. The werewolves win once their number equals or exceeds the number of other living players.",
    variations: [
      "Add a hunter who may eliminate one other player when banished.",
      "Family-friendly version: remove the killing language and call the night action 'stealing the village's lantern'.",
      "Quick village: use only villagers, werewolves, and a seer for groups learning the game.",
    ],
    hostTip:
      "Use the moderator's calls to create rhythm: 'Village, sleep. Werewolves, wake.' Keep each night action to ten seconds so the game does not lose its momentum.",
    artTheme: "forest",
    featured: true,
  },
  {
    slug: "charades",
    title: "Charades",
    tagline: "A little acting. A lot of guessing.",
    description:
      "The party game that needs no explanation — though it does need a few good prompts. Split into teams, act out words and phrases without speaking, and race the clock.",
    type: "performance",
    format: "offline",
    minPlayers: 4,
    maxPlayers: 16,
    minAge: 8,
    durationMinutes: 25,
    difficulty: "easy",
    occasions: ["house-party", "birthday", "family-gathering", "festive-gathering", "casual-hangout", "sleepover"],
    styles: ["funny", "creative", "relaxed"],
    materials: ["Small slips of paper", "Two pens", "A bowl or hat", "A phone timer"],
    setup:
      "Divide into two teams. Each player writes three prompts and folds them into the bowl. Prompts can be films, songs, actions, or shared references — keep them guessable for the whole room.",
    rules: [
      {
        title: "Pick your actor",
        detail:
          "The first team sends one player to act. They draw a slip without showing it to anyone. Set a 60-second timer.",
      },
      {
        title: "Act it out — no words",
        detail:
          "The actor may gesture, point, and mouth silently, but cannot speak, write, or use props. The team calls out guesses as often as they like.",
      },
      {
        title: "Score the round",
        detail:
          "One point for every prompt the team guesses. If the actor gets stuck, they may pass once; a passed prompt goes back into the bowl.",
      },
      {
        title: "Swap sides",
        detail:
          "The other team takes a turn with a new actor and a fresh minute. Alternate turns for a set number of rounds, or keep playing until both teams have had four turns.",
      },
      {
        title: "Finish the bowl",
        detail:
          "When the bowl is empty, the team with the most points wins. For a longer game, write a second batch of prompts and play again.",
      },
    ],
    howToWin: "The team with the highest score after the agreed number of rounds wins.",
    variations: [
      "Three rounds: act normally in round one, use only one repeated gesture in round two, and hum a tune in round three.",
      "Reverse charades: the whole team acts and one guesser tries to name the prompt.",
      "Silent movie: the actor must keep a straight face while the other team tries to make them laugh.",
    ],
    hostTip:
      "Write prompts ahead of time if the group includes younger players or people who do not know each other. A good prompt is familiar but not too easy.",
    artTheme: "stage",
  },
  {
    slug: "who-am-i",
    title: "Who Am I?",
    tagline: "Twenty questions, one hidden identity.",
    description:
      "A sticky note, a famous name, and a table full of yes-or-no questions. Everyone knows who you are except you. Work out your identity before the room runs out of patience.",
    type: "icebreaker",
    format: "offline",
    minPlayers: 3,
    maxPlayers: 12,
    minAge: 8,
    durationMinutes: 15,
    difficulty: "easy",
    occasions: ["family-gathering", "sleepover", "birthday", "casual-hangout", "college-event", "festive-gathering"],
    styles: ["funny", "relaxed", "creative"],
    materials: ["Sticky notes or small pieces of paper", "Tape or a pen", "One pen per player"],
    setup:
      "Write a well-known person, character, or historical figure on a note without letting its owner see it. Stick one note to each player's forehead or back. Agree on the universe of names: anyone real or fictional, or a specific theme.",
    rules: [
      {
        title: "Ask a yes-or-no question",
        detail:
          "The first player asks anyone at the table one question about their identity. Questions must have a yes or no answer — 'Am I a musician?' rather than 'Who am I?'.",
      },
      {
        title: "Yes means another turn",
        detail:
          "If the answer is yes, the player keeps asking. If the answer is no, the turn passes to the next player.",
      },
      {
        title: "Guess your identity",
        detail:
          "At the start of your turn, you may make a guess instead of asking a question. If you are right, turn your note around and score one point. If you are wrong, your turn ends.",
      },
      {
        title: "Help without spoiling",
        detail:
          "Answer truthfully and keep clues broad. Nobody may mouth the name, point at the person, or give an answer that is technically true but misleading.",
      },
      {
        title: "Finish the round",
        detail:
          "Continue until everyone has guessed or two questions have gone all the way around the table. Players who do not guess may keep asking until the round ends.",
      },
    ],
    howToWin:
      "The player with the most correct guesses wins. For a cooperative version, see how quickly the whole table can identify every name.",
    variations: [
      "Theme it: film characters, animals, or people everyone in the room knows.",
      "Pair version: two players share one identity and ask questions together.",
      "Hard mode: answers may only be 'yes' or 'no', with no hints, gestures, or facial expressions.",
    ],
    hostTip:
      "Choose names the whole table can reasonably guess. A mix of one obvious celebrity and one niche favorite keeps the round lively.",
    artTheme: "notes",
  },
  {
    slug: "murder-mystery",
    title: "Murder Mystery",
    tagline: "An evening of secrets, clues, and suspicious company.",
    description:
      "A host-led roleplay game for a committed group. Everyone receives a character, a secret, and something to hide. Over three acts, the table interviews, eavesdrops, and finally names the culprit.",
    type: "roleplay",
    format: "offline",
    minPlayers: 6,
    maxPlayers: 12,
    minAge: 14,
    durationMinutes: 120,
    difficulty: "advanced",
    occasions: ["house-party", "birthday", "festive-gathering", "college-event", "family-gathering"],
    styles: ["creative", "strategic", "social-deduction"],
    materials: [
      "A ready-made murder mystery kit, or host-written character sheets",
      "Sealed clue envelopes",
      "Name cards or labels",
      "Notebook and pen per player",
      "Optional: simple props and a timer",
    ],
    setup:
      "This game works best with preparation. Choose a setting — a 1920s dinner party, a village fete, a spaceship — and prepare one character sheet for each player. Every sheet should include a public bio, one secret, one goal, and one piece of information only that player knows. The host keeps the solution in a separate envelope. Send characters out 24 hours ahead if you can, so players arrive ready to roleplay.",
    rules: [
      {
        title: "Arrive in character",
        detail:
          "Players read their name card and public bio aloud. Keep secrets face-down. The host introduces the victim and the central question: who did it, how, and why?",
      },
      {
        title: "Act one — introductions",
        detail:
          "Each character shares their relationship to the victim and one public suspicion. The host distributes the first round of clues at the end of the act.",
      },
      {
        title: "Act two — private conversations",
        detail:
          "Players pair up for short private chats, trade information, and pursue their own goals. The host circulates with additional clues and can nudge stalled conversations with a new piece of evidence.",
      },
      {
        title: "Act three — the case",
        detail:
          "The group reconvenes. Each player may present one accusation and one piece of supporting evidence. Secrets may be exposed, alliances may shift, and the host keeps the facts consistent.",
      },
      {
        title: "Make your accusation",
        detail:
          "Every player writes down a suspect and a motive. The host reveals the true solution and reads the final clues aloud. Award a point for the correct suspect and a second point for the correct motive.",
      },
    ],
    howToWin:
      "The sharpest detective wins by naming both the culprit and the motive. Also give a small prize for best in-character performance so quieter players have something to play for.",
    variations: [
      "Potluck format: assign each character a dish to bring that hints at their backstory.",
      "Two-act version: cut private conversations and reveal one extra clue between acts for a 75-minute game.",
      "DIY format: start with a simple six-character template and let each player invent their own secret within the host's solution.",
    ],
    hostTip:
      "Do not make the solution depend on one obscure clue. Plant at least three paths to the truth, and keep a one-page timeline for yourself so you can answer questions without contradicting the story.",
    artTheme: "manor",
  },
  {
    slug: "never-have-i-ever",
    title: "Never Have I Ever",
    tagline: "The confessions are optional. The laughter is not.",
    description:
      "A loose, conversational party game built around shared experiences. Keep it playful and age-appropriate: the point is to learn surprising things about each other, not to put anyone on the spot.",
    type: "icebreaker",
    format: "offline",
    minPlayers: 4,
    maxPlayers: 12,
    minAge: 16,
    durationMinutes: 20,
    difficulty: "easy",
    occasions: ["college-event", "house-party", "sleepover", "birthday", "casual-hangout"],
    styles: ["funny", "relaxed"],
    materials: ["Five tokens or coins per player", "Optional: a bowl for returned tokens"],
    setup:
      "Agree on a comfort level before the first prompt. Keep the default version free of alcohol and invasive questions. Give everyone five tokens — these are your 'I have done that' tokens.",
    rules: [
      {
        title: "Set the tone",
        detail:
          "Explain that anyone may skip a prompt without explanation, and that nobody has to reveal details. The goal is a lively, consensual conversation.",
      },
      {
        title: "Make a statement",
        detail:
          "Going around the table, one player says: 'Never have I ever…' and completes it with something they have not done. Keep statements light and universally understandable.",
      },
      {
        title: "Spend a token",
        detail:
          "Everyone who has done the thing places one token in the bowl. If a player has not done it, they keep their token. Do not police someone's answer — honesty is part of the game.",
      },
      {
        title: "Pass the prompt",
        detail:
          "The next player makes a statement. Rotate until everyone has asked at least twice, or until the tokens are nearly gone.",
      },
      {
        title: "Finish gently",
        detail:
          "The player holding the most tokens wins. If the stories are better than the score, skip the winner and end with a final round of positive 'I have' statements.",
      },
    ],
    howToWin: "The player with the most tokens remaining wins — or play without a winner and let the best story close the game.",
    variations: [
      "Wholesome round: every statement must be something you are glad you have done.",
      "Team version: two teams share a token pool and answer together.",
      "Anonymous prompts: everyone submits one printed prompt and the host reads them aloud.",
    ],
    hostTip:
      "Read the room. If the energy shifts from laughing to uncomfortable, change the prompt style immediately. A good host protects the fun of the quietest person at the table.",
    artTheme: "amber",
  },
  {
    slug: "categories-word-association",
    title: "Categories / Word Association",
    tagline: "Fast words, no repeats.",
    description:
      "A no-materials brain game that escalates quickly. Name something in the category, pass the turn, and try not to be the first person to freeze, repeat, or invent a word that does not exist.",
    type: "word-game",
    format: "offline",
    minPlayers: 3,
    maxPlayers: 10,
    minAge: 8,
    durationMinutes: 15,
    difficulty: "easy",
    occasions: ["family-gathering", "casual-hangout", "sleepover", "college-event", "birthday", "festive-gathering"],
    styles: ["funny", "relaxed", "strategic"],
    materials: ["A phone timer (optional)"],
    setup:
      "Choose the first category — something broad enough to have many answers, such as 'things in a kitchen', 'countries', or 'songs by one artist'. Decide whether a timer is in play; three to five seconds per answer keeps the pace sharp.",
    rules: [
      {
        title: "Choose a category",
        detail:
          "Pick one player to name the first category. Everyone must answer inside that category for the whole round.",
      },
      {
        title: "Name one answer",
        detail:
          "Going clockwise, each player says one valid answer. Answers must be in the category and may not be repeated during the round.",
      },
      {
        title: "Stay inside the lines",
        detail:
          "The group decides questionable answers together by a quick majority vote. An answer that is clearly outside the category, a duplicate, or too vague is a miss.",
      },
      {
        title: "Sit out a miss",
        detail:
          "A player who misses, freezes, or repeats an answer is out for the rest of the round. The next player continues with a new answer.",
      },
      {
        title: "Start the next category",
        detail:
          "When only one player remains, they choose the next category and the eliminated players rejoin. Play until someone has won two rounds.",
      },
    ],
    howToWin:
      "The last player standing in each round earns a point; the first player to win two rounds takes the game.",
    variations: [
      "Chain version: each answer must start with the last letter of the previous answer.",
      "Alphabet round: answers must follow A, B, C, and so on around the table.",
      "Team relay: teams alternate answers and have five seconds to respond; a miss gives the other team a chance to steal.",
    ],
    hostTip:
      "Pick categories with plenty of everyday answers. The game is funniest when the pressure is the obstacle, not obscure trivia.",
    artTheme: "grid",
  },
  {
    slug: "team-trivia",
    title: "Team Trivia",
    tagline: "Small teams, big opinions.",
    description:
      "A host-run quiz for the whole room. Build teams, work through themed rounds, and decide together whether you are confident — or just confident enough to guess.",
    type: "trivia",
    format: "offline",
    minPlayers: 4,
    maxPlayers: 20,
    minAge: 10,
    durationMinutes: 45,
    difficulty: "medium",
    occasions: ["family-gathering", "house-party", "college-event", "festive-gathering", "birthday"],
    styles: ["trivia", "strategic", "funny"],
    materials: ["A set of trivia questions", "Answer sheets and pens", "A timer", "Optional: small prizes"],
    setup:
      "Choose one quizmaster who reads questions and keeps score but does not play. Split the room into teams of two to five. Prepare five rounds of about five questions each, mixing easy, medium, and one tricky question per round.",
    rules: [
      {
        title: "Build your teams",
        detail:
          "Teams choose a name and appoint one writer. Teams may discuss every answer together, but only the writer's final answer counts.",
      },
      {
        title: "Read one question at a time",
        detail:
          "The quizmaster reads the question and starts a 20-second timer. Teams write their answer silently on their sheet.",
      },
      {
        title: "Score the round",
        detail:
          "At the end of five questions, teams swap sheets and mark answers. One point for each correct answer; the quizmaster handles ties and near-misses with a clear ruling.",
      },
      {
        title: "Add a final wager",
        detail:
          "Before the last round, each team secretly writes a wager equal to some or all of its current points. A correct final answer adds the wager; a wrong answer subtracts it.",
      },
      {
        title: "Crown the winners",
        detail:
          "Total the final scores and announce the winners. Keep the last round to one question only so the wager feels decisive rather than punishing.",
      },
    ],
    howToWin:
      "The team with the most points after the final wager wins. If two teams tie, give both a sudden-death question with no discussion.",
    variations: [
      "Picture round: include a short visual round using printed images or album covers.",
      "Family-friendly mix: give younger players a double-point question each round.",
      "No wager version: keep the game purely cumulative for a gentler finish.",
    ],
    hostTip:
      "Test the questions on one person who is not playing. If a question has two defensible answers, replace it before game night.",
    artTheme: "buzzer",
  },
  {
    slug: "paper-telephone",
    title: "Paper Telephone / Drawing Telephone",
    tagline: "Watch a simple sentence become a masterpiece.",
    description:
      "A sentence turns into a drawing, the drawing into a caption, and the caption into something entirely different. A creative, low-pressure game for anyone who claims they cannot draw.",
    type: "drawing",
    format: "offline",
    minPlayers: 4,
    maxPlayers: 12,
    minAge: 10,
    durationMinutes: 30,
    difficulty: "easy",
    occasions: ["sleepover", "birthday", "family-gathering", "college-event", "casual-hangout", "house-party"],
    styles: ["creative", "funny", "relaxed"],
    materials: ["One sheet of blank paper per player", "A pen or pencil per player", "A timer (optional)"],
    setup:
      "Give everyone a sheet of paper and a pen. Each player folds the paper into sections — one section per person plus one starting section — or simply folds the paper over after each turn so only the latest work is visible.",
    rules: [
      {
        title: "Write a prompt",
        detail:
          "At the top of your sheet, write a short, concrete scene or sentence — 'a cat in a bowler hat' or 'the world's worst picnic'. Fold the paper so only the newest clue is visible, then pass it to the left.",
      },
      {
        title: "Draw the sentence",
        detail:
          "Read the sentence you received and draw it in the next section. Do not add explanatory words. Fold the sentence away so only your drawing is visible, then pass again.",
      },
      {
        title: "Caption the drawing",
        detail:
          "Look at the drawing and write one sentence describing what you see. Fold the drawing away, pass, and repeat: draw, caption, draw, caption.",
      },
      {
        title: "Unfold the story",
        detail:
          "After every player has contributed once, open each sheet fully. Read it from top to bottom and enjoy all the places the original sentence has been.",
      },
      {
        title: "Pick the favourite",
        detail:
          "The group votes for the funniest page or most surprising transformation. A simple show of hands is enough; no scoring system is required.",
      },
    ],
    howToWin:
      "There are no points in the classic version — play for the reveal. If you want a winner, award one point for the most accurate interpretation and one for the funniest, then add them up.",
    variations: [
      "Theme round: every prompt must involve one shared character.",
      "Team relay: teams complete a sheet together and compete for the best final image.",
      "Speed version: limit each draw to 60 seconds and each caption to 20 seconds.",
    ],
    hostTip:
      "Hand out papers with generous sections and pass on a clear signal. The reveal is the payoff, so keep the final unfold slow and let every page get a reaction.",
    artTheme: "fold",
    featured: true,
  },
];

export const GAME_COUNT = games.length;

export function getGameBySlug(slug: string): OfflineGame | undefined {
  return games.find((game) => game.slug === slug);
}

export function formatPlayers(min: number, max: number): string {
  return min === max ? `${min} players` : `${min}–${max} players`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

export function getOccasionLabel(occasion: Occasion): string {
  return OCCASION_LABELS[occasion];
}
