import { data } from "@/pages/data.ts";
import { Box, Button, Flex, Pill, PillGroup, Select, Table, Text, Title, useMantineTheme } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const TAGS_EACH_ANIME = 20;
const MAX_GUESSES = 20;

type ComparisonItem = {
  value: string | number;
  result?: "=" | "<" | ">";
};

export interface Movie {
  title?: string;
  type?: string;
  episodes?: number;
  status?: string;
  animeSeason?: {
    season?: string;
    year?: number;
  };
  duration?: {
    value?: number;
    unit?: string;
  };
  score?: { arithmeticGeometricMean?: number; arithmeticMean?: number; median?: number };
  studios?: string[];
  producers?: string[];
  tags?: string[];
  comparison?: {
    studios?: ComparisonItem[];
    producers?: ComparisonItem[];
    tags?: ComparisonItem[];
    score?: ComparisonItem;
    episodes?: ComparisonItem;
    year?: ComparisonItem;
    season?: ComparisonItem;
  };
}

const createListComparison = (target: string[], matching: string[]): ComparisonItem[] => {
  const shuffled = [...matching].sort(() => Math.random() - 0.5);
  const matchingItems = shuffled.filter((item) => target.includes(item));
  const unmatchingItems = shuffled.filter((item) => !target.includes(item));
  const result = [...matchingItems, ...unmatchingItems].slice(0, TAGS_EACH_ANIME);
  return result.map((item) => ({ value: item, result: target.includes(item) ? "=" : undefined }));
};

const createNumberComparison = (target: number, matching: number): ComparisonItem => {
  target = Number(target.toFixed(2));
  matching = Number(matching.toFixed(2));
  if (matching > target) return { value: matching, result: ">" };
  if (matching < target) return { value: matching, result: "<" };
  return { value: matching, result: "=" };
};

const titles = data.map((item) => item.title || "");

export default function IndexPage() {
  const theme = useMantineTheme();
  const [input, setInput] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Movie[]>([]);
  const [answer, setAnswer] = useState<Movie | null>();
  const [correct, setCorrect] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"win" | "lose" | undefined>();

  const availableTitles = useMemo(() => {
    if (guesses.length === 0) return titles;
    return titles.filter((title) => !guesses.some((item) => item.title === title));
  }, [guesses]);

  const guess = (title?: string): boolean => {
    if (!answer || !title) return false;
    let guessed: Movie | undefined = data.find((item) => item.title === title);
    if (!guessed) return false;
    guessed = {
      ...guessed,
      comparison: {
        tags: createListComparison(answer.tags || [], guessed.tags || []),
        studios: createListComparison(answer.studios || [], guessed.studios || []),
        producers: createListComparison(answer.producers || [], guessed.producers || []),
        year: createNumberComparison(answer.animeSeason?.year || 0, guessed.animeSeason?.year || 0),
        episodes: createNumberComparison(answer.episodes || 0, guessed.episodes || 0),
        score: createNumberComparison(answer.score?.median || 0, guessed.score?.median || 0),
        season: {
          value: guessed.animeSeason?.season || "",
          result: answer.animeSeason?.season === guessed.animeSeason?.season ? "=" : undefined,
        },
      },
    };
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
              <Box component="col" span={1} w="15%" />
              <Box component="col" span={1} w="10%" />
              <Box component="col" span={1} w="10%" />
              <Box component="col" span={1} w="10%" />
              <Box component="col" span={1} w="25%" />
              <Box component="col" span={1} w="10%" />
              <Box component="col" span={1} w="10%" />
              <Box component="col" span={1} w="10%" />
            </Box>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Year</Table.Th>
                <Table.Th>Season</Table.Th>
                <Table.Th>Episodes</Table.Th>
                <Table.Th>Tags</Table.Th>
                <Table.Th>Studio</Table.Th>
                <Table.Th>Producer</Table.Th>
                <Table.Th>Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {guesses.map((item, index) => {
                const isCorrect = index === 0 && correct;
                const query = new URLSearchParams(`q=${item.title} site:myanimelist.net&ia=web`);
                const url = `https://duckduckgo.com/?${query.toString()}`;
                return (
                  <Table.Tr key={item.title} c={isCorrect ? "green" : undefined}>
                    <Table.Td>
                      <Text
                        component="a"
                        href={url}
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
                      <Flex gap={4} align="center">
                        <Text
                          span
                          size="sm"
                          c={item.comparison?.year?.result === "=" ? "green" : undefined}
                          style={{ flexShrink: 0 }}
                        >
                          {item.comparison?.year?.value}
                        </Text>
                        {item.comparison?.year?.result === "<" && (
                          <IconArrowUp size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                        {item.comparison?.year?.result === ">" && (
                          <IconArrowDown size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                      </Flex>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="sm"
                        c={item.animeSeason?.season === answer?.animeSeason?.season ? "green" : undefined}
                      >
                        {item.animeSeason?.season}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Flex gap={4} align="center">
                        <Text
                          span
                          size="sm"
                          c={item.comparison?.episodes?.result === "=" ? "green" : undefined}
                          style={{ flexShrink: 0 }}
                        >
                          {item.comparison?.episodes?.value}
                        </Text>
                        {item.comparison?.episodes?.result === "<" && (
                          <IconArrowUp size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                        {item.comparison?.episodes?.result === ">" && (
                          <IconArrowDown size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                      </Flex>
                    </Table.Td>
                    <Table.Td>
                      <PillGroup gap={4}>
                        {item.comparison?.tags?.map((tag, i) => (
                          <Pill key={tag + "|" + i} c={tag.result === "=" ? "green" : undefined}>
                            {tag.value}
                          </Pill>
                        ))}
                      </PillGroup>
                    </Table.Td>
                    <Table.Td>
                      <PillGroup gap={4}>
                        {item.comparison?.studios?.map((tag, i) => (
                          <Pill key={tag + "|" + i} c={tag.result === "=" ? "green" : undefined}>
                            {tag.value}
                          </Pill>
                        ))}
                      </PillGroup>
                    </Table.Td>
                    <Table.Td>
                      <PillGroup gap={4}>
                        {item.comparison?.producers?.map((tag, i) => (
                          <Pill key={tag + "|" + i} c={tag.result === "=" ? "green" : undefined}>
                            {tag.value}
                          </Pill>
                        ))}
                      </PillGroup>
                    </Table.Td>
                    <Table.Td>
                      <Flex gap={4} align="center">
                        <Text
                          span
                          size="sm"
                          c={item.comparison?.score?.result === "=" ? "green" : undefined}
                          style={{ flexShrink: 0 }}
                        >
                          {item.comparison?.score?.value}
                        </Text>
                        {item.comparison?.score?.result === "<" && (
                          <IconArrowUp size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                        {item.comparison?.score?.result === ">" && (
                          <IconArrowDown size={16} color={theme.colors.red[6]} style={{ flexShrink: 0 }} />
                        )}
                      </Flex>
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
