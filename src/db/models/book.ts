import mongoose from "mongoose";

interface BookAttrs {
  book: string;
  author: string;
  publisher: string;
  cover: string;
  price: number;
}

interface BookDoc extends mongoose.Document {
  book: string;
  author: string;
  publisher: string;
  cover: string;
  price: number;
}

interface BookModel extends mongoose.Model<BookDoc> {
  build(attrs: BookAttrs): BookDoc;
}

const bookSchema = new mongoose.Schema(
  {
    book: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,

    },
    publisher: {
      type: String,

    },
    cover: {
      type: String,
  
    },
    price: {
      type: Number,
 
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

bookSchema.statics.build = (attrs: BookAttrs) => {
  return new Book(attrs);
};

const Book = mongoose.model<BookDoc, BookModel>("Books", bookSchema);

export { Book };
