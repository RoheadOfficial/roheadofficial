import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ✅ fix pino-http typing issue
const httpLogger = (pinoHttp as unknown as any)({
  logger,
  serializers: {
    req(req: any) { // ✅ fix TS7006
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: any) { // ✅ fix TS7006
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

app.use(httpLogger);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
