import mongoose from "mongoose";
import { Password } from "../../services/password";

interface UserAttrs {
  email: string;
  password: number;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  admin: boolean;
  purchasedBooks: [];
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    purchasedBooks: {
      type: [{ type: mongoose.Types.ObjectId, ref: "Books" }],
      default: [],
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("Users", userSchema);

export { User };
