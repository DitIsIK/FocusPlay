export type ChallengeType = "quiz" | "poll" | "fact";

export function xpForAction(type: ChallengeType, correct = false) {
  switch (type) {
    case "quiz":
      return correct ? 10 : 0;
    case "poll":
      return 5;
    case "fact":
      return 3;
    default:
      return 0;
  }
}
