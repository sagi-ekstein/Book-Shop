import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";
import cookieSession from "cookie-session";
import { Server } from "@overnightjs/core";
import { errorHandler } from "./middlewares/errorHandler";
import { AuthController } from "./controllers/auth";
import { AppLogger } from "./models/Logger";
import { BookController } from "./controllers/book";

export class ServerApp extends Server {
  constructor() {
    super(true);
    this.app.use(morgan("tiny"));
    this.app.use(bodyParser.json());
    this.app.use(cors({ origin: true, credentials: true }));
    this.app.use(
      cookieSession({
        keys: ["secret"],
        signed: false,
        secure: false,
        httpOnly: true,
      })
    );
    this.setupControllers();

    if (process.env.NODE_ENV === "production") {
      this.app.use(
        express.static(path.join(__dirname, "..", "client", "build"))
      );
      this.app.get("/*", (req, res) => {
        res.sendFile(
          path.join(__dirname, "..", "client", "build", "index.html")
        );
      });
    }
    this.app.use(errorHandler);
  }

  private setupControllers(): void {
    const authController = new AuthController();
    const booksController = new BookController();
    super.addControllers([authController, booksController]);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      AppLogger.getLogger().info(`App running on port: ${port}!!!`);
    });
  }
}
