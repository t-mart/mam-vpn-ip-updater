import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ComponentPropsWithRef } from "react";

import type {
  ErrorResponseBody,
  GetStateResponseBody,
} from "#backend/types.ts";

import { version } from "../../../package.json";
import { Cookie } from "./cookie";
import { ButtonLink, Link } from "./link";
import { Spinner } from "./spinner";
import { Status } from "./status";
import { Timer } from "./timer";

export const stateQueryKey: readonly [string] = ["state"];

export function App() {
  return (
    <div className="mx-auto my-0 p-8 text-center relative z-10 space-y-8 max-w-prose">
      <header className="space-y-2">
        <h1 className="font-bold text-5xl">Mousehole</h1>
        <p>
          Keep your{" "}
          <Link href="https://www.myanonamouse.net/" target="_blank">
            Myanonamouse
          </Link>{" "}
          seedbox IP updated.
        </p>
      </header>
      <StateSections />
      <footer className="@container space-y-2">
        <ol className="flex justify-between flex-col @xs:flex-row flex-wrap gap-2">
          <li>
            <Link
              href="https://www.myanonamouse.net/f/t/84712/p/p1013257"
              target="_blank"
            >
              Forum Post
            </Link>
          </li>
          <li>
            <Link href="https://github.com/t-mart/mousehole" target="_blank">
              GitHub
            </Link>
          </li>
          <li>
            <Link
              href="https://hub.docker.com/r/tmmrtn/mousehole"
              target="_blank"
            >
              Docker Hub
            </Link>
          </li>
        </ol>
        <div>
          Mousehole v{version} by{" "}
          <Link href="https://www.myanonamouse.net/u/252061" target="_blank">
            timtimtim
          </Link>
        </div>
      </footer>
    </div>
  );
}

function StateSections() {
  // const queryClient = useQueryClient();

  const [userWantsInputCookie, setUserWantsInputCookie] = useState(false);

  const stateQuery = useQuery({
    queryKey: stateQueryKey,
    queryFn: async () => {
      const response = await fetch("/state");
      const body = (await response.json()) as
        | GetStateResponseBody
        | ErrorResponseBody;
      if (!response.ok) {
        throw new Error(
          `Bad response from GET /state: ${response.status} - ${body}`
        );
      }
      return body as GetStateResponseBody;
    },
  });
  useInvalidateOnUpdate();

  if (stateQuery.isPending) {
    return (
      <Center>
        <Spinner className="size-32" />
      </Center>
    );
  }

  if (stateQuery.isError) {
    return (
      <Center>
        <p className="text-destructive">
          Error fetching state: {stateQuery.error.message || "Unknown error"}
        </p>
      </Center>
    );
  }

  const data = stateQuery.data;

  const showCookieForm =
    userWantsInputCookie ||
    !data.currentCookie ||
    (data.lastMam?.response.body.Success === false &&
      data.lastMam?.response.body.msg !== "Last Change too recent");

  return (
    <div className="space-y-8">
      <main className="space-y-4">
        <Status data={data} key={`status-${data.lastUpdate?.at}`} />
        {showCookieForm ? (
          <Cookie
            onUpdated={() => setUserWantsInputCookie(false)}
            currentCookie={data.currentCookie}
          />
        ) : (
          <>
            <Timer data={data} key={`timer-${data.lastUpdate?.at}`} />
            <div className="flex items-center justify-center gap-4">
              <ButtonLink
                onClick={() => setUserWantsInputCookie(true)}
                variant={"muted-primary-2"}
              >
                Set Cookie
              </ButtonLink>
              <ButtonLink
                variant={"muted-primary-2"}
                onClick={() => fetch("/update", { method: "POST" })}
              >
                Check Now
              </ButtonLink>
            </div>
          </>
        )}
      </main>

      {!showCookieForm && (
        <aside>
          <p className="text-sm text-muted-foreground text-balance">
            You don't need to keep this window open! Automatic updates will
            occur on the server.
          </p>
        </aside>
      )}
    </div>
  );
}

function Center({ ...props }: Readonly<ComponentPropsWithRef<"div">>) {
  return <div {...props} className="flex items-center justify-center" />;
}

const useInvalidateOnUpdate = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const websocket = new WebSocket("/web/ws");

    websocket.addEventListener("message", () => {
      queryClient.invalidateQueries({ queryKey: stateQueryKey });
    });

    return () => {
      websocket.close();
    };
  }, []);
};

export default App;
