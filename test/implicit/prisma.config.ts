import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "implicit.prisma",
  datasource: {
    url: "localhost",
  },
});
