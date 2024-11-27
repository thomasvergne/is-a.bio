import PocketBase from "pocketbase";
import { Block, Settings } from "./components/blocks";

// hard-code a unique key so we can look up the client when this module gets re-imported
export const database = new PocketBase(process.env.POCKETBASE_URL);

export interface WebsiteData {
  id: string;
  created: string;
  updated: string;
  content: {
    settings: Settings;
    blocks: Block[];
  };
  collectionName: string;
  collectionId: string;
  created_by: string;
  published: boolean;
}