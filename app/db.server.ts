import PocketBase from "pocketbase";
import { Block, Settings } from "./components/types";

// hard-code a unique key so we can look up the client when this module gets re-imported
export const database = new PocketBase(process.env.POCKETBASE_URL);
database.autoCancellation(false);

export interface WebsiteData {
  id: string;
  created: string;
  updated: string;
  content: {
    settings: Exclude<Settings, "favicon">;
    blocks: Block[];
  };
  collectionName: string;
  collectionId: string;
  created_by: string;
  published: boolean;
  favicon: string;
}