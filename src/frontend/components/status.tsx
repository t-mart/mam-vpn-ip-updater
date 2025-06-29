import type { GetStateResponseBody } from "#backend/types.ts";

import { cn } from "#frontend/lib/cn.ts";

import { Section } from "./section";

export function Status({ data }: Readonly<{ data: GetStateResponseBody }>) {
  return (
    <Section className="space-y-2">
      <h2 className="sr-only">Status</h2>
      <dl className="w-full space-y-2">
        <div className="flex gap-4 items-center w-full">
          <dt className="mr-auto">State</dt>
          <dd className="ml-auto font-bold">
            <StatusContent data={data} />
          </dd>
        </div>
        <div className="flex gap-4 items-center w-full">
          <dt className="mr-auto">Host IP</dt>
          <dd className="ml-auto font-bold">{data.hostIp}</dd>
        </div>
      </dl>
      <details className="text-center w-full">
        <summary className="cursor-pointer hover:text-primary-2 text-muted-foreground">
          Show State Response
        </summary>
        <div className="text-left max-h-30 overflow-y-auto p-2 border-2 rounded-md mt-2">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(data, undefined, 2)}
          </pre>
        </div>
      </details>
    </Section>
  );
}

function StatusContent({ data }: Readonly<{ data: GetStateResponseBody }>) {
  if (!data.currentCookie) {
    return <StatusLine state="warn" text="No cookie set" />;
  } else if (data.lastMam) {
    return (
      <StatusLine
        state={data.lastMam.response.body.Success ? "ok" : "error"}
        text={data.lastMam.response.body.msg}
      />
    );
  } else {
    return <StatusLine state="warn" text="Pending check" />;
  }
}

type State = "ok" | "error" | "warn";

function StatusLine({ state, text }: Readonly<{ state: State; text: string }>) {
  const styleClass =
    state === "ok"
      ? "text-success"
      : state === "error"
      ? "text-destructive"
      : "text-warn";
  return (
    <div className="flex items-center gap-x-2">
      <span className={cn(styleClass)}>{text}</span>
      <svg className={cn("size-5 rounded-full shrink-0", styleClass)}>
        <circle cx="50%" cy="50%" r="50%" fill="currentColor" />
      </svg>
    </div>
  );
}
