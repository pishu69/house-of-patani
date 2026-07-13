const SENTENCE_END = /[.!?।॥。！？](?:["'”’»)]*)/u;
const TRAILING_PUNCTUATION = /[.,!?;:…।॥。！？]+$/u;

interface ProductShareDescriptionInput {
  description?: string;
  longDescription?: string;
  productName: string;
  shortDescription?: string | undefined;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
};

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi,
    (entity, key: string) => {
      if (key.startsWith("#")) {
        const hexadecimal = key[1]?.toLowerCase() === "x";
        const codePoint = Number.parseInt(key.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
        if (Number.isSafeInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
          try {
            return String.fromCodePoint(codePoint);
          } catch {
            return " ";
          }
        }
        return " ";
      }

      return NAMED_ENTITIES[key.toLowerCase()] ?? entity;
    },
  );
}

export function sanitizeShareDescription(value?: string) {
  return decodeHtmlEntities(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function firstCompleteSentence(value: string) {
  const match = SENTENCE_END.exec(value);
  return match ? value.slice(0, match.index + match[0].length).trim() : "";
}

function shortenAtWordBoundary(value: string, targetLength = 150) {
  const characters = Array.from(value);
  if (characters.length <= targetLength) return value;

  const availableCharacters = targetLength - 1;
  const prefix = characters.slice(0, availableCharacters).join("");
  const lastWhitespace = prefix.search(/\s+\S*$/u);
  const shortened = (lastWhitespace > 0 ? prefix.slice(0, lastWhitespace) : "")
    .trimEnd()
    .replace(TRAILING_PUNCTUATION, "");

  return shortened ? `${shortened}…` : "…";
}

export function getProductShareDescription({
  description,
  longDescription,
  productName,
  shortDescription,
}: ProductShareDescriptionInput) {
  const sanitizedShortDescription = sanitizeShareDescription(shortDescription);
  const sanitizedDescription = sanitizeShareDescription(description);
  const sanitizedLongDescription = sanitizeShareDescription(longDescription);
  const candidate =
    firstCompleteSentence(sanitizedShortDescription) ||
    sanitizedShortDescription ||
    firstCompleteSentence(sanitizedDescription) ||
    firstCompleteSentence(sanitizedLongDescription) ||
    sanitizedDescription ||
    sanitizedLongDescription ||
    `Discover ${productName} from House of Patani.`;

  return shortenAtWordBoundary(candidate);
}
