import { Password } from "./../services/password";
import { Controller, Middleware, Get, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest } from "../middlewares/validationError";
import { BadRequestError } from "../errors/badRequest";
import { User } from "../db/models/user";
import { currentUser } from "../middlewares/current-user";
import { AppLogger } from "../models/Logger";

@Controller("api/users")
export class AuthController {
  @Get("currentuser")
  @Middleware(currentUser)
  private async currentUser(req: Request, res: Response) {
    res.send({ currentUser: req.currentUser || null });
  }

  @Post("signin")
  @Middleware([
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim().isLength({ min: 6, max: 20 }).withMessage("Password must be between 6 and 20 characters"), validateRequest, ])
  private async signin(req: Request, res: Response) {
    AppLogger.getLogger().info(`signin request made:\n ${JSON.stringify(req.body)}`);
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Can not find user");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        admin: existingUser.admin,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }

  @Post("signup")
  @Middleware([
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 6, max: 20 })
      .withMessage("Password must be between 6 and 20 characters"),
    validateRequest,
  ])
  private async signup(req: Request, res: Response) {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT for user
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        admin: user.admin,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }

  @Post("signout")
  private async signout(req: Request, res: Response) {
    req.session = null;
    res.send({});
  }
}
