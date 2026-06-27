"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { server, CONTRACT_ADDRESS } from "@/lib/client";
import type { ContractEvent } from "@/types";

/** Parse an xdr.ScVal as a string value */
function scvString(v: any): string {
  if (!v) return "";
  try {
    if (v.sym) return String(v.sym());
    if (v.str) return String(v.str());
    if (v.bytes) return String(v.bytes());
    return String(v);
  } catch {
    return String(v ?? "");
  }
}

/** Parse an xdr.ScVal as a number/string */
function scvNumber(v: any): string {
  if (!v) return "0";
  try {
    if (typeof v === "bigint") return v.toString();
    if (typeof v === "number") return String(v);
    if (v._value) return String(v._value);
    if (v.low !== undefined && v.high !== undefined) {
      const low = Number(v.low);
      const high = Number(v.high);
      return String(BigInt(high) * BigInt(2) ** BigInt(32) + BigInt(low));
    }
    return String(v);
  } catch {
    return String(v ?? "0");
  }
}

export function useContractEvents(_limit = 50) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const cursorRef = useRef<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;

    setLoading(true);
    try {
      const params: any = {
        filters: [
          {
            type: "contract",
            contractIds: [CONTRACT_ADDRESS],
          },
        ],
        limit: 100,
      };

      if (cursorRef.current) {
        params.cursor = cursorRef.current;
      } else {
        params.startLedger = 1;
      }

      const response: any = await server.getEvents(params);

      if (response.events && response.events.length > 0) {
        const newEvents: ContractEvent[] = response.events
          .map((event: any) => {
            const topic = event.topic || [];
            const data = event.value;

            if (topic.length === 0 || !data) return null;

            const topicStr = scvString(topic[0]);
            const vals = Array.isArray(data) ? data : [data];

            if (topicStr.includes("product_registered")) {
              return {
                type: "ProductRegistered" as const,
                data: {
                  product_id: scvNumber(vals[0]),
                  manufacturer: scvString(vals[1]),
                  name: scvString(vals[2]),
                },
              };
            }
            if (topicStr.includes("checkpoint_scanned")) {
              return {
                type: "CheckpointScanned" as const,
                data: {
                  product_id: scvNumber(vals[0]),
                  handler: scvString(vals[1]),
                  location: scvString(vals[2]),
                  checkpoint_id: Number(scvNumber(vals[3])),
                },
              };
            }
            if (topicStr.includes("product_transferred")) {
              return {
                type: "ProductTransferred" as const,
                data: {
                  product_id: scvNumber(vals[0]),
                  from: scvString(vals[1]),
                  to: scvString(vals[2]),
                },
              };
            }
            if (topicStr.includes("product_verified")) {
              return {
                type: "ProductVerified" as const,
                data: {
                  product_id: scvNumber(vals[0]),
                  inspector: scvString(vals[1]),
                  status: scvString(vals[2]),
                },
              };
            }
            return null;
          })
          .filter(Boolean) as ContractEvent[];

        if (newEvents.length > 0) {
          setEvents((prev) => [...newEvents.reverse(), ...prev].slice(0, 100));
        }

        if (response.cursor) {
          cursorRef.current = response.cursor;
        }
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 10 seconds
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10_000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, refresh: fetchEvents };
}
