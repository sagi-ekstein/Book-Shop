import mongoose from "mongoose";
import {
  ClassMiddleware,
  Controller,
  Middleware,
  Get,
  Post,
  Delete,
  Patch,
} from "@overnightjs/core";
import { Request, Response } from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../middlewares/validationError";
import { requireAuth } from "./../middlewares/require-auth";
import { BadRequestError } from "../errors/badRequest";
import { currentUser } from "../middlewares/current-user";
import { Book } from "../db/models/book";
import { User } from "../db/models/user";
import { Logger } from "@overnightjs/logger";

@Controller("api/books")
@ClassMiddleware([currentUser, requireAuth])
export class BookController {
  @Get()
  private async getBooks(req: Request, res: Response) {
    const books = await Book.find();
    res.status(200).send(books);
  }

  @Get("purchase")
  private async getPurchasesBooks(req: Request, res: Response) {
    const id = req.currentUser?.id;
    const books = await User.findOne({ _id: id }).populate("purchasedBooks");
    res.status(200).send(books ? books.purchasedBooks : []);
  }

  @Get(":book")
  private async searchBooks(req: Request, res: Response) {
    const { book } = req.params;
   
    const books = await Book.find({
      book: { $regex: `/${book}/` },
    });
    Logger.Info(`book: ${JSON.stringify(books)}`);
    res.status(200).send(books);
  }

  @Post("create")
  @Middleware([
    body("book").isString().withMessage("Book name must be provided"),
    body("author").isString().withMessage("Author must be provided"),
    body("publisher").isString().withMessage("Publisher name must be provided"),
    validateRequest,
  ])
  private async createBook(req: Request, res: Response) {
    const { book, author, publisher, cover, price  } = req.body;

    const newBook = Book.build({ book, author, publisher, cover, price });
    await newBook.save();

    res.status(201).send(newBook);
  }

  @Post("purchase")
  @Middleware([
    body("bookId").isString().withMessage("BookId must be provided"),
    validateRequest,
  ])
  private async purchaseBook(req: Request, res: Response) {
    const { bookId } = req.body;
    const currentUser = await User.findOne({ _id: req.currentUser!.id });
    if (!currentUser) {
      throw new BadRequestError("Cannot find user");
    }
    const isInArray = currentUser.purchasedBooks.some(function (
      book: mongoose.Types.ObjectId
    ) {
      return book.equals(bookId);
    });
    if (isInArray) {
      throw new Error("You have already purchased this book");
    }

    await User.updateOne(
      { _id: req.currentUser?.id },
      {
        $push: {
          purchasedBooks: bookId,
        },
      }
    );
    res.status(201).send("Purched successufly");
  }

  @Delete(":bookId")
  @Middleware([
    param("bookId").isString().withMessage("BookId must be provided"),
    validateRequest,
  ])
  private async deleteBook(req: Request, res: Response) {
    const { bookId } = req.params;
    const doc = await Book.findOneAndRemove({ _id: bookId });
    res.send(doc ? "Book was deleted sucessufly" : {});
  }

  @Patch()
  @Middleware([
    body("id").isString().withMessage("Publisher name must be provided"),
    body("book").isString().withMessage("Book name must be provided"),
    body("author").isString().withMessage("Author must be provided"),
    body("publisher").isString().withMessage("Publisher name must be provided"),
    validateRequest,
  ])
  private async updateBook(req: Request, res: Response) {
    const { id, book, author, publisher } = req.body;
    const newBook = await Book.findOneAndUpdate(
      { _id: id },
      { $set: { book, author, publisher } },
      { new: true }
    );
    res.status(202).send(newBook);
  }
}
