import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "summary.prisma",
  datasource: {
    url: "localhost",
  },
});
