import { data } from "@/pages/data.ts";
import { Box, Button, Flex, Pill, PillGroup, Select, Table, Text, Title, useMantineTheme } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

export type MakeNullish<TObject extends Record<any, any>> = {
  [TKey in keyof TObject]?: TObject[TKey] | null | undefined;
};

const TAGS_EACH_ANIME = 20;
const MAX_GUESSES = 20;

type ComparisonItem = {
  value: string | number;
  result?: "=" | "<" | ">";
};

export type Anime = MakeNullish<{
  mal_id: number;
  url: string;
  approved: boolean;
  titles: { title: string; type: string }[];
  title: string;
  type: string;
  source: string;
  episodes: number;
  status: string;
  airing: boolean;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  season: string;
  year: number;
  producers: string[];
  licensors: string[];
  studios: string[];
  genres: string[];
  explicit_genres: string[];
  themes: string[];
  demographics: string[];
  comparisons: {
    episodes: ComparisonItem;
    score: ComparisonItem;
    season: ComparisonItem;
    source: ComparisonItem;
    year: ComparisonItem;
    producers: ComparisonItem[];
    studios: ComparisonItem[];
    genres: ComparisonItem[];
    themes: ComparisonItem[];
  };
}>;

const createListComparison = (
  target: string[] | undefined | null,
  matching: string[] | undefined | null,
): ComparisonItem[] => {
  target = target || [];
  matching = matching || [];
  const matchingItems = matching.filter((item) => target.includes(item));
  const unmatchingItems = matching.filter((item) => !target.includes(item));
  const result = [...matchingItems, ...unmatchingItems].slice(0, TAGS_EACH_ANIME);
  return result.map((item) => ({ value: item, result: target.includes(item) ? "=" : undefined }));
};

const createNumberComparison = (
  target: number | undefined | null,
  matching: number | undefined | null,
): ComparisonItem => {
  if (!matching || !target) return { value: "" };
  target = Number(target.toFixed(2));
  matching = Number(matching.toFixed(2));
  if (matching > target) return { value: matching, result: ">" };
  if (matching < target) return { value: matching, result: "<" };
  return { value: matching, result: "=" };
};

const createEqualComparison = (
  target: number | string | undefined | null,
  matching: number | string | undefined | null,
): ComparisonItem => {
  target = target || "";
  matching = matching || "";
  return {
    value: matching,
    result: target === matching ? "=" : undefined,
  };
};

const createComparisons = (target: Anime, matching: Anime): Anime => {
  return {
    ...matching,
    comparisons: {
      episodes: createNumberComparison(target.episodes, matching.episodes),
      year: createNumberComparison(target.year, matching.year),
      score: createNumberComparison(target.score, matching.score),
      season: createEqualComparison(target.season, matching.season),
      source: createEqualComparison(target.source, matching.source),
      producers: createListComparison(target.producers, matching.producers),
      studios: createListComparison(target.studios, matching.studios),
      genres: createListComparison(target.genres, matching.genres),
      themes: createListComparison(target.themes, matching.themes),
    },
  };
};

const titles = data.map((item) => item.title || "");

export default function IndexPage() {
  const [input, setInput] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Anime[]>([]);
  const [answer, setAnswer] = useState<Anime | null>();
  const [correct, setCorrect] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"win" | "lose" | undefined>();

  const availableTitles = useMemo(() => {
    if (guesses.length === 0) return titles;
    return titles.filter((title) => !guesses.some((item) => item.title === title));
  }, [guesses]);

  const guess = (title?: string): boolean => {
    if (!answer || !title) return false;
    let guessed: Anime | undefined = data.find((item) => item.title === title);
    if (!guessed) return false;
    guessed = createComparisons(answer, guessed);
    setGuesses((prev) => [guessed!, ...prev]);
    setInput(null);
    if (guessed?.title === answer?.title) {
      setCorrect(true);
      return true;
    }
    return false;
  };

  const reset = () => {
    setAnswer(data[Math.floor(Math.random() * data.length)]);
    setGuesses([]);
    setCorrect(false);
    setGameState(undefined);
  };

  const giveUp = () => {
    setGameState("lose");
    guess(answer?.title || "");
  };

  const handleSubmit = () => {
    const win = guess(input || "");
    if (win) {
      setGameState("win");
      return;
    }
    if (guesses.length + 1 >= MAX_GUESSES) {
      giveUp();
    }
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <Flex maw={1200} w="100%" mx="auto" p="md" gap="md" direction="column">
      <Title ta="center">Anidle</Title>
      <Flex align="center" justify="space-between" gap="xs">
        {gameState ? (
          <Text fw={600} c={gameState === "lose" ? "red" : "green"}>
            You {gameState}
          </Text>
        ) : !guesses?.length ? (
          <Text span fw={600}>
            Type your first guess to begin the game.
          </Text>
        ) : (
          <div></div>
        )}
        <Flex align="center" justify="flex-end" gap="xs">
          <Text fw={600}>
            Guess: {gameState === "lose" ? guesses.length - 1 : guesses.length} / {MAX_GUESSES}
          </Text>
          {!correct && (
            <Button variant="outline" color="red" onClick={giveUp} style={{ flexShrink: 0 }}>
              Give up
            </Button>
          )}
        </Flex>
      </Flex>
      {correct ? (
        <Button onClick={reset}>Play again</Button>
      ) : (
        <Flex
          component="form"
          gap="md"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Select
            searchable
            flex={1}
            placeholder="Type your answer"
            data={availableTitles}
            limit={100}
            value={input}
            onChange={(value) => setInput(value)}
            disabled={correct}
          />
          <Button type="submit" disabled={correct}>
            Guess
          </Button>
        </Flex>
      )}
      {!!guesses.length && (
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Box component="colgroup">
              <Box component="col" span={1} w="12.5%" />
              <Box component="col" span={1} w="7.5%" />
              <Box component="col" span={1} w="7.5%" />
              <Box component="col" span={1} w="7.5%" />
              <Box component="col" span={1} w="12.5%" />
              <Box component="col" span={1} w="12.5%" />
              <Box component="col" span={1} w="12.5%" />
              <Box component="col" span={1} w="12.5%" />
              <Box component="col" span={1} w="7.5%" />
              <Box component="col" span={1} w="7.5%" />
            </Box>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Year</Table.Th>
                <Table.Th>Season</Table.Th>
                <Table.Th>Episodes</Table.Th>
                <Table.Th>Genres</Table.Th>
                <Table.Th>Themes</Table.Th>
                <Table.Th>Studios</Table.Th>
                <Table.Th>Producers</Table.Th>
                <Table.Th>Source</Table.Th>
                <Table.Th>Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {guesses.map((item, index) => {
                const isCorrect = index === 0 && correct;
                return (
                  <Table.Tr key={item.title} c={isCorrect ? "green" : undefined}>
                    <Table.Td>
                      <Text
                        component="a"
                        href={item.url || ""}
                        target="_blank"
                        span
                        size="sm"
                        role="button"
                        td="dotted"
                        style={{ cursor: "pointer" }}
                      >
                        <Text span mr={4}>
                          {item.title}
                        </Text>
                        <IconSearch style={{ display: "inline" }} size={14} />
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <TextComparison item={item.comparisons?.year} />
                    </Table.Td>
                    <Table.Td>
                      <TextComparison item={item.comparisons?.season} />
                    </Table.Td>
                    <Table.Td>
                      <TextComparison item={item.comparisons?.episodes} />
                    </Table.Td>
                    <Table.Td>
                      <ListComparison item={item.comparisons?.genres} />
                    </Table.Td>
                    <Table.Td>
                      <ListComparison item={item.comparisons?.themes} />
                    </Table.Td>
                    <Table.Td>
                      <ListComparison item={item.comparisons?.studios} />
                    </Table.Td>
                    <Table.Td>
                      <ListComparison item={item.comparisons?.producers} />
                    </Table.Td>
                    <Table.Td>
                      <TextComparison item={item.comparisons?.source} />
                    </Table.Td>
                    <Table.Td>
                      <TextComparison item={item.comparisons?.score} />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Flex>
  );
}

const TextComparison = (props: { item?: ComparisonItem }) => {
  const theme = useMantineTheme();
  return (
    <Flex gap={4} align="center">
      <Text span size="sm" c={props.item?.result === "=" ? "green" : undefined} style={{ flexShrink: 0 }}>
        {props.item?.value}
      </Text>
      {props.item?.result === "<" && <IconArrowUp size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />}
      {props.item?.result === ">" && <IconArrowDown size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />}
    </Flex>
  );
};

const ListComparison = (props: { item?: ComparisonItem[] }) => {
  return (
    <PillGroup gap={4}>
      {props.item?.map((tag, i) => (
        <Pill key={tag + "|" + i} c={tag.result === "=" ? "green" : undefined}>
          {tag.value}
        </Pill>
      ))}
    </PillGroup>
  );
};
