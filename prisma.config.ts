import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawUrl = process.env.DATABASE_URL || "";
const directUrl = rawUrl
  .replace("-pooler", "")
  .replace("&channel_binding=require", "")
  .replace("?channel_binding=require", "?");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl || rawUrl,
  },
});
