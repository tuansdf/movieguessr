import { data } from "@/pages/data.ts";
import { Box, Button, Flex, Pill, PillGroup, Select, Table, Text, Title, useMantineTheme } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

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
}

const titles = data.map((item) => item.title);

const shuffleList = <T,>(items: T[], num?: number) => {
  if (!items) return [];
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  if (num) {
    return shuffled.slice(0, num);
  }
  return shuffled;
};

const TAGS_EACH_ANIME = 20;
const MAX_GUESSES = 20;

export default function IndexPage() {
  const theme = useMantineTheme();
  const [input, setInput] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<Movie[]>([]);
  const [answer, setAnswer] = useState<Movie | null>();
  const [correct, setCorrect] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"win" | "lose" | undefined>();

  const unguessedTitles = useMemo(() => {
    if (guesses.length === 0) return titles;
    return titles.filter((title) => !guesses.some((item) => item.title === title));
  }, [guesses]);

  const guess = (title?: string): boolean => {
    if (!answer || !title) return false;
    let guessed: Movie | undefined = data.find((item) => item.title === title);
    if (!guessed) return false;
    const shuffled = shuffleList(guessed.tags || []);
    let tags = shuffled.filter((item) => answer.tags?.includes(item));
    if (tags.length >= TAGS_EACH_ANIME) {
      tags = tags.slice(0, TAGS_EACH_ANIME);
    } else {
      tags = [
        ...tags,
        ...shuffled.filter((item) => !answer.tags?.includes(item)).slice(0, TAGS_EACH_ANIME - tags.length),
      ];
    }
    let studio = guessed.studios?.find((item) => answer.studios?.includes(item)) || "";
    if (!studio) {
      studio = guessed.studios?.[0] || "";
    }
    let producer = guessed.producers?.find((item) => answer.producers?.includes(item)) || "";
    if (!producer) {
      producer = guessed.producers?.[0] || "";
    }
    guessed = { ...guessed, tags, studios: [studio], producers: [producer] };
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
      <Flex align="center" justify="space-between" gap="md">
        {gameState ? (
          <Text fw={600} c={gameState === "lose" ? "red" : "green"}>
            You {gameState}
          </Text>
        ) : (
          <div></div>
        )}
        <Flex align="center" justify="flex-end" gap="md">
          <Text fw={600}>
            Guess: {gameState === "lose" ? guesses.length - 1 : guesses.length} / {MAX_GUESSES}
          </Text>
          {!correct && (
            <Button variant="outline" color="red" onClick={giveUp}>
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
            data={unguessedTitles}
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
              const year = item.animeSeason?.year || 0;
              const answerYear = answer?.animeSeason?.year || 0;
              const compareYear = year === answerYear ? 0 : year > answerYear ? 1 : -1;
              const score = item.score?.median || 0;
              const answerScore = answer?.score?.median || 0;
              const compareScore = score === answerScore ? 0 : score > answerScore ? 1 : -1;
              const episodes = item.episodes || 0;
              const answerEpisodes = answer?.episodes || 0;
              const compareEpisodes = episodes === answerEpisodes ? 0 : episodes > answerEpisodes ? 1 : -1;
              const url = new URL(`https://duckduckgo.com/?q=${item.title} site:myanimelist.net&ia=web`);
              return (
                <Table.Tr key={item.title} c={isCorrect ? "green" : undefined}>
                  <Table.Td>
                    <Text
                      component="a"
                      href={url.toString()}
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
                      <Text span size="sm" c={!compareYear ? "green" : undefined}>
                        {year}
                      </Text>
                      {compareYear < 0 && <IconArrowUp size={16} color={theme.colors.red[6]} />}
                      {compareYear > 0 && <IconArrowDown size={16} color={theme.colors.red[6]} />}
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={item.animeSeason?.season === answer?.animeSeason?.season ? "green" : undefined}>
                      {item.animeSeason?.season}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Flex gap={4} align="center">
                      <Text span size="sm" c={!compareEpisodes ? "green" : undefined}>
                        {episodes}
                      </Text>
                      {compareEpisodes < 0 && <IconArrowUp size={16} color={theme.colors.red[6]} />}
                      {compareEpisodes > 0 && <IconArrowDown size={16} color={theme.colors.red[6]} />}
                    </Flex>
                  </Table.Td>
                  <Table.Td>
                    <PillGroup gap={4}>
                      {item.tags?.map((tag, i) => (
                        <Pill key={tag + "|" + i} c={answer?.tags?.includes(tag) ? "green" : undefined}>
                          {tag}
                        </Pill>
                      ))}
                    </PillGroup>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={item.studios?.[0] === answer?.studios?.[0] ? "green" : undefined}>
                      {item.studios?.[0]}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={item.producers?.[0] === answer?.producers?.[0] ? "green" : undefined}>
                      {item.producers?.[0]}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Flex gap={4} align="center">
                      <Text span size="sm" c={!compareScore ? "green" : undefined}>
                        {score.toFixed(2)}
                      </Text>
                      {compareScore < 0 && <IconArrowUp size={16} color={theme.colors.red[6]} />}
                      {compareScore > 0 && <IconArrowDown size={16} color={theme.colors.red[6]} />}
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Flex>
  );
}
