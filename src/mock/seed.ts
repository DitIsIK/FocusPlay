import { Challenge } from "@/types/challenge";
import { Theme } from "@/lib/utils";

type FactSeed = { theme: Theme; fact: string; source?: string };
type QuizSeed = {
  theme: Theme;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
};
type PollSeed = { theme: Theme; question: string; options: [string, string] | [string, string, string] };

const factSeeds: FactSeed[] = [
  { theme: "general", fact: "Powernap van 20 minuten tilt je alertheid een uur lang omhoog." },
  { theme: "general", fact: "Donkere chocolade met 70% cacao geeft een natuurlijke cafeïneboost." },
  { theme: "general", fact: "Een glas water voor je schermblok voorkomt tot 10% concentratieverlies." },
  { theme: "general", fact: "Daglicht binnen 30 minuten na wakker worden reset je slaapritme." },
  { theme: "general", fact: "Schrijven met pen activeert meer hersengebieden dan typen." },
  { theme: "sports", fact: "Sprintervalletjes van 30 seconden verhogen je VO2 max zichtbaar in zes weken." },
  { theme: "sports", fact: "Een basketbal weegt gemiddeld 624 gram; te zwaar? Laat hem even stuiteren." },
  { theme: "sports", fact: "Een ijsbad van tien minuten verkort spierpijn met zo'n twintig procent." },
  { theme: "sports", fact: "Fietsen op nuchtere maag verbrandt tot twintig procent meer vet per sessie." },
  { theme: "sports", fact: "Krachttraining drie keer per week geeft gemiddeld zeven procent meer botdichtheid." },
  { theme: "gaming", fact: "Het eerste easter egg in games zat in Adventure voor de Atari 2600 (1979)." },
  { theme: "gaming", fact: "Minecraft startte in 2009 als hobbyproject van Markus Persson." },
  { theme: "gaming", fact: "Speedrunners noemen foutloze sessies 'no-reset grinds'." },
  { theme: "gaming", fact: "Animal Crossing gebruikt een realtime interne klok voor seizoenen en events." },
  { theme: "gaming", fact: "Gamecontrollers trillen dankzij een kleine motor met excentrisch gewicht." },
  { theme: "productivity", fact: "De Pomodoro-techniek gebruikt blokken van 25 minuten focus." },
  { theme: "productivity", fact: "Een to-dolijst met maximaal vijf items verhoogt afronding met dertig procent." },
  { theme: "productivity", fact: "Inbox zero bespaart kenniswerkers gemiddeld 23 minuten per dag." },
  { theme: "productivity", fact: "Batch je notificaties en je reduceert contextswitching met veertig procent." },
  { theme: "productivity", fact: "Staand vergaderen maakt meetings gemiddeld 34% korter." }
];

const quizSeeds: QuizSeed[] = [
  {
    theme: "productivity",
    question: "Hoeveel minuten duurt een standaard Pomodoro?",
    options: ["15", "20", "25", "30"],
    answerIndex: 2
  },
  {
    theme: "general",
    question: "Welke app maakte de term 'Inbox Zero' populair?",
    options: ["Gmail", "Things", "Merlin Manns blog", "Slack"],
    answerIndex: 2
  },
  {
    theme: "productivity",
    question: "Wat is de eerste stap in Getting Things Done?",
    options: ["Organiseren", "Doen", "Verzamelen", "Reflecteren"],
    answerIndex: 2
  },
  {
    theme: "productivity",
    question: "Welke methode raadt Cal Newport aan tegen ondiep werk?",
    options: ["Rule of 52", "Time blocking", "Pareto", "Inbox Zero"],
    answerIndex: 1
  },
  {
    theme: "sports",
    question: "Hoeveel spelers staan tegelijk in een volleybalteam in het veld?",
    options: ["4", "5", "6", "7"],
    answerIndex: 2
  },
  {
    theme: "sports",
    question: "Welke afstand loop je tijdens een marathon?",
    options: ["21,1 km", "32 km", "42,195 km", "50 km"],
    answerIndex: 2
  },
  {
    theme: "sports",
    question: "Welke club won de eerste Champions League in 1956?",
    options: ["Real Madrid", "Milan", "Benfica", "Barcelona"],
    answerIndex: 0
  },
  {
    theme: "gaming",
    question: "Welke studio bouwde The Legend of Zelda: Tears of the Kingdom?",
    options: ["Retro Studios", "Nintendo EPD", "Square Enix", "Capcom"],
    answerIndex: 1
  },
  {
    theme: "gaming",
    question: "Hoeveel lijnen scoor je met een Tetris T-spin triple?",
    options: ["1", "2", "3", "4"],
    answerIndex: 2
  },
  {
    theme: "gaming",
    question: "Wat is de kleur van het zeldzaamste loot-tier in Fortnite?",
    options: ["Groen", "Blauw", "Paars", "Goud"],
    answerIndex: 3
  },
  {
    theme: "general",
    question: "Hoeveel seconden duurt de ideale powernap volgens NASA?",
    options: ["10", "12", "26", "40"],
    answerIndex: 2
  },
  {
    theme: "productivity",
    question: "Welke tool hoort niet thuis op een kanban-bord?",
    options: ["WIP-limiet", "Swimlane", "Backlog", "Gantt chart"],
    answerIndex: 3
  },
  {
    theme: "general",
    question: "Welke methode gebruikt drie bullets per dagboekpagina?",
    options: ["Morning Pages", "Bullet Journal", "5 Minute Journal", "Day One"],
    answerIndex: 1
  },
  {
    theme: "sports",
    question: "Welke zwemslag is het snelst in competitie?",
    options: ["Schoolslag", "Vlinderslag", "Rugslag", "Vrije slag"],
    answerIndex: 3
  },
  {
    theme: "gaming",
    question: "Wie is de loodgieterbroer van Mario?",
    options: ["Luigi", "Wario", "Toad", "Yoshi"],
    answerIndex: 0
  }
];

const pollSeeds: PollSeed[] = [
  { theme: "general", question: "Ochtendroutine: koud douchen of rustig koffie?", options: ["Koude douche", "Koffie eerst"] },
  { theme: "general", question: "Werken met muziek of in stilte?", options: ["Lo-fi beats", "Stilte"] },
  { theme: "general", question: "Beste snack tijdens een focusblok?", options: ["Notenmix", "Fruit"] },
  { theme: "productivity", question: "Plan je dag 's avonds of 's ochtends?", options: ["Voor het slapengaan", "Bij de eerste koffie"] },
  { theme: "productivity", question: "Task manager: digitaal of papier?", options: ["App", "Papier"] },
  { theme: "productivity", question: "Focus timer: vaste 25 min of flexibel?", options: ["Altijd 25", "Hangt van taak af"] },
  { theme: "sports", question: "Train je liever cardio of kracht?", options: ["Cardio", "Kracht"] },
  { theme: "sports", question: "Favoriete hersteltool?", options: ["Foam roller", "Stretchen"] },
  { theme: "sports", question: "Workout playlist: hiphop of techno?", options: ["Hiphop", "Techno"] },
  { theme: "gaming", question: "Console of pc voor competities?", options: ["Console", "PC"] },
  { theme: "gaming", question: "Bing je liever singleplayer of co-op?", options: ["Solo", "Co-op"] },
  { theme: "gaming", question: "FPS aim: controller of muis?", options: ["Controller", "Muis"] },
  { theme: "general", question: "Korte pauze: buiten lopen of ademhalen?", options: ["Buitenloop", "Ademhaling"] },
  { theme: "productivity", question: "Notities: Notion of Apple Notes?", options: ["Notion", "Apple Notes"] },
  { theme: "sports", question: "Hardlopen: 's ochtends vroeg of na werk?", options: ["Vroege miles", "Avondrun"] }
];

interface RawEntry {
  kind: "fact" | "quiz" | "poll";
  data: FactSeed | QuizSeed | PollSeed;
}

function interleaveSeeds(): RawEntry[] {
  const combined: RawEntry[] = [];
  let factIndex = 0;
  let quizIndex = 0;
  let pollIndex = 0;
  while (factIndex < factSeeds.length || quizIndex < quizSeeds.length || pollIndex < pollSeeds.length) {
    if (factIndex < factSeeds.length) {
      combined.push({ kind: "fact", data: factSeeds[factIndex++] });
    }
    if (quizIndex < quizSeeds.length) {
      combined.push({ kind: "quiz", data: quizSeeds[quizIndex++] });
    }
    if (pollIndex < pollSeeds.length) {
      combined.push({ kind: "poll", data: pollSeeds[pollIndex++] });
    }
  }
  return combined;
}

export function createDemoChallenges(): Challenge[] {
  const now = Date.now();
  const seeds = interleaveSeeds();
  return seeds.map((entry, index) => {
    const id = `00000000-0000-0000-0000-${(index + 1).toString().padStart(12, "0")}`;
    const createdAt = new Date(now - index * 60_000).toISOString();
    if (entry.kind === "fact") {
      const fact = entry.data as FactSeed;
      return {
        id,
        type: "fact",
        theme: fact.theme,
        content: {
          fact: fact.fact,
          ...(fact.source ? { source: fact.source } : {})
        },
        author: null,
        visibility: "global",
        team_id: null,
        created_at: createdAt
      } satisfies Challenge;
    }
    if (entry.kind === "quiz") {
      const quiz = entry.data as QuizSeed;
      return {
        id,
        type: "quiz",
        theme: quiz.theme,
        content: {
          question: quiz.question,
          options: [...quiz.options],
          answerIndex: quiz.answerIndex
        },
        author: null,
        visibility: "global",
        team_id: null,
        created_at: createdAt
      } satisfies Challenge;
    }
    const poll = entry.data as PollSeed;
    return {
      id,
      type: "poll",
      theme: poll.theme,
      content: {
        question: poll.question,
        options: [...poll.options]
      },
      author: null,
      visibility: "global",
      team_id: null,
      created_at: createdAt
    } satisfies Challenge;
  });
}

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
