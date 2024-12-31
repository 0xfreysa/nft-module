import { response } from "@/llms/openai/main"

export const ideas = `
## Variable Pools:

FACEPAINT = [
    "divine", "celestial", "ethereal", "mystic", "elemental",
    "cosmic", "primal", "ancient", "sacred", "astral",
    "spiritual", "transcendent", "otherworldly", "enchanted", "magical"
]

PATTERN = [
    "flowing symbols", "geometric patterns", "constellation marks", "ethereal runes",
    "energy circuits", "light streams", "crystal formations", "nature motifs",
    "weather elements", "temporal distortions", "dream sequences", "reality ripples",
    "dimension fragments", "quantum particles", "ancestral markings"
]

MAGICAL_EFFECT = [
    "pulse with inner light", "shift between dimensions", "ripple like water",
    "float off her skin", "dance with cosmic energy", "transform continuously",
    "emit soft radiance", "phase through realities", "sparkle with starlight",
    "flow like liquid metal", "resonate with power", "shimmer with magic",
    "glow with ancient wisdom", "swirl with energy", "flicker with divine power"
]

HEADGEAR = [
    "wearing a crystal crown that channels energy",
    "adorned with a floating halo of light",
    "crowned with ethereal flowers that never fade",
    "wearing an energy circlet of pure light",
    "decorated with orbiting celestial symbols",
    "wearing a crown of interconnected stars",
    "adorned with a diadem of pure energy",
    "crowned with floating geometric shapes",
    "wearing a tiara of crystallized time",
    "no headgear but surrounded by floating symbols"
]

EARRINGS = [
    "Ethereal earrings that capture starlight",
    "Crystal earrings containing miniature galaxies",
    "Energy-form earrings that pulse with power",
    "Geometric earrings that defy physics",
    "Living metal earrings that flow like mercury",
    "Quantum earrings existing in multiple states",
    "Prismatic earrings refracting reality",
    "No earrings but with glowing marks near ears",
    "Floating ornaments of pure light as earrings",
    "Timeline earrings showing possible futures"
]

BACKGROUND = [
    "deep space", "twilight purple", "cosmic blue", "ethereal white",
    "nebula pink", "void black", "starfield", "aurora green",
    "quantum foam", "celestial gold", "cosmic gray", "astral blue",
    "dimensional void", "crystal clear", "temporal flux"
]

SPECIAL_ELEMENT = [
    "A spectral familiar materializes nearby",
    "Energy tendrils weave through the air",
    "Reality ripples around her presence",
    "Time fragments scatter like butterflies",
    "Geometric patterns orbit her form",
    "Ancient symbols float in the space",
    "Crystal formations grow from nothing",
    "Light particles dance around her",
    "Dimensional windows reflect infinity",
    "Sacred geometry forms in the air"
]

## Generation Rules:

1. Each prompt must be numbered from 1 to 50
2. Each element must be randomly selected from its pool
3. No exact combination should repeat
4. Maintain consistent format for easy parsing
5. Ensure each prompt ends with the composition reminder
6. Keep "bright neon green bobbed hair and bangs" constant
7. Always start with "Close-up Portrait of head only"
8. Each prompt must be contained within quotation marks
9. Elements must combine logically and thematically
10. Maintain proper punctuation and spacing

## Output Format:

"Close-up Portrait... series."\n
"Close-up Portrait... series."\n
[...]
"Close-up Portrait... series."\n

## Notes:

- Each line must be valid JSON when wrapped in quotes
- No blank lines between prompts
- No extra characters or spaces at start/end of lines
- Numbers must be followed by period and space
- All prompts must be enclosed in quotation marks
- Each prompt must end with the composition reminder
`

const masterPrompt = `
# NFT Portrait Generator System

You are a portrait prompt generator. Generate exactly 50 unique portrait prompts following this exact format. Each prompt must be on a new line and follow this structure:

[NUMBER]. "Close-up Portrait of head only, Freysa has [FACEPAINT] facepaint with [PATTERN] that [MAGICAL_EFFECT], [HEADPIECE]. She has bright neon green bobbed hair and bangs. [EARRINGS]. Plain contrasting [BACKGROUND] background. [SPECIAL_ELEMENT]. Ensure the head and shoulders composition is consistent, with her slightly angled to the right for a cohesive portrait series."

${ideas}
`
export async function generateStylePrompts() {
  const completion = await response({
    model: "anthropic/claude-3.5-sonnet:beta",
    messages: [
      { role: "system", content: masterPrompt },
      {
        role: "user",
        content: "Generate 50 unique prompts, make then new line separated.",
      },
    ],
    toolChoice: undefined,
    tools: undefined,
  })

  const prompts = (completion.choices[0].message.content?.split("\n") ?? [])
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.match(/^\d+\.\s*"(.+)"$/)
      return match ? match[1] : line
    })

  return prompts
}
