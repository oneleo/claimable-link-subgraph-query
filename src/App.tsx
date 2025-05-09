import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import { queryDepositClaimedFromGiver, stringify } from "./util";

const SUBGRAPH_QUERY_URL = `https://api.studio.thegraph.com/query/37898/claimable-link-subgraph/version/latest`;

function App() {
  const [executing, setExecuting] = useState<string>(``);
  const [message, setMessage] = useState<string>(``);
  const [errorMessage, setErrorMessage] = useState<string>(``);

  const queryDepositClaimed = async () => {
    setExecuting(`Querying...`);
    try {
      const response = await queryDepositClaimedFromGiver(
        SUBGRAPH_QUERY_URL,
        `0x1234A72239ecbA742D9A00C6Bec87b5a4ABF481a`
      );

      for (const [
        index,
        unclaimedDeposits,
      ] of response.data.depositClaimeds.entries()) {
        const giver = unclaimedDeposits.giver;
        const token = unclaimedDeposits.token;
        const transferID = unclaimedDeposits.transferID;
        console.log(
          `Index: ${index}\nGiver: ${giver}\nToken: ${token}\nTransferID: ${transferID}`
        );
      }
      const linkNumber = response.data.depositClaimeds.length;
      const msg = `Number of links: ${linkNumber}\nQuery response: ${stringify(
        response
      )}`;

      console.log(`Refer: https://dune.com/irara/ethtaipeiarb-claimable-link`);
      setMessage(`${msg}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(errorMessage);
      setErrorMessage(errorMessage);
    }

    setExecuting(``);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div>
        {executing && (
          <div>
            <span>Status: </span>
            <span style={{ color: "white" }}>{executing}</span>
          </div>
        )}
        {errorMessage && (
          <div>
            <span>Error: </span>
            <span
              style={{
                color: "red",
                textAlign: "left",
              }}
            >
              {errorMessage}
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Claimable Link</h3>

        <button
          onClick={queryDepositClaimed}
          disabled={!!executing || !!errorMessage}
        >
          Query Unclaim Link
        </button>
      </div>

      <div className="card">
        Message:{" "}
        {message && (
          <pre
            style={{
              color: "white",
              textAlign: "left",
            }}
          >
            {message}
          </pre>
        )}
      </div>
    </>
  );
}

export default App;
