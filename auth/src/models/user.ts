import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface for properties of new User
interface UserAttributes {
  email: string;
  password: string;
}

// An interface describe for properties that User Model has (Collection)
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttributes): UserDocument;
}

// An interface describe for properties that User Document has
interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
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

userSchema.statics.build = (attrs: UserAttributes) => {
  return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export { User };
