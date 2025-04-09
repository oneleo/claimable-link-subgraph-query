export const stringify = (info: any) =>
  JSON.stringify(
    info,
    (_, value) => {
      return typeof value === "bigint" ? value.toString() : value;
    },
    2
  );

type UnclaimedDeposit = {
  giver: string;
  token: string;
  transferID: string;
};

type UnclaimedDepositsResponse = {
  data: {
    depositClaimeds: UnclaimedDeposit[];
  };
};

// Playground:
// https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fapi.studio.thegraph.com%2Fquery%2F37898%2Fclaimable-link-subgraph%2Fversion%2Flatest&query=query+MyDepositClaimedsQuery+%7B%0A++depositClaimeds%28%0A++++where%3A+%7Bcancelled%3A+false%2C+claimed%3A+false%2C+refunded%3A+false%2C+giver%3A+%220x1234A72239ecbA742D9A00C6Bec87b5a4ABF481a%22%7D%0A++++first%3A+100%0A++++skip%3A+100%0A++%29+%7B%0A++++giver%0A++++token%0A++++transferID%0A++%7D%0A%7D%0A
export const queryDepositClaimedFromGiver = async (
  url: string,
  giver: string
): Promise<UnclaimedDepositsResponse> => {
  let allDepositClaimeds: UnclaimedDeposit[] = [];
  let skip = 0;
  const first = 100;

  while (true) {
    const query = `
    query MyDepositClaimedsQuery {
      depositClaimeds(
        where: {cancelled: false, claimed: false, refunded: false, giver: "${giver}"}
        first: ${first}
        skip: ${skip}
      ) {
        giver
        token
        transferID
      }
    }
    `;

    const response = (await queryGraph(
      url,
      query
    )) as UnclaimedDepositsResponse;

    // Subgraph returns max 100 records, need while loop to paginate
    if (!response || !response.data || !response.data.depositClaimeds.length) {
      break;
    }

    // Merge current page results into the accumulated data
    allDepositClaimeds = allDepositClaimeds.concat(
      response.data.depositClaimeds
    );

    // Increase skip value to query the next batch
    skip += first;
  }
  return {
    data: { depositClaimeds: allDepositClaimeds },
  } as UnclaimedDepositsResponse;
};

export const queryGraph = async (
  url: string,
  query: string
): Promise<any | null> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(`Query failure: ${result.errors}`);
    }
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Cannot query: ${errorMessage}`);
    return null;
  }
};
