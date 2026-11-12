

// Tune these numbers to change recommendations. `desire` = genres that tend to help you feel this mood;
// `avoid` = genres that tend to clash when you currently feel it. These are editorial heuristics, not guarantees.
export const MOODS = [
  { id: "happy", label: "Happy", blurb: "Light and bright", desire: { comedy: 1, family: .6, adventure: .5, music: .5, animation: .4 }, avoid: [] },
  { id: "calm", label: "Calm", blurb: "Slow and soothing", desire: { documentary: .8, animation: .6, family: .5, music: .5, drama: .4, fantasy: .4 }, avoid: ["horror", "thriller", "war"] },
  { id: "sad", label: "Sad", blurb: "Heavy-hearted", desire: { drama: 1, romance: .6, music: .4, war: .3 }, avoid: ["horror", "war", "crime"] },
  { id: "stressed", label: "Stressed", blurb: "Wound up", desire: { thriller: .8, mystery: .6, horror: .4 }, avoid: ["thriller", "horror", "crime", "war"] },
  { id: "bored", label: "Bored", blurb: "Needs a spark", desire: { action: .8, adventure: .8, scifi: .7, mystery: .6, comedy: .4 }, avoid: ["documentary"] },
  { id: "lonely", label: "Lonely", blurb: "Wants warmth", desire: { romance: .5, drama: .5, comedy: .6, family: .5 }, avoid: ["horror", "thriller", "war"] },
  { id: "excited", label: "Excited", blurb: "Full of energy", desire: { action: 1, adventure: .9, scifi: .8, thriller: .7, fantasy: .6 }, avoid: [] },
  { id: "curious", label: "Curious", blurb: "Wants to learn", desire: { documentary: 1, mystery: .9, scifi: .7, history: .7, crime: .4 }, avoid: [] },
  { id: "nostalgic", label: "Nostalgic", blurb: "Looking back", desire: { family: .6, animation: .6, adventure: .6, music: .6, history: .5, comedy: .4, drama: .4, fantasy: .4 }, avoid: [] },
  { id: "romantic", label: "Romantic", blurb: "In a tender mood", desire: { romance: 1, drama: .5, comedy: .5, music: .4 }, avoid: ["horror", "war"] },
];
export const moodById = (id) => MOODS.find((m) => m.id === id);

export const EXCLUDED_BY_MATURITY = { family: ["horror", "thriller", "crime", "war"], teen: ["horror"], any: [] };
