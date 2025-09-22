import {
  Box,
  Button,
  Container,
  Flex,
  Link,
  Text,
  useClipboard,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

function App() {
  const [transactions, setTransactions] = useState([]);

  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += tx.amount;
      } else if (tx.type === "expense") {
        acc.expense += tx.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const leaderboard = Object.values(
    transactions.reduce((acc, tx) => {
      if (tx.type === "income") {
        if (!acc[tx.pay_by]) {
          acc[tx.pay_by] = { name: tx.pay_by, total: 0, count: 0 };
        }
        acc[tx.pay_by].total += tx.amount;
        acc[tx.pay_by].count += 1;
      }
      return acc;
    }, {})
  )
    .sort((a, b) => {
      if (b.total === a.total) {
        return b.count - a.count;
      }
      return b.total - a.total;
    })
    .slice(0, 3);

  const ballance = totals.income - totals.expense;
  const income = totals.income;
  const expense = totals.expense;
  const accountNumber = "3801989703";

  const { onCopy, hasCopied } = useClipboard(accountNumber);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        const mappedData = data.map((item) => ({
          ...item,
          date: new Date(item.date),
        }));
        setTransactions(mappedData);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Container maxW="sm" py={4}>
      <Box>
        <Box textAlign={"center"} mb={4}>
          <Link href="http://wa.me/6282285598500" target="_blank">
            WA: Syahrizal Ardana
          </Link>
        </Box>
        <Flex
          w={"full"}
          mb={2}
          p={4}
          bg="blue.500"
          borderRadius={"md"}
          justifyContent={"space-between"}
          alignItems="center"
          color={"whiteAlpha.900"}
        >
          <Box>
            <Text fontWeight={"medium"} fontSize={"lg"} mb={1}>
              {accountNumber}
            </Text>
            <Text fontSize={"sm"}>
              BCA - A/N <br /> Muhammad Syahrizal Putra
            </Text>
          </Box>

          <Button onClick={onCopy}>{hasCopied ? "Copied!" : "Copy"}</Button>
        </Flex>

        <Flex
          gap={2}
          justifyContent={"space-around"}
          mb={2}
          color={"whiteAlpha.900"}
        >
          <Box
            textAlign={"center"}
            flex={1}
            bg={"green.300"}
            p={4}
            borderRadius={"md"}
          >
            <Text fontWeight={"medium"} fontSize={"lg"}>
              {formatRupiah(income)}
            </Text>
            <Text>Income</Text>
          </Box>
          <Box
            textAlign={"center"}
            flex={1}
            bg={"red.300"}
            p={4}
            borderRadius={"md"}
          >
            <Text fontWeight={"medium"} fontSize={"lg"}>
              {formatRupiah(expense)}
            </Text>
            <Text>Expense</Text>
          </Box>
        </Flex>

        <Flex
          gap={4}
          justifyContent={"space-around"}
          mb={2}
          p={4}
          bg="blue.500"
          borderRadius={"md"}
          color={"whiteAlpha.900"}
        >
          <Box textAlign={"center"} flex={1}>
            <Text fontWeight={"medium"} fontSize={"lg"}>
              {formatRupiah(ballance)}
            </Text>
            <Text>Ballance</Text>
          </Box>
        </Flex>
      </Box>

      {leaderboard.length === 0 ? null : (
        <Box position={"sticky"} top={0} zIndex={10} pt={2} pb={1} bg={"white"}>
          <Text fontWeight={"medium"} mb={2}>
            Top 3 Contributors
          </Text>
          <Box bg="white" mb={4} borderRadius={"md"}>
            {leaderboard.map((item, idx) => (
              <Flex
                key={item.name}
                justifyContent={"space-between"}
                alignItems="center"
                mb={idx === leaderboard.length - 1 ? 0 : 4}
              >
                <Box>
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {item.count} transaction{item.count > 1 ? "s" : ""}
                  </Text>
                </Box>
                <Box alignSelf={"end"}>
                  <Text fontSize={"sm"}>{formatRupiah(item.total)}</Text>
                </Box>
              </Flex>
            ))}
          </Box>
        </Box>
      )}
      <Box bg="white">
        {transactions.length === 0 ? (
          <Box>
            <Text textAlign={"center"} color="gray.500" py={10}>
              No transactions yet.
            </Text>
          </Box>
        ) : (
          transactions.map((item) => (
            <TransactionItem key={item.id} {...item} />
          ))
        )}
      </Box>
    </Container>
  );
}

const TransactionItem = ({ amount, pay_by, date, type }) => {
  return (
    <Flex
      justifyContent={"space-between"}
      alignItems="center"
      mb={4}
      p={2}
      borderRadius="md"
      borderStart={"8px solid"}
      borderStartColor={type === "income" ? "green.300" : "red.300"}
    >
      <Box ms={4}>
        <Text fontWeight="medium" mb={2}>
          {formatRupiah(amount)}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {pay_by}
        </Text>
      </Box>
      <Box alignSelf={"end"}>
        <Text fontSize={"sm"} color="gray.500">
          {new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(date)}
        </Text>
      </Box>
    </Flex>
  );
};

export default App;
